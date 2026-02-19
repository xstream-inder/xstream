import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Rate limit configuration (Default 5 views/min, 10 likes/min)
const VIEW_LIMIT = Number(process.env.RATE_LIMIT_VIEW) || 5;
const LIKE_LIMIT = Number(process.env.RATE_LIMIT_LIKE) || 10;
const WINDOW_DURATION = '1 m';

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing Upstash Redis credentials (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)');
  }
  console.warn('⚠️ Upstash Redis not configured - rate limiting, likes, and views will use a mock client');
}

export const redis = UPSTASH_URL && UPSTASH_TOKEN
  ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN })
  : new Redis({ url: 'https://localhost:6379', token: 'dev-placeholder' });

// Rate limiter for view counting (max 5 views per IP per minute)
export const viewRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(VIEW_LIMIT, WINDOW_DURATION as `${number} ${'s' | 'm' | 'h' | 'd'}`),
  analytics: true,
  prefix: 'ratelimit:view',
});

// Rate limiter for likes (max 10 toggles per user per minute)
export const likeRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(LIKE_LIMIT, WINDOW_DURATION as `${number} ${'s' | 'm' | 'h' | 'd'}`),
  analytics: true,
  prefix: 'ratelimit:like',
});

// Rate limiter for auth: sign-in (max 5 attempts per IP per 15 min)
export const signInRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:signin',
});

// Rate limiter for auth: sign-up (max 3 per IP per hour)
export const signUpRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'ratelimit:signup',
});

// Rate limiter for password reset (max 3 per email per hour)
export const passwordResetRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'ratelimit:pwreset',
});

// Rate limiter for public form submissions: reports, DMCA, contact (max 3 per IP per hour)
export const formSubmitRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'ratelimit:form',
});
