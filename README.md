# XStream

A Next.js 15 video streaming platform with Bunny CDN integration.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

- `app/` - Next.js 15 App Router pages and layouts
- `components/upload/` - Upload-related components
- `lib/bunny/` - Bunny CDN client and utilities
- `server/actions/` - Server actions for data mutations
- `app/api/webhooks/` - Webhook endpoints

## Features

- Next Auth authentication
- Video upload with Bunny CDN
- Server Actions for form handling
- Webhook support
