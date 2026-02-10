'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helper';
import { revalidatePath } from 'next/cache';

interface VideoUpdateData {
  title?: string;
  description?: string;
  orientation?: 'STRAIGHT' | 'GAY' | 'LESBIAN' | 'TRANS';
  isPremium?: boolean;
  modelIds?: string[];
  newModelNames?: string[]; // Add support for new models
  categoryIds?: string[];
  tags?: string[];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Finalize upload after TUS completes
 * Called by frontend after successful upload
 */
export async function finalizeUpload(
  bunnyVideoId: string,
  metadata?: VideoUpdateData
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Verify video belongs to current user
    const video = await prisma.video.findUnique({
      where: { bunnyVideoId },
      select: { id: true, userId: true, title: true },
    });

    if (!video) {
      throw new Error('Video not found');
    }

    if (video.userId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new Error('Forbidden: You can only finalize your own uploads');
    }

    // Update video status to PROCESSING
    const updatedVideo = await prisma.video.update({
      where: { bunnyVideoId },
      data: {
        status: 'PROCESSING',
        ...(metadata?.title && { title: metadata.title }),
        ...(metadata?.description && { description: metadata.description }),
        ...(metadata?.orientation && { orientation: metadata.orientation }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create model associations (Existing IDs)
    if (metadata?.modelIds && metadata.modelIds.length > 0) {
      await prisma.videoModel.createMany({
        data: metadata.modelIds.map((modelId) => ({
          videoId: updatedVideo.id,
          modelId,
        })),
        skipDuplicates: true,
      });
    }

    // Process New Models
    if (metadata?.newModelNames && metadata.newModelNames.length > 0) {
      for (const name of metadata.newModelNames) {
         if (!name.trim()) continue;
         const slug = generateSlug(name);
         if (!slug) continue;

         // Upsert Model - User created models are NOT verified by default
         const model = await prisma.model.upsert({
            where: { slug },
            update: {},
            create: {
               stageName: name.trim(),
               slug,
               isVerified: false, 
            }
         });

         await prisma.videoModel.upsert({
            where: {
               videoId_modelId: {
                 videoId: updatedVideo.id,
                 modelId: model.id,
               }
            },
            update: {},
            create: {
               videoId: updatedVideo.id,
               modelId: model.id,
            }
         });
      }
    }

    // Create category associations
    if (metadata?.categoryIds && metadata.categoryIds.length > 0) {
      await prisma.videoCategory.createMany({
        data: metadata.categoryIds.map((categoryId) => ({
          videoId: updatedVideo.id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    // Process Tags
    if (metadata?.tags && metadata.tags.length > 0) {
      for (const tagName of metadata.tags) {
        if (!tagName.trim()) continue;
        
        const slug = generateSlug(tagName);
        if (!slug) continue;

        // Upsert tag
        const tag = await prisma.tag.upsert({
          where: { slug },
          update: {},
          create: {
            name: tagName.trim(),
            slug,
          },
        });

        // Link tag to video
        await prisma.videoTag.upsert({
          where: {
             videoId_tagId: {
               videoId: updatedVideo.id,
               tagId: tag.id
             }
          },
          update: {},
          create: {
            videoId: updatedVideo.id,
            tagId: tag.id,
          },
        });
      }
    }

    // Revalidate relevant pages
    revalidatePath('/profile');
    revalidatePath('/upload');

    return {
      success: true,
      video: updatedVideo,
      message: 'Upload finalized. Video is now being processed.',
    };
  } catch (error) {
    console.error('Error finalizing upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to finalize upload',
    };
  }
}

export async function getAdminVideos(page = 1, limit = 20, status?: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const skip = (page - 1) * limit;
  const where = status ? { status: status as any } : {};

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.video.count({ where }),
  ]);

  return { videos, total, pages: Math.ceil(total / limit) };
}

export async function updateVideoStatus(videoId: string, status: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
     throw new Error('Unauthorized');
  }
  
  await prisma.video.update({
    where: { id: videoId },
    data: { status: status as any },
  });
  
  revalidatePath('/admin/videos');
  return { success: true };
}


export async function deleteVideo(videoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
     throw new Error('Unauthorized');
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { userId: true },
  });

  if (!video) {
    throw new Error('Video not found');
  }

  if (video.userId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  // TODO: Ideally we should also delete from Bunny Stream here via API

  await prisma.video.delete({
    where: { id: videoId },
  });
  
  if (session.user.role === 'ADMIN') {
    revalidatePath('/admin/videos');
  } else {
    revalidatePath('/studio');
  }
  
  return { success: true };
}

export async function getUserVideos(page = 1, limit = 20) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const skip = (page - 1) * limit;

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where: { userId: session.user.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          viewsCount: true,
          createdAt: true,
          status: true,
          description: true,
      }
    }),
    prisma.video.count({ where: { userId: session.user.id } }),
  ]);

  return { videos, total, pages: Math.ceil(total / limit) };
}

export async function updateVideo(videoId: string, data: VideoUpdateData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { userId: true },
  });

  if (!video) {
    throw new Error('Video not found');
  }

  if (video.userId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  await prisma.video.update({
    where: { id: videoId },
    data: {
      title: data.title,
      description: data.description,
      orientation: data.orientation,
      isPremium: data.isPremium,
    },
  });

   // Handle Tags if provided
   if (data.tags && data.tags.length > 0) {
      // First disconnect all existing tags? Or handle delta? 
      // For simplicity in MVP: wipe and recreate logic is common but expensive.
      // Better: find existing, determine add/remove. 
      // Simplified approach for now:
      
      // 1. Clear existing
      await prisma.videoTag.deleteMany({ where: { videoId } });
      
      // 2. Add new
      for (const tagName of data.tags) {
        if (!tagName.trim()) continue;
        const slug = generateSlug(tagName);
        if (!slug) continue;
        const tag = await prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { name: tagName.trim(), slug },
        });
        await prisma.videoTag.create({
          data: { videoId, tagId: tag.id },
        });
      }
   }

  revalidatePath('/studio');
  revalidatePath(`/video/${videoId}`);
  return { success: true };
}
