import type { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { authConfig } from './auth.config';

export const authOptions: NextAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma) as NextAuthConfig['adapter'],
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            username: true,
            password: true,
            role: true,
            avatarUrl: true,
            isVerified: true,
          },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password as string
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Enforce email verification
        if (!user.isVerified) {
          throw new Error('Please verify your email address before signing in. Check your inbox for the verification link.');
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
