# XStream Production Setup Guide

This document provides detailed instructions for setting up all required third-party services and API keys to deploy the XStream video platform to production.

---

## Table of Contents

1. [Overview](#overview)
2. [Required Services](#required-services)
3. [Environment Variables Reference](#environment-variables-reference)
4. [Service Setup Instructions](#service-setup-instructions)
   - [Database: Neon PostgreSQL](#1-database-neon-postgresql)
   - [Redis: Upstash](#2-redis-upstash)
   - [Video Hosting: Bunny.net Stream](#3-video-hosting-bunnynet-stream)
   - [Email Service: Resend](#4-email-service-resend)
   - [Payment Processing: Stripe](#5-payment-processing-stripe)
   - [Authentication: NextAuth](#6-authentication-nextauth)
5. [Final Configuration](#final-configuration)
6. [Deployment Checklist](#deployment-checklist)

---

## Overview

XStream is a Next.js-based video streaming platform that requires several third-party services for full functionality:

- **Database**: PostgreSQL database for storing user data, videos, comments, etc.
- **Caching**: Redis for real-time data like views, likes, and session management
- **Video Storage**: Bunny.net CDN for video hosting, transcoding, and HLS streaming
- **Email**: Resend for transactional emails (verification, notifications)
- **Payments**: Stripe for premium subscription management
- **Authentication**: NextAuth for user authentication with OAuth providers

---

## Required Services

| Service | Purpose | Pricing | Sign-up Link |
|---------|---------|---------|--------------|
| **Neon** | PostgreSQL Database | Free tier available | https://neon.tech |
| **Upstash Redis** | Caching & Real-time Data | Free tier available | https://upstash.com |
| **Bunny.net** | Video Storage & Streaming | Pay-as-you-go (~$0.01/GB) | https://bunny.net |
| **Resend** | Email Service | 100 emails/day free | https://resend.com |
| **Stripe** | Payment Processing | Free (transaction fees apply) | https://stripe.com |
| **Google OAuth** (Optional) | Social Login | Free | https://console.cloud.google.com |
| **GitHub OAuth** (Optional) | Social Login | Free | https://github.com/settings/developers |

---

## Environment Variables Reference

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Redis
REDIS_URL="redis://default:password@host:port"

# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Bunny.net Video Storage
BUNNY_API_KEY="your-bunny-api-key"
BUNNY_LIBRARY_ID="your-video-library-id"
BUNNY_STREAM_API_KEY="your-bunny-stream-api-key"
BUNNY_CDN_HOSTNAME="your-cdn-hostname.b-cdn.net"

# Email Service
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="noreply@yourdomain.com"

# Stripe Payment
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_PREMIUM_PRICE_ID="price_your_premium_price_id"

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

---

## Service Setup Instructions

### 1. Database: Neon PostgreSQL

**Purpose**: Stores all application data including users, videos, comments, likes, subscriptions, etc.

#### Setup Steps:

1. **Create Account**
   - Go to https://neon.tech
   - Sign up with email or GitHub
   - Verify your email address

2. **Create a New Project**
   - Click "Create Project"
   - Choose a project name (e.g., "xstream-production")
   - Select region closest to your users
   - Click "Create Project"

3. **Get Connection String**
   - Navigate to "Dashboard" → "Connection Details"
   - Copy the **Connection String** (starts with `postgresql://`)
   - Example: `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

4. **Add to Environment**
   ```bash
   DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

5. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed  # Optional: seed initial data
   ```

#### Important Notes:
- Free tier includes 10GB storage and 100 hours of compute per month
- Enable connection pooling for production
- Regularly backup your database

---

### 2. Redis: Upstash

**Purpose**: Caches real-time data like video views, likes, trending metrics, and session data.

#### Setup Steps:

1. **Create Account**
   - Go to https://upstash.com
   - Sign up with email or GitHub

2. **Create Redis Database**
   - Click "Create Database"
   - Choose a name (e.g., "xstream-redis")
   - Select region closest to your application
   - Choose "Regional" for better performance
   - Click "Create"

3. **Get Connection URL**
   - Go to database details page
   - Copy the **REST URL** or **Redis URL**
   - Format: `redis://default:password@host:port`

4. **Add to Environment**
   ```bash
   REDIS_URL="redis://default:AbC123xyz@global-xxxxx.upstash.io:6379"
   ```

#### Important Notes:
- Free tier includes 10,000 commands/day
- Enable TLS for production
- Consider using connection pooling for high traffic

---

### 3. Video Hosting: Bunny.net Stream

**Purpose**: Video storage, transcoding, HLS streaming, and CDN delivery.

#### Setup Steps:

1. **Create Account**
   - Go to https://bunny.net
   - Sign up and verify email
   - Add payment method (required even for pay-as-you-go)

2. **Create Video Library**
   - Navigate to "Stream" → "Video Library"
   - Click "Add Video Library"
   - Enter library name (e.g., "xstream-videos")
   - Choose replication regions (select regions where your users are)
   - Enable **Direct Upload** option
   - Click "Create"

3. **Get API Credentials**
   
   **a. Library ID:**
   - In your video library dashboard
   - Find the **Library ID** (numeric value)
   
   **b. API Key:**
   - Go to Account Settings → "API Keys"
   - Copy or create new API Key
   
   **c. Stream API Key:**
   - In Video Library settings
   - Copy the **Stream API Key**
   
   **d. CDN Hostname:**
   - In Video Library settings
   - Copy the **CDN Hostname** (e.g., `vz-xxxxx.b-cdn.net`)

4. **Add to Environment**
   ```bash
   BUNNY_API_KEY="your-bunny-api-key"
   BUNNY_LIBRARY_ID="12345"
   BUNNY_STREAM_API_KEY="your-stream-api-key"
   BUNNY_CDN_HOSTNAME="vz-xxxxx.b-cdn.net"
   ```

5. **Configure Security (Recommended)**
   - Enable **Tokenized Security** in library settings
   - Set up **Allowed Referrers** (your domain)
   - Configure **Watermarking** if needed
   - Enable **DRM** for premium content protection

#### Important Notes:
- Pricing: ~$0.01 per GB storage + bandwidth
- HLS transcoding is automatic
- Enable multiple quality levels (360p, 480p, 720p, 1080p)
- Set up webhooks for encoding completion notifications

---

### 4. Email Service: Resend

**Purpose**: Sends transactional emails (account verification, password resets, notifications).

#### Setup Steps:

1. **Create Account**
   - Go to https://resend.com
   - Sign up with email or GitHub

2. **Verify Domain**
   - Go to "Domains" → "Add Domain"
   - Enter your domain (e.g., `yourdomain.com`)
   - Add DNS records provided by Resend:
     - **SPF Record** (TXT)
     - **DKIM Record** (TXT)
     - **DMARC Record** (TXT)
   - Wait for verification (may take 24-48 hours)

3. **Create API Key**
   - Navigate to "API Keys"
   - Click "Create API Key"
   - Give it a name (e.g., "Production")
   - Copy the API key (starts with `re_`)

4. **Add to Environment**
   ```bash
   RESEND_API_KEY="re_AbCdEf123456"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

#### Important Notes:
- Free tier: 100 emails/day, 3,000/month
- Use a professional `from` address (e.g., noreply@, support@)
- Test emails in development before production

---

### 5. Payment Processing: Stripe

**Purpose**: Handles premium subscription payments, billing, and customer management.

#### Setup Steps:

1. **Create Account**
   - Go to https://stripe.com
   - Sign up and complete business verification
   - Add bank account for payouts

2. **Switch to Live Mode**
   - Toggle from "Test mode" to "Live mode" in dashboard
   - Complete business verification if not done

3. **Get API Keys**
   - Go to "Developers" → "API Keys"
   - Copy **Publishable Key** (starts with `pk_live_`)
   - Copy **Secret Key** (starts with `sk_live_`)

4. **Create Premium Subscription Product**
   
   **a. Create Product:**
   - Go to "Products" → "Add Product"
   - Name: "Premium Membership"
   - Description: "Ad-free streaming and exclusive content"
   - Upload icon/image
   
   **b. Add Pricing:**
   - Choose **Recurring** pricing
   - Set price (e.g., $9.99/month)
   - Currency: USD (or your preference)
   - Billing period: Monthly (or custom)
   - Click "Save"
   
   **c. Copy Price ID:**
   - In product details, copy the **Price ID** (starts with `price_`)

5. **Set Up Webhooks**
   - Go to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select events to listen:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
   - Click "Add endpoint"
   - Copy the **Signing Secret** (starts with `whsec_`)

6. **Add to Environment**
   ```bash
   STRIPE_SECRET_KEY="sk_live_your_key"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
   STRIPE_PREMIUM_PRICE_ID="price_1234567890"
   ```

#### Important Notes:
- Test webhooks using Stripe CLI before production
- Enable 3D Secure authentication for card payments
- Set up tax collection if required
- Configure email receipts in Stripe settings

---

### 6. Authentication: NextAuth

**Purpose**: User authentication with email/password and OAuth providers.

#### Setup Steps:

1. **Generate NextAuth Secret**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output

2. **Add to Environment**
   ```bash
   NEXTAUTH_URL="https://yourdomain.com"
   NEXTAUTH_SECRET="your-generated-secret-from-step-1"
   ```

#### Optional: Google OAuth

1. **Create Google OAuth App**
   - Go to https://console.cloud.google.com
   - Create new project or select existing
   - Enable "Google+ API"
   - Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`
   - Copy **Client ID** and **Client Secret**

2. **Add to Environment**
   ```bash
   GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

#### Optional: GitHub OAuth

1. **Create GitHub OAuth App**
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Application name: "XStream"
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`
   - Copy **Client ID** and **Client Secret**

2. **Add to Environment**
   ```bash
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

---

## Final Configuration

### 1. Complete .env File Example

```bash
# Database
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"

# Redis
REDIS_URL="redis://default:pass@global-xxx.upstash.io:6379"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-nextauth-secret-32-chars"

# OAuth (Optional)
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-secret"
GITHUB_CLIENT_ID="your-github-id"
GITHUB_CLIENT_SECRET="your-github-secret"

# Bunny.net
BUNNY_API_KEY="your-bunny-api-key"
BUNNY_LIBRARY_ID="12345"
BUNNY_STREAM_API_KEY="your-stream-key"
BUNNY_CDN_HOSTNAME="vz-xxxxx.b-cdn.net"

# Resend
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="noreply@yourdomain.com"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_stripe_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_PREMIUM_PRICE_ID="price_your_price_id"

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

### 2. Build and Deploy

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Build the application
npm run build

# Start production server
npm start
```

---

## Deployment Checklist

### Before Going Live:

- [ ] All environment variables configured in deployment platform
- [ ] Database migrations run successfully
- [ ] Redis connection tested
- [ ] Test video upload and playback
- [ ] Test email delivery (verification, password reset)
- [ ] Test Stripe payment flow in live mode
- [ ] OAuth providers configured with production URLs
- [ ] Bunny.net security tokens enabled
- [ ] Stripe webhooks receiving events
- [ ] SSL certificate installed (HTTPS)
- [ ] Domain DNS configured correctly
- [ ] Error monitoring set up (Sentry, LogRocket, etc.)

### Security Checklist:

- [ ] All API keys kept secret (not in git)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Content Security Policy headers configured
- [ ] User input validation in place
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection enabled

### Performance Checklist:

- [ ] Redis caching working
- [ ] CDN configured for static assets
- [ ] Image optimization enabled
- [ ] Database queries optimized
- [ ] Video streaming HLS working smoothly

---

## Cost Estimation (Monthly)

Based on moderate usage (10,000 users, 1,000 videos, 50,000 views/month):

| Service | Estimated Cost |
|---------|----------------|
| Neon Database | Free - $19/month |
| Upstash Redis | Free - $10/month |
| Bunny.net (500GB storage, 1TB bandwidth) | $15-30/month |
| Resend (3,000 emails) | Free |
| Stripe | Transaction fees only (2.9% + $0.30) |
| **Total** | **~$25-60/month** |

---

## Support & Documentation

### Service Documentation Links:

- **Neon**: https://neon.tech/docs
- **Upstash**: https://upstash.com/docs
- **Bunny.net**: https://docs.bunny.net
- **Resend**: https://resend.com/docs
- **Stripe**: https://stripe.com/docs
- **NextAuth**: https://next-auth.js.org

### Need Help?

If you encounter issues during setup:
1. Check service status pages
2. Review error logs in your deployment platform
3. Test each service independently
4. Verify environment variables are loaded correctly

---

## Additional Recommendations

### Monitoring & Analytics:
- Set up **Vercel Analytics** or **Google Analytics**
- Use **Sentry** for error tracking
- Monitor **Bunny.net bandwidth** usage

### Backup Strategy:
- Enable automated **Neon database backups**
- Export critical data weekly
- Keep Redis data ephemeral (cacheable only)

### Scaling Considerations:
- All services scale automatically
- Monitor costs as usage grows
- Consider CDN for static assets
- Implement queue system for heavy video processing

---

**Last Updated**: February 2026
**Document Version**: 1.0

For questions or clarification, please contact your development team.
