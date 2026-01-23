import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    role: UserRole;
    avatarUrl: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      role: UserRole;
      avatarUrl: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: UserRole;
    avatarUrl: string | null;
  }
}
