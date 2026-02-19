import { headers } from 'next/headers';
import { createHash } from 'crypto';

/**
 * Get the client IP address from request headers.
 * Works with both Vercel and standard reverse proxies.
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
}

/**
 * Get a hashed version of the client IP for privacy-safe rate limiting keys.
 */
export async function getClientIpHash(): Promise<string> {
  const ip = await getClientIp();
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

/**
 * Simple HTML entity escaper to prevent XSS in email templates.
 * Escapes &, <, >, ", and ' characters.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
