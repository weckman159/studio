// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const protectedRoutes = [
    '/settings',
    '/garage',
    '/posts/create',
    '/communities/create',
    '/events/create',
    '/marketplace/create',
    '/voting/create',
    '/admin'
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Если пользователь не авторизован и пытается зайти на защищенную страницу
  if (!sessionCookie && isProtectedRoute) {
    const absoluteURL = new URL('/auth', request.nextUrl.origin)
    return NextResponse.redirect(absoluteURL.toString())
  }

  // Если пользователь авторизован и пытается зайти на страницу входа/регистрации
  if (sessionCookie && pathname === '/auth') {
     const absoluteURL = new URL('/', request.nextUrl.origin)
     return NextResponse.redirect(absoluteURL.toString())
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
