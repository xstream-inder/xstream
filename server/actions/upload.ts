'use server';

import { BunnyClient } from '@/lib/bunny/client';

export async function uploadVideo(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('No file provided');
  }

  const bunny = new BunnyClient();
  
  // Create video entry in Bunny CDN
  const videoData = await bunny.createVideo(file.name);
  
  // Upload the actual file
  await bunny.uploadVideo(videoData.guid, file);

  // TODO: Save video metadata to database
  
  return {
    success: true,
    videoId: videoData.guid,
  };
}
