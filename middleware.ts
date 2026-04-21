import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readSessionFromRequest } from '@/lib/auth/session';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/usuario/landing',
  '/usuario',
  '/bibliotecario',
  '/tramites',
  '/carrito',
  '/dashboard',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Verificar si la ruta necesita protección
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const session = await readSessionFromRequest(request);

    if (!session) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

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
