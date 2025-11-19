import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = ['/login', '/api/auth', '/favicon.ico'];

export async function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith('/_next');

  const tenantFromHost = host.split('.')[0];
  const requestHeaders = new Headers(request.headers);

  if (tenantFromHost) {
    requestHeaders.set('x-elymica-tenant', tenantFromHost);
  }

  if (isPublic) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
