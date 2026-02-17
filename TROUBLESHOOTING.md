# Troubleshooting Guide: Like Button & Authentication

You are experiencing issues with the Like button failing and users needing to re-login. This is caused by missing configuration.

## 1. Fix "Like Failed" Issue (Redis Connection)

The Like button system uses **Redis** for performance and rate limiting. If Redis is not configured, the like action will crash or timeout.

### For Local Development (`localhost`):
- You must have a Redis server running on port `6379`.
- **OR** update your `.env` file with Upstash credentials for development too.
- If you don't want to run Redis locally, the like button will not work unless you mock it or connect to a remote Redis.

### For Production (Vercel):
- Go to your Vercel Project Settings -> Environment Variables.
- Ensure you have added:
  - `UPSTASH_REDIS_REST_URL`: (Get this from Upstash Console)
  - `UPSTASH_REDIS_REST_TOKEN`: (Get this from Upstash Console)
- **Without these variables, the application will crash when trying to like video.**

## 2. Fix Login/Session Issues (Custom Domain)

The issue "users are asked to login again" happens because cookies are domain-specific.

### Required Environment Variable Changes:
In Vercel Project Settings, update:

- **NEXTAUTH_URL**: Set this to `https://www.eddythedaddy.com`
  - *Do NOT use the `.vercel.app` URL.*
  - This ensures cookies are set for your custom domain.

- **NEXTAUTH_SECRET**: Ensure this is set to a long random string.

### Bunny Stream Security (For Video Playback)
- **Problem**: `403 Forbidden` on video playback.
- **Fix**: Login to Bunny Dashboard -> Stream -> Security.
- Add `www.eddythedaddy.com` and `eddythedaddy.com` to **Allowed Referrers**.

## 3. Verify Database Connection
If likes are still not persisting (reverting to 0), ensure your database connection string in Vercel is correct and accessible from Vercel's IP range (Neon usually works fine).

---
**Recap Checklist:**
1. [ ] Set `UPSTASH_REDIS_REST_URL` & `TOKEN` in Vercel.
2. [ ] Set `NEXTAUTH_URL` = `https://www.eddythedaddy.com` in Vercel.
3. [ ] Add domain to Bunny Stream Allowed Referrers.
