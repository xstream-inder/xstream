'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import { formSubmitRateLimiter } from '@/lib/redis';
import { getClientIpHash, escapeHtml } from '@/lib/utils/security';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

const DMCASchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  contentUrl: z.string().url('Invalid URL'),
  description: z.string().min(10, 'Please provide more details'),
  signature: z.string().min(2, 'Electronic signature required'),
  agreed: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms' }),
  }),
});

export async function submitDMCA(prevState: any, formData: FormData) {
  try {
    // Rate limiting
    const ipHash = await getClientIpHash();
    const { success: allowed } = await formSubmitRateLimiter.limit(`dmca:${ipHash}`);
    if (!allowed) {
      return { success: false, message: 'Too many submissions. Please try again later.' };
    }

    const rawData = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      contentUrl: formData.get('contentUrl'),
      description: formData.get('description'),
      signature: formData.get('signature'),
      agreed: formData.get('agreed') === 'on',
    };

    const validatedData = DMCASchema.parse(rawData);

    if (!resend) {
      console.warn('⚠️ RESEND_API_KEY missing. DMCA email not sent, but accepting submission.');
      return { success: true, message: 'DMCA request received. We will review it shortly.' };
    }

    await resend.emails.send({
      from: 'dmca@eddythedaddy.com', // Ensure this domain is verified in Resend
      to: ADMIN_EMAIL,
      subject: `DMCA Takedown Request from ${escapeHtml(validatedData.fullName)}`,
      html: `
        <h1>DMCA Takedown Request</h1>
        <p><strong>Name:</strong> ${escapeHtml(validatedData.fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(validatedData.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(validatedData.phone || 'N/A')}</p>
        <p><strong>Address:</strong> ${escapeHtml(validatedData.address)}</p>
        <hr />
        <p><strong>Content URL:</strong> <a href="${encodeURI(validatedData.contentUrl)}">${escapeHtml(validatedData.contentUrl)}</a></p>
        <p><strong>Description:</strong></p>
        <p>${escapeHtml(validatedData.description)}</p>
        <hr />
        <p><strong>Signature:</strong> ${escapeHtml(validatedData.signature)}</p>
        <p><em>User agreed to perjury statement.</em></p>
      `,
    });

    return { success: true, message: 'DMCA request submitted successfully.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, message: 'Failed to submit request. Please try again.' };
  }
}
