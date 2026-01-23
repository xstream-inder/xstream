const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME;

export class BunnyClient {
  private apiKey: string;
  private libraryId: string;

  constructor() {
    if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
      throw new Error('Bunny CDN credentials not configured');
    }
    this.apiKey = BUNNY_API_KEY;
    this.libraryId = BUNNY_LIBRARY_ID;
  }

  async createVideo(title: string) {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${this.libraryId}/videos`,
      {
        method: 'POST',
        headers: {
          'AccessKey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create video');
    }

    return response.json();
  }

  async uploadVideo(videoId: string, file: File) {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`,
      {
        method: 'PUT',
        headers: {
          'AccessKey': this.apiKey,
        },
        body: file,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload video');
    }

    return response.json();
  }

  getVideoUrl(videoId: string) {
    return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/playlist.m3u8`;
  }
}
