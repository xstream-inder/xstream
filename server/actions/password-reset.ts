'use server';

import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/mail';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const ResetSchema = z.object({
  email: z.string().email(),
});

const NewPasswordSchema = z.object({
  password: z.string().min(6),
  token: z.string().optional(),
});

export const resetPassword = async (email: string) => {
  const validatedFields = ResetSchema.safeParse({ email });

  if (!validatedFields.success) {
    return { error: 'Invalid email!' };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    return { error: 'Email not found!' };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: 'Reset email sent!' };
};

export const newPassword = async (password: string, token: string | null) => {
  if (!token) {
    return { error: 'Missing token!' };
  }

  const validatedFields = NewPasswordSchema.safeParse({ password, token });

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const existingToken = await prisma.passwordResetToken.findFirst({
    where: { token },
  });

  if (!existingToken) {
    return { error: 'Invalid token!' };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: 'Token has expired!' };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: existingToken.email },
  });

  if (!existingUser) {
    return { error: 'Email does not exist!' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: 'Password updated!' };
};
