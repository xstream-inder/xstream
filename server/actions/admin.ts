'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helper';
import { revalidatePath } from 'next/cache';

// Middleware for role check
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
}

export async function getAdminStats() {
  await checkAdmin();
  
  const [userCount, videoCount, viewCount] = await Promise.all([
    prisma.user.count(),
    prisma.video.count(),
    prisma.videoView.count(), // Or sum of video.viewsCount if that's how we track it?
  ]);
  
  // Actually we store viewsCount on Video, but we also have VideoView model.
  // Aggregating VideoView might be slow.
  // Let's use aggregation on Video.viewsCount for total views.
  
  const totalViews = await prisma.video.aggregate({
    _sum: {
      viewsCount: true,
    },
  });

  return {
    users: userCount,
    videos: videoCount,
    views: totalViews._sum.viewsCount || 0,
  };
}

// Categories
export async function createCategory(name: string, slug?: string) {
  await checkAdmin();
  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  try {
    const category = await prisma.category.create({
      data: { name, slug: finalSlug },
    });
    revalidatePath('/admin/categories');
    return { success: true, category };
  } catch (error) {
    return { success: false, error: 'Category already exists or invalid data' };
  }
}

export async function deleteCategory(id: string) {
  await checkAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/categories');
  return { success: true };
}

// Tags
export async function createTag(name: string) {
  await checkAdmin();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  try {
    const tag = await prisma.tag.create({
      data: { name, slug },
    });
    revalidatePath('/admin/tags');
    return { success: true, tag };
  } catch (error) {
    return { success: false, error: 'Tag already exists' };
  }
}

export async function deleteTag(id: string) {
  await checkAdmin();
  await prisma.tag.delete({ where: { id } });
  revalidatePath('/admin/tags');
  return { success: true };
}

// Models
export async function createModel(stageName: string, gender: 'FEMALE' | 'MALE' | 'TRANS_FEMALE' | 'TRANS_MALE' | 'NON_BINARY' = 'FEMALE') {
  await checkAdmin();
  const slug = stageName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  try {
    const model = await prisma.model.create({
      data: { 
        stageName, 
        slug,
        gender,
        isVerified: true // Admin created models are verified by default
      },
    });
    revalidatePath('/admin/models');
    return { success: true, model };
  } catch (error) {
    return { success: false, error: 'Model already exists' };
  }
}
