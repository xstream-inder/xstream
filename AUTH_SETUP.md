# Authentication System Setup

## Overview
Complete authentication system with:
- **Email/Password authentication** using NextAuth.js v5
- **Secure password hashing** with bcryptjs
- **Database sessions** with Prisma adapter
- **Role-based access control** (USER, CREATOR, ADMIN)
- **Protected routes** via middleware
- **Type-safe session management**

## Database Schema
Added NextAuth tables to Prisma schema:
- `Account` - OAuth provider accounts
- `Session` - User sessions
- `VerificationToken` - Email verification tokens
- Updated `User` model with password field

## Files Created

### Backend
- [lib/auth.ts](lib/auth.ts) - NextAuth configuration with Prisma adapter
- [lib/prisma.ts](lib/prisma.ts) - Prisma client singleton
- [lib/validations/auth.ts](lib/validations/auth.ts) - Zod validation schemas
- [lib/utils/session.ts](lib/utils/session.ts) - Session utility functions
- [server/actions/auth.ts](server/actions/auth.ts) - Server actions for registration
- [types/next-auth.d.ts](types/next-auth.d.ts) - TypeScript type definitions

### Frontend
- [app/auth/signin/page.tsx](app/auth/signin/page.tsx) - Sign in page
- [app/auth/signup/page.tsx](app/auth/signup/page.tsx) - Sign up page
- [components/auth/user-menu.tsx](components/auth/user-menu.tsx) - User dropdown menu
- [components/layout/navbar.tsx](components/layout/navbar.tsx) - Main navigation bar
- [app/profile/page.tsx](app/profile/page.tsx) - User profile page

### Configuration
- [middleware.ts](middleware.ts) - Protected routes middleware
- Updated [app/layout.tsx](app/layout.tsx) - Added navbar
- Updated [schema.prisma](schema.prisma) - NextAuth tables

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Update Environment Variables
Make sure your `.env` or `.env.local` has:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xstream"
DIRECT_URL="postgresql://user:password@localhost:5432/xstream"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 3. Run Database Migration
```bash
npx prisma db push
```

Or generate and run migration:
```bash
npx prisma migrate dev --name add_auth_tables
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```

## Features

### Password Security
- **Minimum 8 characters**
- **Must contain**: uppercase, lowercase, number
- **Hashed with bcryptjs** (12 rounds)
- Passwords never stored in plain text

### Session Management
- JWT-based sessions
- 30-day session duration
- Automatic token refresh
- Secure HTTP-only cookies

### Protected Routes
The following routes require authentication:
- `/profile/*` - User profile pages
- `/upload/*` - Video upload
- `/settings/*` - User settings
- `/api/upload/*` - Upload API endpoints

### Role-Based Access
Three user roles:
- **USER** - Default role, can view content
- **CREATOR** - Can upload and manage videos
- **ADMIN** - Full platform access

### API Routes
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Create account (via server action)
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

## Usage Examples

### Server-Side Session Check
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return <div>Welcome {session.user.username}!</div>;
}
```

### Client-Side Session Hook
```typescript
'use client';
import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;
  
  return <div>Hello {session.user.username}</div>;
}
```

### Require Specific Role
```typescript
import { requireRole } from '@/lib/utils/session';

export default async function CreatorPage() {
  const user = await requireRole('CREATOR');
  
  return <div>Creator dashboard for {user.username}</div>;
}
```

### Sign Out
```typescript
'use client';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/' })}>
      Sign Out
    </button>
  );
}
```

## Testing

### Create Test User
1. Navigate to `http://localhost:3000/auth/signup`
2. Fill in:
   - Email: test@example.com
   - Username: testuser
   - Password: Test1234
   - Confirm Password: Test1234
3. Click "Create account"
4. Sign in at `http://localhost:3000/auth/signin`

### Verify Database
```bash
npx prisma studio
```
Check the `users` table for your test user.

## Security Best Practices

✅ **Implemented:**
- Password hashing with bcryptjs
- Input validation with Zod
- SQL injection protection (Prisma)
- XSS protection (React)
- CSRF protection (NextAuth)
- Secure session management
- HTTP-only cookies

🔒 **Recommended additions:**
- Rate limiting on auth endpoints
- Email verification
- Two-factor authentication (2FA)
- Password reset flow
- Account lockout after failed attempts
- Audit logging

## Troubleshooting

### "Invalid email or password"
- Check that user exists in database
- Verify password was hashed correctly
- Check NEXTAUTH_SECRET is set

### Session not persisting
- Clear browser cookies
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is consistent

### Middleware not protecting routes
- Verify middleware.ts is in root directory
- Check matcher patterns in middleware config
- Restart dev server after changes

### Database connection errors
- Verify DATABASE_URL is correct
- Check database is running
- Run `npx prisma db push`

## Next Steps

Consider adding:
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Account settings page
- [ ] Admin dashboard
- [ ] User management for admins
