'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helper';
import { revalidatePath } from 'next/cache';

interface VideoUpdateData {
  title?: string;
  description?: string;
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

    if (video.userId !== session.user.id) {
      throw new Error('Forbidden: You can only finalize your own uploads');
    }

    // Update video status to PROCESSING
    const updatedVideo = await prisma.video.update({
      where: { bunnyVideoId },
      data: {
        status: 'PROCESSING',
        ...(metadata?.title && { title: metadata.title }),
        ...(metadata?.description && { description: metadata.description }),
      },
    });

    // Revalidate relevant pages
    revalidatePath('/profile');
    revalidatePath('/upload');

    return {
      success: true,
      videoId: updatedVideo.id,
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

/**
 * Update video metadata
 * Owner-only action
 */
export async function updateVideoMetadata(
  videoId: string,
  data: VideoUpdateData
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Verify ownership
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { userId: true },
    });

    if (!video) {
      throw new Error('Video not found');
    }

    if (video.userId !== session.user.id) {
      throw new Error('Forbidden: You can only edit your own videos');
    }

    // Update metadata
    await prisma.video.update({
      where: { id: videoId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
      },
    });

    revalidatePath('/profile');
    revalidatePath(`/video/${videoId}`);

    return {
      success: true,
      message: 'Video updated successfully',
    };
  } catch (error) {
    console.error('Error updating video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update video',
    };
  }
}

/**
 * Delete video
 * Owner-only action
 */
export async function deleteVideo(videoId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Verify ownership
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { userId: true, bunnyVideoId: true },
    });

    if (!video) {
      throw new Error('Video not found');
    }

    if (video.userId !== session.user.id) {
      throw new Error('Forbidden: You can only delete your own videos');
    }

    // Delete from database (cascades to related records)
    await prisma.video.delete({
      where: { id: videoId },
    });

    // TODO: Optionally delete from Bunny CDN
    // const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
    // const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
    // await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${video.bunnyVideoId}`, {
    //   method: 'DELETE',
    //   headers: { AccessKey: BUNNY_API_KEY },
    // });

    revalidatePath('/profile');
    revalidatePath('/');

    return {
      success: true,
      message: 'Video deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete video',
    };
  }
}

/**
 * Get user's videos
 */
export async function getUserVideos() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const videos = await prisma.video.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        bunnyVideoId: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        duration: true,
        status: true,
        viewsCount: true,
        likesCount: true,
        createdAt: true,
        publishedAt: true,
      },
    });

    return { success: true, videos };
  } catch (error) {
    console.error('Error fetching user videos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch videos',
      videos: [],
    };
  }
}
