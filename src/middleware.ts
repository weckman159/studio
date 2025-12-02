import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Для продакшена здесь должна быть проверка токена (cookies).
  // Поскольку мы используем клиентский Firebase SDK, полноценная серверная проверка
  // требует firebase-admin и передачи session cookie.
  // Пока оставляем пустым, чтобы не ломать клиентскую навигацию,
  // так как защита реализована на уровне компонентов (useUser).
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
