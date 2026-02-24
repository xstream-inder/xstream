import { Resend } from 'resend';

// Only initialize Resend if API key is present, otherwise use a mock/null client
// This prevents build/runtime crashes if the key is missing in production
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const sendVerificationEmail = async (
  email: string, 
  token: string
) => {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY missing. Email not sent.');
    return;
  }
  
  const confirmLink = `${domain}/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: 'noreply@connect.eddythedaddy.com',
    to: email,
    subject: 'Confirm your email - eddythedaddy',
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email.</p>`
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string
) => {
  if (!resend) {
     console.warn('⚠️ RESEND_API_KEY missing. Password reset email not sent.');
     return;
  }

  const resetLink = `${domain}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: 'noreply@connect.eddythedaddy.com',
    to: email,
    subject: 'Reset your password - eddythedaddy',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  });
};
