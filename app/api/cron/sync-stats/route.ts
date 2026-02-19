import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

/**
 * Cron job to sync Redis counters to PostgreSQL
 * 
 * SETUP:
 * 1. Set CRON_SECRET in environment variables
 * 2. Configure Vercel Cron or external service to call this endpoint every 5 minutes:
 *    - URL: https://yourdomain.com/api/cron/sync-stats
 *    - Header: Authorization: Bearer YOUR_CRON_SECRET
 * 
 * Vercel vercel.json example:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-stats",
 *     "schedule": "0 *\/5 * * * *"
 *   }]
 * }
 */

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Security: Verify cron secret
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!CRON_SECRET) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (token !== CRON_SECRET) {
      console.error('Invalid cron secret');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting Redis to DB sync...');
    const startTime = Date.now();

    // Sync likes and views
    const likesSynced = await syncLikes();
    const viewsSynced = await syncViews();

    const duration = Date.now() - startTime;

    console.log(`Sync completed in ${duration}ms`, {
      likesSynced,
      viewsSynced,
    });

    return NextResponse.json({
      success: true,
      duration,
      stats: {
        likesSynced,
        viewsSynced,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Sync failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Sync like counts from Redis to PostgreSQL
 */
async function syncLikes(): Promise<number> {
  try {
    let synced = 0;
    const pattern = 'video:*:like_count';

    // Scan for all like count keys using SCAN command
    const keys: string[] = [];
    let cursor = '0';
    
    do {
      const result = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');

    console.log(`Found ${keys.length} like count keys to sync`);

    // Process in batches
    const batchSize = 50;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      
      // Fetch all counts in parallel
      const counts = await Promise.all(
        batch.map((key) => redis.get<number>(key))
      );

      // Extract video IDs and update DB
      const updates = batch
        .map((key, index) => {
          const videoId = key.split(':')[1];
          const count = counts[index];
          return { videoId, count };
        })
        .filter((item) => item.count !== null && item.videoId);

      // Batch update database using a single transaction
      if (updates.length > 0) {
        await prisma.$transaction(
          updates.map(({ videoId, count }) =>
            prisma.video.update({
              where: { id: videoId },
              data: { likesCount: count! },
            })
          )
        ).catch((err) => {
          console.error(`Failed to batch update likes:`, err);
        });
      }

      synced += updates.length;

      // Don't delete Redis keys - keep them for fast reads
      // Optionally: await redis.del(...batch) to clear after sync
    }

    return synced;
  } catch (error) {
    console.error('Sync likes error:', error);
    throw error;
  }
}

/**
 * Sync view counts from Redis to PostgreSQL
 */
async function syncViews(): Promise<number> {
  try {
    let synced = 0;
    const pattern = 'video:*:view_count';

    // Scan for all view count keys using SCAN command
    const keys: string[] = [];
    let cursor = '0';
    
    do {
      const result = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');

    console.log(`Found ${keys.length} view count keys to sync`);

    // Process in batches
    const batchSize = 50;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      
      // Fetch all counts in parallel
      const counts = await Promise.all(
        batch.map((key) => redis.get<number>(key))
      );

      // Extract video IDs and update DB
      const updates = batch
        .map((key, index) => {
          const videoId = key.split(':')[1];
          const count = counts[index];
          return { videoId, count };
        })
        .filter((item) => item.count !== null && item.videoId);

      // Batch update database using a single transaction
      if (updates.length > 0) {
        await prisma.$transaction(
          updates.map(({ videoId, count }) =>
            prisma.video.update({
              where: { id: videoId },
              data: { viewsCount: count! },
            })
          )
        ).catch((err) => {
          console.error(`Failed to batch update views:`, err);
        });
      }

      synced += updates.length;

      // Don't delete Redis keys - keep them for fast reads
    }

    return synced;
  } catch (error) {
    console.error('Sync views error:', error);
    throw error;
  }
}

/**
 * Manual trigger endpoint (for testing)
 * POST /api/cron/sync-stats
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
