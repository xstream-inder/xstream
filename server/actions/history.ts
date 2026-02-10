'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helper';

export type HistoryItem = {
  viewedAt: Date;
  video: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    duration: number | null;
    user: {
      username: string;
      avatarUrl: string | null;
    };
    viewsCount: number;
    createdAt: Date;
  };
};

export async function getWatchHistory(page = 1, limit = 20): Promise<{ history: HistoryItem[], hasMore: boolean }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { history: [], hasMore: false };
  }

  const history = await prisma.videoView.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      viewedAt: 'desc',
    },
    take: limit + 1,
    skip: (page - 1) * limit,
    include: {
      video: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          duration: true,
          viewsCount: true,
          createdAt: true,
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
      viewedAt: item.viewedAt,
      video: item.video,
    })),
    hasMore,
  };
}

export async function clearHistory() {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  await prisma.videoView.deleteMany({
    where: {
      userId: session.user.id,
    },
  });
  
  return { success: true };
}
