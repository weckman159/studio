import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Для продакшена здесь должна быть проверка токена (cookies) или базовая логика.
  // Так как используется клиентская авторизация Firebase, мы просто пропускаем запрос,
  // чтобы не блокировать статику и страницы.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
