import { auth } from '@/lib/auth-helper';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(role: 'USER' | 'CREATOR' | 'ADMIN') {
  const user = await requireAuth();
  if (user.role !== role && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  return user;
}
