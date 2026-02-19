'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helper';
import { formSubmitRateLimiter } from '@/lib/redis';
import { getClientIpHash, escapeHtml } from '@/lib/utils/security';
import { revalidatePath } from 'next/cache';
import { ReportStatus } from '@prisma/client';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

const ReportSchema = z.object({
  videoId: z.string().uuid(),
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().optional(),
});

export async function submitReport(prevState: any, formData: FormData) {
  try {
    // Rate limiting
    const ipHash = await getClientIpHash();
    const { success: allowed } = await formSubmitRateLimiter.limit(`report:${ipHash}`);
    if (!allowed) {
      return { success: false, message: 'Too many reports submitted. Please try again later.' };
    }

    const session = await auth();
    
    const reporterInfo = session?.user 
      ? `User: ${session.user.username} (${session.user.email})` 
      : 'Anonymous User';

    const rawData = {
      videoId: formData.get('videoId'),
      reason: formData.get('reason'),
      description: formData.get('description'),
    };

    const validatedData = ReportSchema.parse(rawData);

    // Persist report to database
    await prisma.report.create({
      data: {
        videoId: validatedData.videoId,
        userId: session?.user?.id || null,
        reason: validatedData.reason,
        description: validatedData.description || null,
      },
    });

    // Also send email notification (non-blocking)
    if (resend) {
      resend.emails.send({
        from: 'reports@eddythedaddy.com', 
        to: ADMIN_EMAIL,
        subject: `Content Report: Video ${validatedData.videoId}`,
        html: `
          <h1>Content Report</h1>
          <p><strong>Reporter:</strong> ${escapeHtml(reporterInfo)}</p>
          <p><strong>Video ID:</strong> ${escapeHtml(validatedData.videoId)}</p>
          <p><strong>Reason:</strong> ${escapeHtml(validatedData.reason)}</p>
          <p><strong>Additional Details:</strong></p>
          <p>${escapeHtml(validatedData.description || 'None provided')}</p>
          <hr />
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/video/${encodeURIComponent(validatedData.videoId)}">View Video</a></p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/reports">Go to Moderation Queue</a></p>
        `,
      }).catch((err) => console.error('Report email failed:', err));
    }

    return { success: true, message: 'Report submitted. Thank you for helping keep our community safe.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, message: 'Failed to submit report. Please try again.' };
  }
}

// ============================================================================
// ADMIN MODERATION ACTIONS
// ============================================================================

const UpdateReportSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(['PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED']),
  adminNotes: z.string().optional(),
});

/**
 * Get all reports for admin moderation queue
 */
export async function getReports(
  page = 1,
  limit = 20,
  status?: string
) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const skip = (page - 1) * limit;
  const where = status && status !== 'ALL' ? { status: status as ReportStatus } : {};

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            status: true,
            user: { select: { username: true } },
          },
        },
        user: {
          select: { username: true, email: true },
        },
        reviewer: {
          select: { username: true },
        },
      },
    }),
    prisma.report.count({ where }),
  ]);

  return {
    reports,
    total,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Update report status (admin only)
 */
export async function updateReportStatus(
  reportId: string,
  status: string,
  adminNotes?: string
) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN' || !session.user.id) {
    throw new Error('Unauthorized');
  }

  const parsed = UpdateReportSchema.safeParse({ reportId, status, adminNotes });
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.errors[0]?.message}`);
  }

  await prisma.report.update({
    where: { id: parsed.data.reportId },
    data: {
      status: parsed.data.status,
      adminNotes: parsed.data.adminNotes || null,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath('/admin/reports');
  return { success: true };
}

/**
 * Get report count by status (for admin dashboard)
 */
export async function getReportCounts() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const [pending, reviewed, actioned, dismissed, total] = await Promise.all([
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'REVIEWED' } }),
    prisma.report.count({ where: { status: 'ACTIONED' } }),
    prisma.report.count({ where: { status: 'DISMISSED' } }),
    prisma.report.count(),
  ]);

  return { pending, reviewed, actioned, dismissed, total };
}
