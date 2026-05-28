import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readSessionFromRequest } from '@/lib/auth/session';

function getRedirectPath(role: string) {
  switch (role) {
    case 'STUDENT':
      return '/usuario/landing';
    case 'CASHIER':
      return '/cajero/historial';
    case 'LIBRARIAN':
      return '/bibliotecario/historial';
    case 'ADMIN':
      return '/tramites';
    default:
      return '/';
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await readSessionFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const role = String(user.role || '');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username || 'Usuario',
        role,
        db: user.db || 'legalization',
        permissions: user.permissions || [],
      },
      redirectTo: getRedirectPath(role),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Token inválido' },
      { status: 401 }
    );
  }
}