'use server';

import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';
import { auth } from '@/lib/auth-helper';
import { uploadSignatureSchema } from '@/lib/validations/schemas';

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

interface BunnyVideoResponse {
  guid: string;
  title: string;
  dateUploaded: string;
  videoLibraryId: number;
}

interface UploadSignatureResponse {
  videoId: string;
  authorizationSignature: string;
  expirationTime: number;
  libraryId: string;
}

// ...existing code...

export async function createUploadSignature(
  fileName: string
): Promise<UploadSignatureResponse> {
  // Validate input
  const parsed = uploadSignatureSchema.safeParse({ fileName });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message || 'Invalid file name');
  }
  fileName = parsed.data.fileName;

  // Auth check FIRST — before making external API calls
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    throw new Error('Bunny CDN credentials not configured');
  }

  try {
    // Step 1: Create placeholder video in Bunny Stream
    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        method: 'POST',
        headers: {
          AccessKey: BUNNY_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: fileName,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create video: ${response.status} - ${errorText}`);
    }

    const videoData: BunnyVideoResponse = await response.json();

    // Step 2: Create database entry
    await prisma.video.create({
      data: {
        bunnyVideoId: videoData.guid,
        title: fileName,
        userId: session.user.id,
        status: 'PENDING',
      },
    });

    // Step 3: Generate authorization signature
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;
    const signatureString = `${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expirationTime}${videoData.guid}`;
    
    const authorizationSignature = createHash('sha256')
      .update(signatureString)
      .digest('hex');

    return {
      videoId: videoData.guid,
      authorizationSignature,
      expirationTime,
      libraryId: BUNNY_LIBRARY_ID,
    };
  } catch (error) {
    console.error('Error creating upload signature:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to create upload signature'
    );
  }
}
