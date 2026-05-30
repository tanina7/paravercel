import { NextResponse } from 'next/server';
import { getAuthPool } from '@/lib/db';
import { compare, hash } from 'bcryptjs';
import { createSessionToken, setAuthCookie } from '@/lib/auth/session';

type RoleName = 'STUDENT' | 'CASHIER' | 'LIBRARIAN' | 'ADMIN';

function normalizeRole(roleId: number): RoleName {
  switch (Number(roleId)) {
    case 13:
      return 'STUDENT';
    case 3:
      return 'CASHIER';
    case 14:
      return 'LIBRARIAN';
    case 1:
      return 'ADMIN';
    case 4:
      return 'ADMIN';
    default:
      return 'STUDENT';
  }
}

function getRedirectPath(role: RoleName) {
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

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const pool = await getAuthPool();
    const dbSource = 'legalization';

    const [rows] = await pool.execute(
      `SELECT user_id, username, email, first_name, last_name,
              role_id, is_active, password_hash
       FROM system_users
       WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows || (rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    const user = (rows as any[])[0];

    if (!Number(user.is_active)) {
      return NextResponse.json(
        { success: false, error: 'Cuenta inactiva' },
        { status: 403 }
      );
    }

    const stored = String(user.password_hash || '');
    const isHash = /^\$2[aby]\$/.test(stored);

    const ok = isHash
      ? await compare(password, stored)
      : stored === password;

    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    if (!isHash) {
      const hashed = await hash(password, 10);
      await pool.execute(
        'UPDATE system_users SET password_hash = ? WHERE user_id = ?',
        [hashed, user.user_id]
      );
    }

    const roleId = Number(user.role_id);
    const role = normalizeRole(roleId);
    const redirectTo = getRedirectPath(role);

    const response = NextResponse.json({
      success: true,
      redirectTo,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role_id: roleId,
        role,
        db: dbSource,
      },
    });

    const token = await createSessionToken({
      id: user.user_id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role_id: roleId,
      role,
      db: dbSource,
      permissions: [],
    } as any);

    setAuthCookie(response, token);

    return response;
  } catch (err) {
    console.error('LOGIN ERROR:', err);

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}