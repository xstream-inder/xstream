# XStream — Full Application Audit & Action Roadmap

> **Audit Date:** February 19, 2026  
> **Last Updated:** Phase 1 completed — February 19, 2026  
> **Status Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Completed

---

## Table of Contents

1. [Phase 1 — Critical Security Fixes](#phase-1--critical-security-fixes)
2. [Phase 2 — Data Integrity & Broken Features](#phase-2--data-integrity--broken-features)
3. [Phase 3 — Incomplete Features & Missing Functionality](#phase-3--incomplete-features--missing-functionality)
4. [Phase 4 — Inconsistencies & Code Quality](#phase-4--inconsistencies--code-quality)
5. [Phase 5 — Performance & Caching](#phase-5--performance--caching)
6. [Phase 6 — Testing & DevOps](#phase-6--testing--devops)
7. [Detailed Findings Reference](#detailed-findings-reference)

---

## Phase 1 — Critical Security Fixes

> **Priority:** IMMEDIATE — These are active vulnerabilities.

| # | Task | File(s) | Status | Notes |
|---|------|---------|--------|-------|
| 1.1 | **Add authentication to Bunny webhook** — validate `VideoLibraryId`, add secret query param or custom header check | `app/api/webhooks/bunny/route.ts` | ✅ | Added `BUNNY_WEBHOOK_SECRET` validation + `VideoLibraryId` check |
| 1.2 | **Enforce email verification** — check `isVerified` in `authorize()` before allowing sign-in | `lib/auth.ts` | ✅ | `authorize()` now checks `isVerified` and throws if false |
| 1.3 | **Add rate limiting to auth endpoints** — sign-in, sign-up, password reset, email verification | `lib/auth.ts`, `server/actions/auth.ts`, `server/actions/password-reset.ts`, `server/actions/verification.ts` | ✅ | Added `signInRateLimiter` (5/15min), `signUpRateLimiter` (3/hr), `passwordResetRateLimiter` (3/hr), `formSubmitRateLimiter` (3/hr) |
| 1.4 | **Remove hardcoded secret fallbacks** — Stripe test key, Redis dummy credentials; throw in production if env vars missing | `lib/stripe.ts`, `lib/redis.ts` | ✅ | Production throws if env vars missing; dev uses safe placeholders |
| 1.5 | **Sanitize HTML in email templates** — escape user input before interpolating into email HTML body | `server/actions/legal.ts`, `server/actions/reporting.ts`, `server/actions/support.ts` | ✅ | Created `escapeHtml()` utility; applied to all user inputs in emails |
| 1.6 | **Fix password reset user enumeration** — return generic success message regardless of email existence | `server/actions/password-reset.ts` | ✅ | Now returns generic success message regardless of email existence |
| 1.7 | **Add Zod validation to all server actions** — `finalizeUpload`, `updateVideo`, `updateVideoStatus`, `createCategory`, `createTag`, `createModel`, `createUploadSignature` | `server/actions/video.ts`, `server/actions/admin.ts`, `server/actions/bunny.ts` | ✅ | Created `lib/validations/schemas.ts` with shared Zod schemas; applied to all actions |
| 1.8 | **Add `/admin/:path*` and `/studio/:path*` to middleware matcher** | `middleware.ts` | ✅ | Added `/admin/:path*`, `/studio/:path*`, `/history/:path*` with role-based checks |
| 1.9 | **Add security headers** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy | `next.config.ts` | ✅ | Added 6 security headers via `next.config.ts` `headers()` function |
| 1.10 | **Unify password policy** — apply 8+ char, uppercase + lowercase + number requirement to password reset & profile change | `server/actions/password-reset.ts`, `server/actions/user.ts`, `components/auth/auth-modal.tsx` (minLength) | ✅ | Unified to 8+ chars with complexity requirements; bcrypt cost normalized to 12 |

---

## Phase 2 — Data Integrity & Broken Features

> **Priority:** HIGH — These cause data corruption or broken user flows.

| # | Task | File(s) | Status | Notes |
|---|------|---------|--------|-------|
| 2.1 | **Fix Stripe webhook type cast** — use proper types for `invoice.payment_succeeded` (`Stripe.Invoice`) vs `checkout.session.completed` (`Stripe.Checkout.Session`) | `app/api/webhooks/stripe/route.ts` | ✅ | Proper types per event; switch/case structure; removed `as any` casts |
| 2.2 | **Add `WatchHistory` model** — separate from `VideoView` analytics; update history page and clear-history to use it | `prisma/schema.prisma`, `server/actions/history.ts`, `app/history/page.tsx` | ✅ | New model with upsert-on-rewatch; clearHistory no longer deletes analytics |
| 2.3 | **Add `Report` model** — persist reports to DB with status (PENDING/REVIEWED/DISMISSED/ACTIONED); add admin moderation page | `prisma/schema.prisma`, `server/actions/reporting.ts`, `app/admin/reports/` | ✅ | Full CRUD + admin moderation page with status tabs |
| 2.4 | **Fix auth check order in Bunny upload** — verify auth BEFORE making external API call | `server/actions/bunny.ts` | ✅ | Completed in Phase 1 |
| 2.5 | **Add Bunny video deletion** — implement `deleteVideo()` in Bunny client; call from video delete action | `lib/bunny/client.ts`, `server/actions/video.ts` | ✅ | `BunnyClient.deleteVideo()` added; called from `deleteVideo` action |
| 2.6 | **Fix Redis/DB like sync** — add retry logic or transactional sync instead of fire-and-forget | `server/actions/engagement.ts` | ✅ | 3 retries with backoff; failed syncs queued to Redis set for reconciliation |
| 2.7 | **Normalize bcrypt cost factor** — use cost 12 everywhere | `server/actions/password-reset.ts`, `server/actions/user.ts` | ✅ | Completed in Phase 1 |
| 2.8 | **Resolve dual tag implementation** — choose `String[]` OR `VideoTag` join table, not both | `prisma/schema.prisma`, `server/actions/search.ts`, `components/video/related-videos.tsx` | ✅ | Removed `tags String[]`; all queries use `VideoTag` join table |
| 2.9 | **Remove generic webhook placeholder** | `app/api/webhooks/route.ts` | ✅ | File deleted |
| 2.10 | **Add missing Stripe webhook events** — `customer.subscription.updated`, `invoice.payment_failed` | `app/api/webhooks/stripe/route.ts` | ✅ | Added both events + `customer.subscription.deleted` handler fixed |

---

## Phase 3 — Incomplete Features & Missing Functionality

> **Priority:** MEDIUM — These are visible gaps users will encounter.

| # | Task | File(s) | Status | Notes |
|---|------|---------|--------|-------|
| 3.1 | **Fix "Show more videos" button** — add pagination or infinite scroll to homepage | `app/page.tsx` | ✅ | Added VIDEOS_PER_PAGE=40, prev/next pagination links |
| 3.2 | **Wire Subscribe button on profile page** — connect to `toggleSubscription` action | `app/profile/[username]/page.tsx` | ✅ | Wired SubscribeButton component, Edit Profile links to /settings |
| 3.3 | **Fix cookie consent preferences** — wire individual checkboxes to state; save granular preferences | `components/compliance/cookie-consent.tsx` | ✅ | CookiePreferences interface, checkboxes wired to useState, saves JSON |
| 3.4 | **Fix admin upload `categoryIds`** — map selected category to actual ID | `components/admin/upload-form.tsx` | ✅ | Fetches real categories from DB, passes IDs + tags + newModelNames |
| 3.5 | **Create `/auth/error` page** — handle auth error redirects properly | `app/auth/error/page.tsx` (new) | ✅ | Error type mapping, Try Again + Go Home buttons |
| 3.6 | **Create `/auth/signout` page** | `app/auth/signout/page.tsx` (new) | ✅ | Confirmation UI with Sign Out + Cancel buttons |
| 3.7 | **Add pagination to `/best` and `/new` pages** | `app/best/page.tsx`, `app/new/page.tsx` | ✅ | VIDEOS_PER_PAGE=36, prev/next links, total count in header |
| 3.8 | **Link `Model` to `User`** — add optional `userId` FK on Model for creator profiles | `prisma/schema.prisma` | ✅ | Added userId FK with unique constraint, User.model back-relation |
| 3.9 | **Implement `VideoPlayer` buffering spinner** | `components/video/video-player.tsx` | ✅ | isBuffering state, onWaiting/onCanPlay/onPlaying handlers, spinner overlay |
| 3.10 | **Add video player error retry** — show retry button instead of just "Stream error" | `components/video/video-player.tsx` | ✅ | Retry button destroys/re-creates HLS instance |
| 3.11 | **Replace `alert()`/`confirm()` with proper UI** in admin upload, delete video, video list | `components/ui/confirm-dialog.tsx` (new), etc. | ✅ | ConfirmDialogProvider + useConfirm() hook, all 3 files updated |
| 3.12 | **Add avatar upload** — replace URL-paste with actual image upload on profile | `components/user/profile-form.tsx` | ✅ | File input with preview, data URL conversion, 2MB limit |
| 3.13 | **Remove Playlists/Photos/About tabs** from profile OR implement them | `app/profile/[username]/page.tsx` | ✅ | Removed dead tabs, kept Videos only |
| 3.14 | **Add notifications system** — notify subscribers of new uploads | `server/actions/notifications.ts`, `components/layout/notification-bell.tsx` (new) | ✅ | Full CRUD, triggers on publish + subscribe, bell UI with polling |
| 3.15 | **Remove empty `garb/` directory** | `garb/` | ✅ | Directory removed |
| 3.16 | **Remove `User.clerkId` from schema** | `prisma/schema.prisma` | ✅ | clerkId field removed |
| 3.17 | **Fix auth modal success message** — show the actual server response instead of hardcoded message | `components/auth/auth-modal.tsx` | ✅ | Uses result.message from server response |

---

## Phase 4 — Inconsistencies & Code Quality

> **Priority:** LOW — These affect maintainability and visual consistency.

### 4A. Visual Inconsistencies

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | **Unify dark mode palette** — replace all `dark:bg-gray-*` with `dark:bg-dark-*` (or vice versa) across all pages and components | ✅ | Replaced ~60 class instances across 20+ files |
| 4.2 | **Unify brand colors** — replace `bg-blue-600` with `bg-xred-600` in comments, upload, compliance, profile components | ✅ | Replaced across 14 files |
| 4.3 | **Unify button border-radius** — pick `rounded-lg` for primary, `rounded-full` for icon-only | ✅ | Bulk `rounded-md` → `rounded-lg` across all components |
| 4.4 | **Unify input styling** — consistent `rounded-lg`, background, and border across all forms | ✅ | Unified to `rounded-lg` everywhere |
| 4.5 | **Unify error message styling** — consistent red banner style across all forms | ✅ | Standardized 9 error blocks with consistent pattern |
| 4.6 | **Unify focus ring colors** — use brand color consistently | ✅ | All focus rings → `focus:ring-xred-500` |
| 4.7 | **Unify layout max-width** — pick 2 widths max (full-width + constrained) | ✅ | Unified to `max-w-[1800px]` |
| 4.8 | **Unify empty state patterns** — consistent icon + message component | ✅ | SVG icon + h3 + p pattern in 4 files |
| 4.9 | **Unify confirmation UX** — create a reusable confirmation modal to replace `confirm()`/`alert()` | ✅ | Created ConfirmDialogProvider + useConfirm hook |

### 4B. Code Quality

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.10 | **Extract duplicated utilities** — move `formatNumber()`, `formatDuration()`, `formatViews()`, `formatTimeAgo()` to `lib/utils.ts` | ✅ | Centralized in lib/utils.ts, all consumers updated |
| 4.11 | **Remove duplicated `cn()` from `lib/ads.ts`** — import from `lib/utils.ts` | ✅ | Removed, imports from lib/utils |
| 4.12 | **Unify server action error format** — standardize on `{ success: boolean, error?: string, data?: T }` | ✅ | Fixed password-reset, verification, user actions + consumers |
| 4.13 | **Remove dead imports** — `usePathname` in navbar, `useCallback` in video-player, `useEffect` in sidebar-provider | ✅ | Cleaned up all unused imports |
| 4.14 | **Fix `as any` type assertions** — add proper types for PrismaAdapter, orientation fields, video status | ✅ | Replaced with proper types |
| 4.15 | **Fix CommentItem direct prop mutation** — `comment.content = editContent.trim()` — use immutable update | ✅ | Uses onCommentUpdate callback |
| 4.16 | **Fix ReportModal `setState` during render** — move `setHasSubmitted(true)` to an effect | ✅ | Moved to useEffect |
| 4.17 | **Break up VideoPlayer** — extract into `useVideoPlayer` hook + sub-components (controls, progress bar) | ✅ | Split into use-video-player.ts hook + video-controls.tsx + slim video-player.tsx |
| 4.18 | **Move helper functions out of VideoCard** — `formatDuration`, `getPreviewUrl`, etc. should be module-level | ✅ | Moved to module-level, use lib/utils |
| 4.19 | **Fix SidebarContent re-creation** — extract to a standalone component instead of inline function | ✅ | Extracted to standalone SidebarContent component |
| 4.20 | **Fix Tailwind config** — remove `./pages/**` from content (App Router only), add safelist for dynamic classes | ✅ | Removed pages/**, added safelist |
| 4.21 | **Clean up unused Prisma Session model** — JWT strategy never writes to it | ✅ | Removed Session model from schema |
| 4.22 | **Clean up unused Account snake_case fields** — add `@map()` or normalize to match schema conventions | ✅ | Added @map() for camelCase fields |

---

## Phase 5 — Performance & Caching

> **Priority:** MEDIUM — These impact page load times and database load.

| # | Task | File(s) | Status | Notes |
|---|------|---------|--------|-------|
| 5.1 | **Add `unstable_cache` or React `cache()` to hot pages** — homepage, best, new, categories, tags | `app/page.tsx`, `app/best/page.tsx`, `app/new/page.tsx`, etc. | ⬜ | Every page hits DB on every request |
| 5.2 | **Deduplicate data fetching** — share data between `generateMetadata()` and page component | `app/video/[id]/page.tsx`, `app/category/[slug]/page.tsx`, `app/tag/[slug]/page.tsx`, `app/model/[slug]/page.tsx` | ⬜ | Same query runs twice per page load |
| 5.3 | **Add composite database indexes** — `[status, createdAt]` on videos, `[userId, viewedAt]` on video_views | `prisma/schema.prisma` | ⬜ | Missing indexes for common query patterns |
| 5.4 | **Add `publishedAt` index** on videos | `prisma/schema.prisma` | ⬜ | Sorting by publish date has no index |
| 5.5 | **Fix N+1 in cron sync** — batch UPDATE statements instead of individual `prisma.video.update()` | `app/api/cron/sync-stats/route.ts` | ⬜ | 1 UPDATE per video |
| 5.6 | **Fix N+1 in tag processing** — batch upserts for tags and video-tag relations | `server/actions/video.ts` | ⬜ | Sequential upsert per tag |
| 5.7 | **Add route-segment loading/error boundaries** — for `/video/[id]`, `/admin`, `/category/[slug]` | `app/video/[id]/loading.tsx` (new), `app/video/[id]/error.tsx` (new), etc. | ⬜ | Only root-level error/loading exist |
| 5.8 | **Add `revalidate` exports** to appropriate pages | Various pages | ⬜ | No ISR configured anywhere |

---

## Phase 6 — Testing & DevOps

> **Priority:** MEDIUM — Essential for long-term reliability.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | **Write tests for auth server actions** — register, sign-in, verify-email, password-reset | ⬜ | Zero test coverage |
| 6.2 | **Write tests for video server actions** — finalizeUpload, updateVideo, deleteVideo | ⬜ | |
| 6.3 | **Write tests for engagement actions** — toggleLike, toggleSubscription, incrementView | ⬜ | |
| 6.4 | **Write tests for admin actions** — createCategory, createTag, getAdminStats | ⬜ | |
| 6.5 | **Write tests for webhook handlers** — Stripe + Bunny | ⬜ | |
| 6.6 | **Write component tests** — VideoCard, CommentSection, AgeGateModal, AuthModal | ⬜ | |
| 6.7 | **Add Vitest coverage configuration** | ⬜ | Coverage reporting not configured |
| 6.8 | **Add metadata to all public pages** — homepage, contact, FAQ, premium | ⬜ | Multiple public pages have no SEO metadata |
| 6.9 | **Add structured data (JSON-LD)** — Organization, WebSite, VideoObject schemas | ⬜ | No structured data anywhere |
| 6.10 | **Add sitemap generation** | ⬜ | No sitemap.xml |
| 6.11 | **Add robots.txt** | ⬜ | No robots.txt |
| 6.12 | **Add OAuth provider** — Google at minimum | ⬜ | Only credentials provider |
| 6.13 | **Add 2FA support** — at least for admin accounts | ⬜ | No 2FA |

---

## Phase 7 — Accessibility

> **Priority:** LOW-MEDIUM — Required for compliance and inclusive UX.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | **Add focus traps to all modals** — auth modal, report modal, age-gate modal | ⬜ | Users can Tab out of modals |
| 7.2 | **Add `aria-label` to all video player controls** — play/pause, volume, fullscreen, speed, quality | ⬜ | Screen readers can't identify controls |
| 7.3 | **Make progress bar keyboard-accessible** — add `role="slider"`, `aria-valuenow`, `onKeyDown` | ⬜ | Only responds to mouse click |
| 7.4 | **Add `role="menu"` and keyboard navigation to dropdowns** — user menu, quality picker, speed picker | ⬜ | No arrow key navigation |
| 7.5 | **Add `role="listbox"` and keyboard nav to search suggestions** | ⬜ | No `aria-activedescendant` |
| 7.6 | **Add `aria-live` region for clipboard feedback** — share button "Copied!" message | ⬜ | Screen reader misses the feedback |
| 7.7 | **Add `Escape` key handler to all modals** | ⬜ | Only backdrop click closes modals |
| 7.8 | **Add `aria-label` to navigation landmarks** — main nav, sidebar nav, footer nav | ⬜ | Generic `<nav>` without label |

---

## Detailed Findings Reference

### Database Schema Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| No `Report` model | HIGH | Reports emailed only, no persistence or tracking |
| No `WatchHistory` model | HIGH | Piggybacked on `VideoView` with unique constraint — broken |
| Dual tag implementation | MEDIUM | `Video.tags` (String[]) AND `VideoTag` join table — two sources of truth |
| No `Notification` model | LOW | Subscriptions exist but no way to notify |
| No `Playlist` / `Favorites` model | LOW | Common platform feature missing |
| `Model` has no `userId` FK | MEDIUM | Can't link creator profile to User account |
| `User.clerkId` is dead weight | LOW | Clerk not used anywhere |
| `Session` model unused | LOW | JWT strategy never writes to it |
| Missing `bio` field on `User` | LOW | Profile page has no about/bio section |
| Account model uses snake_case without `@map()` | LOW | Inconsistent with schema conventions |
| Verification tokens use UUID instead of `crypto.randomBytes` | LOW | Not cryptographically ideal |

### Auth System Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| Email verification not enforced | CRITICAL | `authorize()` never checks `isVerified` |
| No rate limiting on auth | CRITICAL | Brute force, credential stuffing, email bombing possible |
| Inconsistent bcrypt cost | MEDIUM | Registration=12, reset/profile=10 |
| Password policy mismatch | MEDIUM | Signup enforces complexity, reset/profile don't |
| 30-day JWT with no invalidation | MEDIUM | Password change doesn't invalidate old sessions |
| Role changes not reflected in active sessions | MEDIUM | JWT keeps old role until re-auth |
| No account lockout | MEDIUM | No limit on failed sign-in attempts |
| PrismaAdapter creates unused DB rows | LOW | Account/Session rows created but never used in JWT mode |
| Auth pages are redirect shells | LOW | `/auth/signin` just redirects to `/?auth=signin` |

### API & Server Action Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| Bunny webhook unauthenticated | CRITICAL | Anyone can change video statuses |
| Stripe webhook wrong type cast | HIGH | `invoice.payment_succeeded` handler broken |
| Generic webhook is placeholder | MEDIUM | Dead code, should be removed |
| Fire-and-forget DB sync | HIGH | Redis/DB divergence on failure |
| Auth check after Bunny API call | HIGH | Creates orphaned videos |
| No UUID validation on ID params | MEDIUM | All server actions accept arbitrary strings |
| LIKE pattern chars not escaped in search | LOW | `%` and `_` in search terms affect results |
| Admin stats fetches unused `videoView.count()` | LOW | Dead query |
| `updateVideoStatus` uses `as any` | MEDIUM | Bypasses enum type safety |

### Component Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| ReportModal `setState` during render | HIGH | Potential infinite re-render loop |
| Cookie consent preferences non-functional | MEDIUM | Always saves `'all'` |
| Admin upload categoryIds always `[]` | MEDIUM | TODO comment |
| CommentItem mutates props directly | MEDIUM | Violates React immutability |
| VideoPlayer VAST tag prop unused | LOW | Ad integration not implemented |
| Related videos placeholder content | LOW | "Sponsored Content" is dummy divs |
| Comment count shows loaded count, not total | LOW | Misleading count |
| AuthModal success message hardcoded | LOW | Ignores server response |

---

## Phase 8 — Phase 3 Review Fixes & Hardening

> **Priority:** HIGH — Bugs found during build testing and Phase 3 implementation review.

### 8A. Build Errors Fixed (this session)

| # | Task | File(s) | Status | Notes |
|---|------|---------|--------|-------|
| 8.1 | **Fix Stripe v20 `current_period_end`** — property moved from `Subscription` to `SubscriptionItem` | `app/api/webhooks/stripe/route.ts` | ✅ | `subscription.current_period_end` → `subscription.items.data[0].current_period_end` |
| 8.2 | **Fix Stripe v20 `invoice.subscription`** — property moved to `invoice.parent.subscription_details.subscription` | `app/api/webhooks/stripe/route.ts` | ✅ | Already fixed in prior session |
| 8.3 | **Fix `VideoMetadata.orientation` type** — was `string`, must be `VideoOrientation` enum | `components/upload/video-uploader.tsx` | ✅ | Import `VideoOrientation` from Prisma, cast radio value |
| 8.4 | **Fix `updateProfile` return type mismatch** — `useActionState` requires consistent shape | `server/actions/user.ts`, `components/user/profile-form.tsx` | ✅ | Explicit return type, all branches return `{ success, error, message }` |

### 8B. Phase 3 Implementation Bugs Fixed (this session)

| # | Task | File(s) | Status | Notes |
|---|------|---------|--------|-------|
| 8.5 | **Fix avatar upload Zod validation** — `z.string().url()` rejects `data:image/…` URIs | `server/actions/user.ts` | ✅ | Added `.or(z.string().startsWith('data:image/'))` |
| 8.6 | **Add avatar upload error feedback** — silent return on validation failure | `components/user/profile-form.tsx` | ✅ | Added alert messages for file type and size errors |
| 8.7 | **Add LESBIAN to admin upload orientation** — missing from radio button list | `components/admin/upload-form.tsx` | ✅ | Added to `['STRAIGHT', 'GAY', 'TRANS', 'LESBIAN']` |
| 8.8 | **Add Escape key to confirm dialog** — backdrop click worked, keyboard didn't | `components/ui/confirm-dialog.tsx` | ✅ | Added `useEffect` with `keydown` listener |
| 8.9 | **Fix pagination disabled links** — `pointer-events-none` on `<Link>` still keyboard-navigable | `app/page.tsx`, `app/best/page.tsx`, `app/new/page.tsx` | ✅ | Replaced with `<span>` when disabled |

### 8C. Remaining Issues (not yet fixed)

| # | Task | File(s) | Status | Notes |
|---|------|---------|--------|-------|
| 8.10 | **Upload avatars to CDN** — data URLs stored in DB cause bloat (~2.7 MB per avatar) | `server/actions/user.ts`, `components/user/profile-form.tsx` | ⬜ | Upload to Bunny CDN or S3, store URL only |
| 8.11 | **Fix password minLength mismatch** — client allows 6 chars, Zod requires 8 | `components/user/profile-form.tsx`, `components/auth/auth-modal.tsx` | ⬜ | Align client `minLength={8}` with server schema |
| 8.12 | **Migrate from `middleware.ts` to `proxy`** — Next.js 16 deprecated middleware file convention | `middleware.ts` | ⬜ | Replace with proxy convention per Next.js 16 docs |
| 8.13 | **Fix `Notification.createdAt` serialization** — typed as `Date` but arrives as `string` over wire | `components/layout/notification-bell.tsx` | ⬜ | Change type to `Date | string` or deserialize |

---

## Completion Tracking

| Phase | Total Tasks | Completed | Progress |
|-------|------------|-----------|----------|
| Phase 1 — Security | 10 | 10 | 100% |
| Phase 2 — Data Integrity | 10 | 10 | 100% |
| Phase 3 — Incomplete Features | 17 | 17 | 100% |
| Phase 4 — Inconsistencies | 22 | 22 | 100% |
| Phase 5 — Performance | 8 | 0 | 0% |
| Phase 6 — Testing & DevOps | 13 | 0 | 0% |
| Phase 7 — Accessibility | 8 | 0 | 0% |
| Phase 8 — Review Fixes | 13 | 9 | 69% |
| **TOTAL** | **101** | **68** | **67%** |

---

*Update this file as tasks are completed. Change ⬜ → 🟡 when in progress, 🟡 → ✅ when done. Update the completion tracking table accordingly.*
