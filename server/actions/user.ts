'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helper';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { uploadToBunnyStorage, deleteFromBunnyStorage } from '@/lib/bunny/storage';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const profileSchema = z.object({
  avatarUrl: z.string().url().optional().or(z.literal('')),
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

  // Handle avatar file upload separately (comes as File from FormData)
  const avatarFile = formData.get('avatarFile') as File | null;
  const avatarUrlField = formData.get('avatarUrl') as string;

  const rawData = {
    avatarUrl: avatarUrlField || '',
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
  let hasChanges = false;

  // ----- Avatar handling -----
  // Priority: file upload > URL field > removal (empty string)
  if (avatarFile && avatarFile.size > 0) {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(avatarFile.type as any)) {
      return { success: false, error: 'Invalid image type. Use JPEG, PNG, WebP, or GIF.', message: '' };
    }
    // Validate file size
    if (avatarFile.size > MAX_AVATAR_SIZE) {
      return { success: false, error: 'Image must be smaller than 2 MB.', message: '' };
    }

    try {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const ext = MIME_TO_EXT[avatarFile.type] || '.jpg';
      const cdnUrl = await uploadToBunnyStorage(buffer, 'avatars', ext);

      // Delete old avatar from CDN if it was a Bunny URL
      if (user.avatarUrl && user.avatarUrl.includes('storage.bunnycdn.com') || user.avatarUrl?.includes(process.env.BUNNY_STORAGE_PULL_ZONE || '___')) {
        await deleteFromBunnyStorage(user.avatarUrl);
      }

      updateData.avatarUrl = cdnUrl;
      hasChanges = true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Avatar upload failed';
      return { success: false, error: msg, message: '' };
    }
  } else if (data.avatarUrl !== undefined && data.avatarUrl !== user.avatarUrl) {
    // User provided a URL (or empty to remove)
    if (!data.avatarUrl && user.avatarUrl?.includes(process.env.BUNNY_STORAGE_PULL_ZONE || '___')) {
      await deleteFromBunnyStorage(user.avatarUrl);
    }
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
