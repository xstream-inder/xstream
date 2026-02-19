'use server';

import { prisma } from '@/lib/prisma';
import { redis, likeRateLimiter } from '@/lib/redis';
import { auth } from '@/lib/auth-helper';
import { revalidatePath } from 'next/cache';

interface LikeResponse {
  success: boolean;
  isLiked: boolean;
  likeCount: number;
  error?: string;
}

/**
 * Toggle like on a video with Redis fast path
 * Uses Redis for instant response and async DB sync
 */
export async function toggleLike(videoId: string): Promise<LikeResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        isLiked: false,
        likeCount: 0,
        error: 'Authentication required',
      };
    }

    const userId = session.user.id;

    // Rate limiting
    const { success: rateLimitOk } = await likeRateLimiter.limit(userId);
    if (!rateLimitOk) {
      return {
        success: false,
        isLiked: false,
        likeCount: 0,
        error: 'Too many requests. Please slow down.',
      };
    }

    // Verify video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, likesCount: true, status: true },
    });

    if (!video) {
      return {
        success: false,
        isLiked: false,
        likeCount: 0,
        error: 'Video not found',
      };
    }

    if (video.status !== 'PUBLISHED') {
      return {
        success: false,
        isLiked: false,
        likeCount: 0,
        error: 'Cannot like unpublished video',
      };
    }

    // Redis keys
    const likesSetKey = `video:${videoId}:likes`;
    const likeCountKey = `video:${videoId}:like_count`;
    const userLikeKey = `user:${userId}:like:${videoId}`;

    // Check if user already liked this video (Redis fast path)
    const isMember = await redis.sismember(likesSetKey, userId);
    const isCurrentlyLiked = isMember === 1;

    let newLikedState: boolean;
    let newCount: number;

    if (isCurrentlyLiked) {
      // Unlike: Remove from set and decrement counter
      await redis.srem(likesSetKey, userId);
      await redis.del(userLikeKey);
      newCount = await redis.decr(likeCountKey);
      newLikedState = false;

      // DB sync with retry
      syncUnlike(userId, videoId);
    } else {
      // Like: Add to set and increment counter
      await redis.sadd(likesSetKey, userId);
      await redis.set(userLikeKey, '1', { ex: 86400 * 30 }); // 30 days TTL
      newCount = await redis.incr(likeCountKey);
      newLikedState = true;

      // DB sync with retry
      syncLike(userId, videoId);
    }

    // Set expiry on count key (30 days)
    await redis.expire(likeCountKey, 86400 * 30);

    // Revalidate video page and related pages
    revalidatePath(`/video/${videoId}`);
    revalidatePath('/');

    return {
      success: true,
      isLiked: newLikedState,
      likeCount: Math.max(0, newCount), // Ensure non-negative
    };
  } catch (error) {
    console.error('Toggle like error:', error);
    return {
      success: false,
      isLiked: false,
      likeCount: 0,
      error: error instanceof Error ? error.message : 'Failed to toggle like',
    };
  }
}

/**
 * Get like status for a video
 * Used for initial page load
 */
export async function getLikeStatus(videoId: string): Promise<{
  isLiked: boolean;
  likeCount: number;
}> {
  try {
    const session = await auth();

    // Try Redis first for real-time count
    const likeCountKey = `video:${videoId}:like_count`;
    let likeCount = await redis.get<number>(likeCountKey);

    // Fallback to DB if not in Redis
    if (likeCount === null) {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        select: { likesCount: true },
      });
      likeCount = video?.likesCount || 0;
    }

    // Check if current user liked
    let isLiked = false;
    if (session?.user?.id) {
      const likesSetKey = `video:${videoId}:likes`;
      const isMember = await redis.sismember(likesSetKey, session.user.id);
      isLiked = isMember === 1;

      // Fallback to DB if not in Redis
      if (!isLiked) {
        const like = await prisma.like.findUnique({
          where: {
            userId_videoId: {
              userId: session.user.id,
              videoId,
            },
          },
        });
        isLiked = !!like;

        // Warm up Redis cache
        if (like) {
          await redis.sadd(likesSetKey, session.user.id);
        }
      }
    }

    return {
      isLiked,
      likeCount: likeCount || 0,
    };
  } catch (error) {
    console.error('Get like status error:', error);
    return {
      isLiked: false,
      likeCount: 0,
    };
  }
}

/**
 * Batch warm-up Redis cache for multiple videos
 * Call this on homepage/feed to prepare cache
 */
export async function warmupLikesCache(videoIds: string[]): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    // Batch fetch from DB
    const likes = await prisma.like.findMany({
      where: {
        userId: session.user.id,
        videoId: { in: videoIds },
      },
      select: { videoId: true },
    });

    // Warm up Redis
    const pipeline = redis.pipeline();
    likes.forEach((like) => {
      pipeline.sadd(`video:${like.videoId}:likes`, session.user.id);
    });
    await pipeline.exec();
  } catch (error) {
    console.error('Warmup likes cache error:', error);
  }
}

interface SubscriptionResponse {
  success: boolean;
  isSubscribed: boolean;
  subscriberCount: number;
  error?: string;
}

/**
 * Toggle subscription to a creator
 */
export async function toggleSubscription(creatorId: string): Promise<SubscriptionResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        isSubscribed: false,
        subscriberCount: 0,
        error: 'Authentication required',
      };
    }

    const userId = session.user.id;
    if (userId === creatorId) {
      return {
        success: false,
        isSubscribed: false,
        subscriberCount: 0,
        error: 'Cannot subscribe to yourself',
      };
    }

    // Verify creator exists
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      include: {
        _count: {
          select: { subscribers: true } // Subscriptions where this user is the CREATOR
        }
      }
    });

    if (!creator) {
      return {
        success: false,
        isSubscribed: false,
        subscriberCount: 0,
        error: 'Creator not found',
      };
    }

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: {
          subscriberId: userId,
          creatorId,
        },
      },
    });

    let isSubscribed = false;
    let subscriberCount = creator._count.subscribers;

    if (existingSubscription) {
      // Unsubscribe
      await prisma.subscription.delete({
        where: { id: existingSubscription.id },
      });
      isSubscribed = false;
      subscriberCount--;
    } else {
      // Subscribe
      await prisma.subscription.create({
        data: {
          subscriberId: userId,
          creatorId,
        },
      });
      isSubscribed = true;
      subscriberCount++;

      // Notify creator of new subscriber (non-blocking)
      const { notifyNewSubscriber } = await import('@/server/actions/notifications');
      notifyNewSubscriber(creatorId, session.user.username || 'Someone').catch(() => {});
    }

    revalidatePath(`/profile/${creator.username}`);
    revalidatePath(`/video/[id]`); // Ideally should target specific video pages

    return {
      success: true,
      isSubscribed,
      subscriberCount: Math.max(0, subscriberCount),
    };
  } catch (error) {
    console.error('Toggle subscription error:', error);
    return {
      success: false,
      isSubscribed: false,
      subscriberCount: 0,
      error: 'Failed to toggle subscription',
    };
  }
}

/**
 * Get subscription status for a creator
 */
export async function getSubscriptionStatus(creatorId: string): Promise<{
  isSubscribed: boolean;
  subscriberCount: number;
}> {
  try {
    const session = await auth();
    
    // Get count
    const count = await prisma.subscription.count({
      where: { creatorId }
    });

    let isSubscribed = false;
    if (session?.user?.id) {
      const subscription = await prisma.subscription.findUnique({
        where: {
          subscriberId_creatorId: {
            subscriberId: session.user.id,
            creatorId,
          },
        },
      });
      isSubscribed = !!subscription;
    }

    return {
      isSubscribed,
      subscriberCount: count,
    };
  } catch (error) {
    console.error('Get subscription status error:', error);
    return {
      isSubscribed: false,
      subscriberCount: 0,
    };
  }
}

// ============================================================================
// INTERNAL: DB sync helpers with retry
// ============================================================================

const MAX_RETRIES = 3;
const RETRY_DELAYS = [500, 2000, 5000]; // exponential-ish backoff (ms)

function syncLike(userId: string, videoId: string, attempt = 0) {
  prisma.like
    .create({
      data: { userId, videoId },
    })
    .then(() => {
      // Also sync the aggregate count to DB
      return prisma.video.update({
        where: { id: videoId },
        data: { likesCount: { increment: 1 } },
      });
    })
    .catch(async (err) => {
      // Duplicate key means it's already synced — not an error
      if (err?.code === 'P2002') return;

      if (attempt < MAX_RETRIES) {
        console.warn(`DB like sync retry ${attempt + 1}/${MAX_RETRIES} for video ${videoId}`);
        await delay(RETRY_DELAYS[attempt] || 5000);
        syncLike(userId, videoId, attempt + 1);
      } else {
        // After all retries, enqueue for later reconciliation
        console.error(`DB like sync FAILED after ${MAX_RETRIES} retries for user=${userId} video=${videoId}:`, err);
        redis.sadd('sync:failed:likes', `${userId}:${videoId}`).catch(() => {});
      }
    });
}

function syncUnlike(userId: string, videoId: string, attempt = 0) {
  prisma.like
    .delete({
      where: {
        userId_videoId: { userId, videoId },
      },
    })
    .then(() => {
      return prisma.video.update({
        where: { id: videoId },
        data: { likesCount: { decrement: 1 } },
      });
    })
    .catch(async (err) => {
      // Record not found means it's already deleted — not an error
      if (err?.code === 'P2025') return;

      if (attempt < MAX_RETRIES) {
        console.warn(`DB unlike sync retry ${attempt + 1}/${MAX_RETRIES} for video ${videoId}`);
        await delay(RETRY_DELAYS[attempt] || 5000);
        syncUnlike(userId, videoId, attempt + 1);
      } else {
        console.error(`DB unlike sync FAILED after ${MAX_RETRIES} retries for user=${userId} video=${videoId}:`, err);
        redis.sadd('sync:failed:unlikes', `${userId}:${videoId}`).catch(() => {});
      }
    });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}