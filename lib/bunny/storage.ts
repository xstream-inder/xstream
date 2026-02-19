import crypto from 'crypto';

const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!;
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD!;
const BUNNY_STORAGE_REGION = process.env.BUNNY_STORAGE_REGION || ''; // empty = Falkenstein (default)
const BUNNY_STORAGE_PULL_ZONE = process.env.BUNNY_STORAGE_PULL_ZONE!;

function getStorageEndpoint() {
  // https://docs.bunny.net/storage/http#storage-endpoints
  if (!BUNNY_STORAGE_REGION || BUNNY_STORAGE_REGION === 'de') {
    return 'https://storage.bunnycdn.com';
  }
  return `https://${BUNNY_STORAGE_REGION}.storage.bunnycdn.com`;
}

/**
 * Uploads a file (Buffer) to Bunny Edge Storage and returns the public CDN URL.
 *
 * @param buffer  Raw file bytes
 * @param folder  Storage sub-folder, e.g. "avatars"
 * @param ext     File extension including the dot, e.g. ".jpg"
 * @returns       Public CDN URL of the uploaded file
 */
export async function uploadToBunnyStorage(
  buffer: Buffer,
  folder: string,
  ext: string,
): Promise<string> {
  if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_PASSWORD || !BUNNY_STORAGE_PULL_ZONE) {
    throw new Error(
      'Bunny Storage not configured. Set BUNNY_STORAGE_ZONE, BUNNY_STORAGE_PASSWORD, and BUNNY_STORAGE_PULL_ZONE in .env',
    );
  }

  // Generate a unique filename to avoid collisions
  const hash = crypto.randomBytes(16).toString('hex');
  const fileName = `${hash}${ext}`;
  const filePath = `${folder}/${fileName}`;

  const endpoint = getStorageEndpoint();
  const url = `${endpoint}/${BUNNY_STORAGE_ZONE}/${filePath}`;

  // Compute SHA256 checksum for integrity verification
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_STORAGE_PASSWORD,
      'Content-Type': 'application/octet-stream',
      'Checksum': checksum,
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Bunny Storage upload failed (${response.status}): ${text}`);
  }

  // Return the public CDN URL via the Pull Zone
  return `https://${BUNNY_STORAGE_PULL_ZONE}/${filePath}`;
}

/**
 * Deletes a file from Bunny Edge Storage by its CDN URL.
 * Silently succeeds if file doesn't exist (404).
 */
export async function deleteFromBunnyStorage(cdnUrl: string): Promise<void> {
  if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_PASSWORD) return;

  try {
    // Extract the path after the pull zone hostname
    const urlObj = new URL(cdnUrl);
    const filePath = urlObj.pathname.replace(/^\//, ''); // remove leading slash

    const endpoint = getStorageEndpoint();
    const url = `${endpoint}/${BUNNY_STORAGE_ZONE}/${filePath}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'AccessKey': BUNNY_STORAGE_PASSWORD,
      },
    });

    if (!response.ok && response.status !== 404) {
      console.error(`Bunny Storage delete failed (${response.status})`);
    }
  } catch (error) {
    console.error('Failed to delete from Bunny Storage:', error);
  }
}
