'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helper';

export type HistoryItem = {
  watchedAt: Date;
  video: {
    id: string;
    bunnyVideoId: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    duration: number | null;
    viewsCount: number;
    createdAt: Date;
    orientation: string | null;
    previewUrl: string | null;
    resolutions: string[];
    isPremium: boolean;
    user: {
      username: string;
      avatarUrl: string | null;
    };
  };
};

export async function getWatchHistory(page = 1, limit = 20): Promise<{ history: HistoryItem[], hasMore: boolean }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { history: [], hasMore: false };
  }

  const history = await prisma.watchHistory.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      watchedAt: 'desc',
    },
    take: limit + 1,
    skip: (page - 1) * limit,
    include: {
      video: {
        select: {
          id: true,
          bunnyVideoId: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          duration: true,
          viewsCount: true,
          createdAt: true,
          orientation: true,
          previewUrl: true,
          resolutions: true,
          isPremium: true,
          user: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  const hasMore = history.length > limit;
  const items = hasMore ? history.slice(0, limit) : history;

  return {
    history: items.map(item => ({
      watchedAt: item.watchedAt,
      video: item.video,
    })),
    hasMore,
  };
}

export async function clearHistory() {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  // Only deletes watch history, NOT analytics (VideoView records preserved)
  await prisma.watchHistory.deleteMany({
    where: {
      userId: session.user.id,
    },
  });
  
  return { success: true };
}

/**
 * Record a watch history entry (upsert: updates timestamp if already exists)
 */
export async function recordWatchHistory(videoId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    await prisma.watchHistory.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId,
        },
      },
      update: {
        watchedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        videoId,
      },
    });
  } catch (error) {
    // Non-critical — don't throw, just log
    console.error('Failed to record watch history:', error);
  }
}