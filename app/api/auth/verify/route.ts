import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readSessionFromRequest } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const user = await readSessionFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.username || 'Usuario'),
        role_id: user.role_id ?? 0,
        permissions: user.permissions || [],
      },
    });

  } catch {
    return NextResponse.json(
      { success: false, error: 'Token inválido' },
      { status: 401 }
    );
  }
}
