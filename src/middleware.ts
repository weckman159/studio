
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Для продакшена здесь должна быть проверка токена (cookies) или базовая логика.
  // Так как используется клиентская авторизация Firebase, мы просто пропускаем запрос,
  // чтобы не блокировать статику и страницы.
  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - sw.js (service worker)
   * - manifest.json (pwa manifest)
   * - any other files in /public with an extension (e.g., .png, .svg)
   */
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.ico$|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|manifest\\.json$|sw\\.js$).*)',
  ],
};
