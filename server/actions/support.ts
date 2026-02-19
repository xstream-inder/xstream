'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import { formSubmitRateLimiter } from '@/lib/redis';
import { getClientIpHash, escapeHtml } from '@/lib/utils/security';

// Initialize Resend - only if API key is present
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// Validation Schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

interface State {
  success: boolean;
  message?: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
}

export async function submitContact(prevState: State, formData: FormData): Promise<State> {
  // Rate limiting
  try {
    const ipHash = await getClientIpHash();
    const { success: allowed } = await formSubmitRateLimiter.limit(`contact:${ipHash}`);
    if (!allowed) {
      return { success: false, message: 'Too many messages sent. Please try again later.' };
    }
  } catch {
    // Don't block the form if rate limiting service is down
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  // 1. Validate Form Data
  const validatedFields = contactSchema.safeParse({
    name,
    email,
    subject,
    message,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Please check the form for errors.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // 2. Send Email (Replace with your support email)
    const SUPPORT_EMAIL = 'support@eddythedaddy.com'; // Or your verified sender
    
    // In dev mode or if resend is not configured, skip sending
    if (resend && process.env.NODE_ENV === 'production') {
        await resend.emails.send({
        from: 'contact@eddythedaddy.com', // Must be a verified domain in Resend
        to: SUPPORT_EMAIL,
        replyTo: email,
        subject: `[Support] ${escapeHtml(subject)} - ${escapeHtml(name)}`,
        text: `
            Name: ${name}
            Email: ${email}
            Subject: ${subject}
            
            Message:
            ${message}
        `,
        });
    } else {
        console.log("Mock Email Sent:", { name, email, subject, message });
    }
    
    // 3. Optional: Store in DB if needed (prisma.ticket.create...)

    return {
      success: true,
      message: 'Message sent successfully!',
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      success: false,
      message: 'Failed to send message. Please try again later.',
    };
  }
}
