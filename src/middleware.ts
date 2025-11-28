// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Получаем cookie сессии
  const sessionCookie = request.cookies.get('session')?.value;

  // Определяем защищенные маршруты
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

  // Если нет cookie и маршрут защищен, перенаправляем на /auth
  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Если cookie есть, проверяем его валидность
  if (sessionCookie) {
    try {
      const adminAuth = getAdminAuth();
      if (adminAuth) {
         // Верифицируем cookie
        await adminAuth.verifySessionCookie(sessionCookie, true);

        // Если пользователь авторизован и пытается зайти на страницу /auth, редирект на главную
        if (isAuthRoute) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } else {
         // Если Admin SDK не инициализирован, лучше просто пропустить проверку
         return NextResponse.next();
      }
    } catch (error) {
      // Ошибка верификации (cookie невалиден/истек)
      // Если это защищенный маршрут, перенаправляем на /auth
      if (isProtectedRoute) {
        // Удаляем невалидный cookie
        const response = NextResponse.redirect(new URL('/auth', request.url));
        response.cookies.set('session', '', { maxAge: -1 });
        return response;
      }
    }
  }

  // Во всех остальных случаях просто продолжаем
  return NextResponse.next();
}

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
};
