'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helper';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const profileSchema = z.object({
  avatarUrl: z.string().url().or(z.string().startsWith('data:image/')).optional().or(z.literal('')),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional()
    .or(z.literal('')),
});

export async function updateProfile(prevState: any, formData: FormData): Promise<{ success: boolean; error: string; message: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized', message: '' };
  }

  const rawData = {
    avatarUrl: formData.get('avatarUrl') as string,
    currentPassword: formData.get('currentPassword') as string,
    newPassword: formData.get('newPassword') as string,
  };

  // Validate
  const parseResult = profileSchema.safeParse(rawData);
  if (!parseResult.success) {
     return { success: false, error: 'Invalid data format', message: '' };
  }
  
  const data = parseResult.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return { success: false, error: 'User not found', message: '' };
  }

  const updateData: any = {};
  
  // Helper to detect if field changed
  let hasChanges = false;

  // Update Avatar
  if (data.avatarUrl !== undefined && data.avatarUrl !== user.avatarUrl) {
    updateData.avatarUrl = data.avatarUrl || null;
    hasChanges = true;
  }

  // Update Password
  // Only process if newPassword is provided
  if (data.newPassword && data.newPassword.length >= 6) {
    // Check auth provider
    if (user.authProvider && user.authProvider !== 'credentials') {
        return { success: false, error: `You are logged in via ${user.authProvider}, you cannot change password here.`, message: '' };
    }

    // Verify current password if user has one
    if (user.password) {
        if (!data.currentPassword) {
            return { success: false, error: 'Current password is required.', message: '' };
        }
        const isValid = await bcrypt.compare(data.currentPassword, user.password);
        if (!isValid) {
            return { success: false, error: 'Incorrect current password.', message: '' };
        }
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12);
    updateData.password = hashedPassword;
    hasChanges = true;
  }

  if (!hasChanges) {
      return { success: true, message: 'No changes made', error: '' };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });
    
    revalidatePath('/profile');
    revalidatePath('/settings');
    
    return { success: true, message: 'Profile updated successfully', error: '' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update profile';
    return { success: false, error: msg, message: '' };
  }
}
