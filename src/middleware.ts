import { NextResponse, type NextRequest } from 'next/server';

// This function is marked as async so we can use 'await'
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
  
  const isAuthenticated = !!sessionCookie;

  if (!isAuthenticated && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
