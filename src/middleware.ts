import { NextResponse, type NextRequest } from 'next/server';

// This function is marked as async so we can use 'await'
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The Firebase Auth SDK manages its own session tokens in cookies.
  // We don't need to manage our own "session" cookie. We just need to check
  // if any of the Firebase-related session cookies exist.
  // The exact name can vary, but they follow a pattern.
  const hasFirebaseAuthCookie = Object.keys(request.cookies.getAll()).some(
    name => name.startsWith('__session') || name.includes('firebase-session')
  );

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
  
  if (!hasFirebaseAuthCookie && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url);
  }

  if (hasFirebaseAuthCookie && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets, images, and API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
