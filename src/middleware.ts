import { NextResponse, type NextRequest } from 'next/server';

// This function is marked as async so we can use 'await'
export function middleware(request: NextRequest) {
  // Authentication is temporarily disabled for development.
  // Proceed with the request without any checks.
  return NextResponse.next();
}

export const config = {
  // Match all routes except for static assets, images, and API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
