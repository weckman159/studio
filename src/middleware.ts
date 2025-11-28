import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  const protectedRoutes = [
    '/settings',
    '/garage',
    '/posts/create',
    '/posts/edit',
    '/communities/create',
    '/events/create',
    '/marketplace/create',
    '/marketplace/edit',
    '/voting/create',
    '/admin',
    '/messages',
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = pathname === '/auth';

  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
