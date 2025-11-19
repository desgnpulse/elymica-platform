import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    tenantId?: string;
    tenantSubdomain?: string;
    error?: string;
    user: {
      role?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    tenantId?: string;
    tenantSubdomain?: string;
    expiresAt?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    tenantId?: string;
    tenantSubdomain?: string;
    role?: string;
    expiresAt?: number;
    error?: string;
  }
}
