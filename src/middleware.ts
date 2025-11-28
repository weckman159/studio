import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuth } from './lib/firebase-admin';
import { cookies } from 'next/headers';

// This function is marked as async so we can use 'await'
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = (await cookies()).get('session');
  const sessionCookieValue = sessionCookie?.value;

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
  
  let isAuthenticated = false;
  if (sessionCookieValue) {
    try {
      const adminAuth = getAdminAuth();
      if(adminAuth){
        await adminAuth.verifySessionCookie(sessionCookieValue, true);
        isAuthenticated = true;
      }
    } catch (error) {
      // Session cookie is invalid.
      isAuthenticated = false;
    }
  }


  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
