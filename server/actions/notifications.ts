'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helper';
import { revalidatePath } from 'next/cache';

/**
 * Fetch notifications for the currently signed-in user
 */
export async function getNotifications(page = 1, limit = 20) {
  const session = await auth();
  if (!session?.user?.id) {
    return { notifications: [], unreadCount: 0, totalPages: 0 };
  }

  const userId = session.user.id;
  const skip = (page - 1) * limit;

  const [notifications, totalCount, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Authentication required' };
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return { success: true };
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Authentication required' };
  }

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  revalidatePath('/');
  return { success: true };
}

/**
 * Notify all subscribers of a creator about a new video upload
 * Called internally after a video is published
 */
export async function notifySubscribersOfNewVideo(
  creatorId: string,
  videoId: string,
  videoTitle: string
) {
  try {
    // Get the creator's username
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { username: true },
    });

    if (!creator) return;

    // Get all subscriber IDs
    const subscriptions = await prisma.subscription.findMany({
      where: { creatorId },
      select: { subscriberId: true },
    });

    if (subscriptions.length === 0) return;

    // Batch create notifications
    await prisma.notification.createMany({
      data: subscriptions.map((sub) => ({
        userId: sub.subscriberId,
        type: 'NEW_VIDEO' as const,
        title: `${creator.username} uploaded a new video`,
        message: videoTitle,
        linkUrl: `/video/${videoId}`,
      })),
    });
  } catch (error) {
    console.error('Failed to send new video notifications:', error);
    // Non-blocking — don't throw
  }
}

/**
 * Notify a creator that someone subscribed to them
 */
export async function notifyNewSubscriber(creatorId: string, subscriberUsername: string) {
  try {
    await prisma.notification.create({
      data: {
        userId: creatorId,
        type: 'NEW_SUBSCRIBER',
        title: `${subscriberUsername} subscribed to you`,
        message: null,
        linkUrl: `/profile/${subscriberUsername}`,
      },
    });
  } catch (error) {
    console.error('Failed to send subscriber notification:', error);
  }
}
