import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { AuthService, createApiClient } from '@elymica/api-client';

const authBaseURL =
  process.env.AUTH_SERVICE_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'https://auth.elymica.com';

const authService = new AuthService(
  createApiClient({
    baseURL: authBaseURL,
  })
);

const REFRESH_BUFFER_MS = 60 * 1000; // refresh 1 minute before expiry

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenant: { label: 'School Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password || !credentials.tenant) {
          return null;
        }

        try {
          const response = await authService.login({
            email: credentials.email,
            password: credentials.password,
            tenant_subdomain: credentials.tenant,
          });

          if (!response.success) {
            return null;
          }

          const expiresInSeconds = Number.parseInt(response.expires_in, 10);
          const expiresAt = Number.isNaN(expiresInSeconds)
            ? Date.now() + 60 * 60 * 1000
            : Date.now() + expiresInSeconds * 1000;

          return {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            tenantId: response.tenant.id,
            tenantSubdomain: response.tenant.subdomain,
            expiresAt,
          };
        } catch (error) {
          console.error('Auth error', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          userId: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          tenantId: user.tenantId,
          tenantSubdomain: user.tenantSubdomain,
          expiresAt: user.expiresAt,
        };
      }

      const expiresAt = token.expiresAt as number | undefined;
      if (expiresAt && Date.now() < expiresAt - REFRESH_BUFFER_MS) {
        return token;
      }

      if (!token.refreshToken) {
        return { ...token, error: 'RefreshTokenMissing' };
      }

      try {
        const refreshed = await authService.refreshToken({
          refresh_token: token.refreshToken as string,
        });

        const expiresInSeconds = Number.parseInt(refreshed.expires_in, 10);
        const newExpiry = Number.isNaN(expiresInSeconds)
          ? Date.now() + 60 * 60 * 1000
          : Date.now() + expiresInSeconds * 1000;

        return {
          ...token,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token,  // Store new refresh token (rotation)
          expiresAt: newExpiry,
          error: undefined,
        };
      } catch (error) {
        console.error('Failed to refresh access token', error);
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    async session({ session, token }) {
      session.userId = token.userId as string | undefined;
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      session.error = token.error as string | undefined;
      session.tenantId = token.tenantId as string | undefined;
      session.tenantSubdomain = token.tenantSubdomain as string | undefined;
      session.user.role = token.role as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
