import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BUNNY_WEBHOOK_SECRET = process.env.BUNNY_WEBHOOK_SECRET;
const EXPECTED_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

export async function POST(req: Request) {
  try {
    // --- AUTHENTICATION ---
    // Verify webhook secret via query parameter or custom header
    const url = new URL(req.url);
    const secretParam = url.searchParams.get('secret');
    const secretHeader = req.headers.get('x-bunny-webhook-secret');
    const providedSecret = secretParam || secretHeader;

    if (!BUNNY_WEBHOOK_SECRET) {
      console.error('BUNNY_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    if (providedSecret !== BUNNY_WEBHOOK_SECRET) {
      console.warn('Bunny webhook: invalid or missing secret');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // 1. Basic Validation
    if (!body.VideoGuid || typeof body.Status === 'undefined') {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { VideoGuid, Status, VideoLibraryId } = body;

    // Verify the webhook is from the expected Bunny library
    if (EXPECTED_LIBRARY_ID && VideoLibraryId && String(VideoLibraryId) !== String(EXPECTED_LIBRARY_ID)) {
      console.warn(`Bunny webhook: unexpected library ID ${VideoLibraryId}`);
      return NextResponse.json({ error: "Invalid library" }, { status: 403 });
    }

    const PULL_ZONE = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE;
    const API_KEY = process.env.BUNNY_API_KEY;

    // --- HANDLE FINISHED STATUS (3) ---
    if (Status === 3) {
      // Initialize with payload data (Optimization: Avoid API call if possible)
      let duration = body.Length || 0;
      let resolutions = body.AvailableResolutions ? body.AvailableResolutions.split(',') : [];

      // 2. Fallback: Call API only if data is missing or invalid
      if (!duration || resolutions.length === 0) {
        try {
          console.log(`📡 Metadata missing in webhook, fetching from API for ${VideoGuid}...`);
          const response = await fetch(
            `https://video.bunnycdn.com/library/${VideoLibraryId}/videos/${VideoGuid}`,
            {
              method: "GET",
              headers: {
                "AccessKey": API_KEY!, // Use Non-Null assertion cautiously
                "Accept": "application/json",
              },
            }
          );

          if (response.ok) {
            const videoDetails = await response.json();
            
            // Update if we found better data
            if (!duration) duration = videoDetails.length || 0;
            if (resolutions.length === 0 && videoDetails.availableResolutions) {
               resolutions = videoDetails.availableResolutions.split(',');
            }
            
            console.log(`✅ Fetched Metadata: Duration=${duration}s, Resolutions=${resolutions.length}`);
          } else {
            console.error(`⚠️ Failed to fetch metadata from Bunny API: ${response.status}`);
          }
        } catch (err) {
          console.error("⚠️ Error fetching metadata:", err);
          // Don't throw here; allow partial update
        }
      }

      // 3. Construct URLs
      const thumbnailUrl = `https://${PULL_ZONE}/${VideoGuid}/thumbnail.jpg`;
      const previewUrl = `https://${PULL_ZONE}/${VideoGuid}/preview.webp`;
      const hlsUrl = `https://${PULL_ZONE}/${VideoGuid}/playlist.m3u8`;

      // 4. Update DB (Safely)
      try {
        const updatedVideo = await prisma.video.update({
          where: { bunnyVideoId: VideoGuid },
          data: {
            status: "PUBLISHED",
            duration: duration,
            thumbnailUrl: thumbnailUrl,
            previewUrl: previewUrl,
            hlsUrl: hlsUrl,
            resolutions: resolutions, // Important for player quality selector
          },
          select: { id: true, userId: true, title: true },
        });
        console.log(`✅ Published Video: ${VideoGuid}`);

        // Notify subscribers of new upload
        const { notifySubscribersOfNewVideo } = await import('@/server/actions/notifications');
        notifySubscribersOfNewVideo(updatedVideo.userId, updatedVideo.id, updatedVideo.title).catch(() => {});
      } catch (dbError) {
        // If RecordNotFound, it means video was deleted during processing.
        console.warn(`⚠️ Video record not found for update (likely deleted): ${VideoGuid}`);
        // Return 200 to stop Bunny from retrying endlessly
        return NextResponse.json({ success: true, message: "Video not found, skipped" }); 
      }
    } 
    
    // --- HANDLE PROCESSING / UPLOADING ---
    else if (Status === 0 || Status === 1 || Status === 7) {
       // Only update if not already publishing (Race condition protection)
       try {
        await prisma.video.updateMany({
          where: { 
            bunnyVideoId: VideoGuid, 
            status: { not: "PUBLISHED" } // Don't revert a published video to processing
          },
          data: { status: "PROCESSING" },
        });
       } catch (e) {
         // Ignore
       }
    }

    // --- HANDLE FAILURE ---
    else if (Status === 4) { 
        await prisma.video.update({
          where: { bunnyVideoId: VideoGuid },
          data: { status: "FAILED" },
        });
        console.error(`❌ Video Failed: ${VideoGuid}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 Webhook Error:", error);
    // Return 500 to signal Bunny to retry later
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}