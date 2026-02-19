import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Admin routes require ADMIN role
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn || req.auth?.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // All other matched routes just require authentication
  if (!isLoggedIn) {
    const signInUrl = new URL('/', req.nextUrl.origin);
    signInUrl.searchParams.set('auth', 'signin');
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/profile/:path*',
    '/upload/:path*',
    '/settings/:path*',
    '/studio/:path*',
    '/admin/:path*',
    '/history/:path*',
    '/api/upload/:path*',
  ],
};
