'use server';

import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/mail';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { passwordResetRateLimiter } from '@/lib/redis';
import { getClientIpHash } from '@/lib/utils/security';

const ResetSchema = z.object({
  email: z.string().email(),
});

const NewPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  token: z.string().optional(),
});

export const resetPassword = async (email: string) => {
  const validatedFields = ResetSchema.safeParse({ email });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid email!' };
  }

  // Rate limiting by IP
  const ipHash = await getClientIpHash();
  const { success: allowed } = await passwordResetRateLimiter.limit(ipHash);
  if (!allowed) {
    return { success: false, error: 'Too many reset attempts. Please try again later.' };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  // Always return success to prevent user enumeration
  if (!existingUser) {
    return { success: true, message: 'If an account exists with that email, a reset link has been sent.' };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: true, message: 'If an account exists with that email, a reset link has been sent.' };
};

export const newPassword = async (password: string, token: string | null) => {
  if (!token) {
    return { success: false, error: 'Missing token!' };
  }

  const validatedFields = NewPasswordSchema.safeParse({ password, token });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid fields!' };
  }

  const existingToken = await prisma.passwordResetToken.findFirst({
    where: { token },
  });

  if (!existingToken) {
    return { success: false, error: 'Invalid token!' };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { success: false, error: 'Token has expired!' };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: existingToken.email },
  });

  if (!existingUser) {
    return { success: false, error: 'Email does not exist!' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: true, message: 'Password updated!' };
};
