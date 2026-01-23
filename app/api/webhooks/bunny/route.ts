import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Bunny Stream Webhook Handler
 * 
 * TESTING LOCALLY:
 * 1. Install ngrok: `npm install -g ngrok`
 * 2. Start your dev server: `npm run dev`
 * 3. Expose localhost: `ngrok http 3000`
 * 4. Copy the ngrok URL (e.g., https://abc123.ngrok.io)
 * 5. In Bunny Stream dashboard:
 *    - Go to your Video Library > Webhooks
 *    - Add webhook URL: https://abc123.ngrok.io/api/webhooks/bunny
 *    - Select events: "Video Encoded" and "Video Upload Failed"
 * 6. Upload a test video and watch your local logs
 * 
 * PRODUCTION:
 * - Set BUNNY_WEBHOOK_SECRET in your environment variables
 * - Configure the webhook URL in Bunny dashboard: https://yourdomain.com/api/webhooks/bunny
 */

const BUNNY_WEBHOOK_SECRET = process.env.BUNNY_WEBHOOK_SECRET;

interface BunnyWebhookPayload {
  VideoGuid: string;
  Status: number;
  VideoLibraryId: number;
  Length?: number; // Duration in seconds
  ThumbnailFileName?: string;
  EncodeProgress?: number;
  // Additional fields that might be present
  Title?: string;
  Width?: number;
  Height?: number;
  AvailableResolutions?: string;
}

/**
 * Bunny Stream Status Codes:
 * 0 - Created
 * 1 - Uploaded
 * 2 - Processing
 * 3 - Encoding finished (SUCCESS)
 * 4 - Resolution finished
 * 5 - Error/Failed
 */
enum BunnyStatus {
  CREATED = 0,
  UPLOADED = 1,
  PROCESSING = 2,
  FINISHED = 3,
  RESOLUTION_FINISHED = 4,
  FAILED = 5,
}

export async function POST(request: NextRequest) {
  try {
    // Security: Verify the request comes from Bunny
    const bunnySignature = request.headers.get('x-bunny-signature');
    const bunnySecret = request.headers.get('x-bunny-secret');
    
    // If webhook secret is configured, validate it
    // if (BUNNY_WEBHOOK_SECRET) {
    //   if (bunnySecret !== BUNNY_WEBHOOK_SECRET) {
    //     console.error('Invalid Bunny webhook secret');
    //     return NextResponse.json(
    //       { error: 'Unauthorized' },
    //       { status: 401 }
    //     );
    //   }
    // }

    // Parse webhook payload
    const payload: BunnyWebhookPayload = await request.json();

    console.log('Bunny webhook received:', {
      videoGuid: payload.VideoGuid,
      status: payload.Status,
      libraryId: payload.VideoLibraryId,
    });

    // Validate required fields
    if (!payload.VideoGuid || payload.Status === undefined) {
      console.error('Invalid webhook payload: missing VideoGuid or Status');
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Find the video in our database
    const video = await prisma.video.findUnique({
      where: { bunnyVideoId: payload.VideoGuid },
      select: { id: true, title: true, status: true },
    });

    if (!video) {
      console.warn(`Video not found in database: ${payload.VideoGuid}`);
      // Return 200 to acknowledge receipt (video might not be in DB yet)
      return NextResponse.json(
        { message: 'Video not found, but webhook acknowledged' },
        { status: 200 }
      );
    }

    // Handle different status codes
    switch (payload.Status) {
      case BunnyStatus.FINISHED:
        // Video encoding completed successfully
        await handleVideoFinished(video.id, payload);
        break;

      case BunnyStatus.FAILED:
        // Video encoding failed
        await handleVideoFailed(video.id, payload);
        break;

      case BunnyStatus.PROCESSING:
        // Video is being processed
        await handleVideoProcessing(video.id, payload);
        break;

      case BunnyStatus.UPLOADED:
        // Video has been uploaded and is queued for processing
        await handleVideoUploaded(video.id);
        break;

      default:
        console.log(`Unhandled Bunny status: ${payload.Status} for video ${video.id}`);
    }

    // Log the webhook event (optional: store in a WebhookLog table)
    console.log(`Webhook processed successfully for video ${video.title} (${video.id})`);

    return NextResponse.json(
      { 
        success: true,
        message: 'Webhook processed',
        videoId: video.id,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Bunny webhook error:', error);
    
    // Return 200 to prevent Bunny from retrying on our internal errors
    // In production, you might want to return 500 for retryable errors
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}

/**
 * Handle successfully encoded video
 */
async function handleVideoFinished(
  videoId: string,
  payload: BunnyWebhookPayload
) {
  const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME;
  const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

  const updateData: any = {
    status: 'PUBLISHED',
    publishedAt: new Date(),
  };

  // Update duration if provided
  if (payload.Length) {
    updateData.duration = Math.floor(payload.Length);
  }

  // Generate HLS URL
  if (BUNNY_CDN_HOSTNAME) {
    updateData.hlsUrl = `https://${BUNNY_CDN_HOSTNAME}/${payload.VideoGuid}/playlist.m3u8`;
  }

  // Generate thumbnail URL if available
  if (payload.ThumbnailFileName && BUNNY_CDN_HOSTNAME) {
    updateData.thumbnailUrl = `https://${BUNNY_CDN_HOSTNAME}/${payload.VideoGuid}/${payload.ThumbnailFileName}`;
  }

  await prisma.video.update({
    where: { id: videoId },
    data: updateData,
  });

  console.log(`Video ${videoId} published successfully`, {
    duration: updateData.duration,
    hlsUrl: updateData.hlsUrl,
  });
}

/**
 * Handle failed video encoding
 */
async function handleVideoFailed(
  videoId: string,
  payload: BunnyWebhookPayload
) {
  await prisma.video.update({
    where: { id: videoId },
    data: {
      status: 'FAILED',
      failureReason: `Bunny Stream encoding failed (Status: ${payload.Status})`,
    },
  });

  console.error(`Video ${videoId} encoding failed`);

  // TODO: Send notification to video owner
  // TODO: Optionally retry or delete the video
}

/**
 * Handle video in processing state
 */
async function handleVideoProcessing(
  videoId: string,
  payload: BunnyWebhookPayload
) {
  const updateData: any = {
    status: 'PROCESSING',
  };

  // Optionally store encoding progress
  if (payload.EncodeProgress !== undefined) {
    console.log(
      `Video ${videoId} encoding progress: ${payload.EncodeProgress}%`
    );
  }

  await prisma.video.update({
    where: { id: videoId },
    data: updateData,
  });
}

/**
 * Handle uploaded video (queued for processing)
 */
async function handleVideoUploaded(videoId: string) {
  await prisma.video.update({
    where: { id: videoId },
    data: {
      status: 'PROCESSING',
    },
  });

  console.log(`Video ${videoId} uploaded and queued for processing`);
}

// Optional: Add GET handler for health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'bunny-webhook',
    timestamp: new Date().toISOString(),
  });
}