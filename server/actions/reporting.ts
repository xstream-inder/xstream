'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import { auth } from '@/lib/auth-helper';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

const ReportSchema = z.object({
  videoId: z.string().uuid(),
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().optional(),
});

export async function submitReport(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    
    // We allow anonymous reporting, but we log if user is logged in
    const reporterInfo = session?.user 
      ? `User: ${session.user.username} (${session.user.email})` 
      : 'Anonymous User';

    const rawData = {
      videoId: formData.get('videoId'),
      reason: formData.get('reason'),
      description: formData.get('description'),
    };

    const validatedData = ReportSchema.parse(rawData);

    await resend.emails.send({
      from: 'reports@xstream.dev', 
      to: ADMIN_EMAIL,
      subject: `🚨 Content Report: Video ${validatedData.videoId}`,
      html: `
        <h1>Content Report</h1>
        <p><strong>Reporter:</strong> ${reporterInfo}</p>
        <p><strong>Video ID:</strong> ${validatedData.videoId}</p>
        <p><strong>Reason:</strong> ${validatedData.reason}</p>
        <p><strong>Additional Details:</strong></p>
        <p>${validatedData.description || 'None provided'}</p>
        <hr />
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/video/${validatedData.videoId}">View Video</a></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/moderation">Go to Moderation Queue</a></p>
      `,
    });

    return { success: true, message: 'Report submitted. Thank you for helping keep our community safe.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, message: 'Failed to submit report. Please try again.' };
  }
}
