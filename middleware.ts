import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TODO: Middleware authentication disabled for Edge Function compatibility
// Edge Functions cannot access database connections
// Re-enable after migrating auth logic to client-side or API routes

export async function middleware(request: NextRequest) {
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
