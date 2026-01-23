import { auth } from '@/lib/auth-helper';

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== '/auth/signin') {
    const newUrl = new URL('/auth/signin', req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: [
    '/profile/:path*',
    '/upload/:path*',
    '/settings/:path*',
    '/api/upload/:path*',
  ],
};
