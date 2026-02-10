'use server';

import { prisma } from '@/lib/prisma';

export const verifyEmail = async (token: string) => {
  const existingToken = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!existingToken) {
    return { error: 'Token does not exist!' };
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

  return { success: 'Email verified!' };
};
