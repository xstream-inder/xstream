'use server';

import { prisma } from '@/lib/prisma';

export const verifyEmail = async (token: string) => {
  const existingToken = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!existingToken) {
    return { success: false, error: 'Token does not exist!' };
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

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { 
      isVerified: true,
      email: existingToken.email // verify the email in case it changed
    },
  });

  await prisma.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { success: true, message: 'Email verified!' };
};
