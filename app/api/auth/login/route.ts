import { NextResponse } from 'next/server';
import { getAuthPool } from '@/lib/db';
import { compare, hash } from 'bcryptjs';
import { createSessionToken, setAuthCookie } from '@/lib/auth/session';
import { getDefaultPermissionsForRole } from '@/lib/auth/permissions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const pool = await getAuthPool();

    // Buscar el usuario en la nueva BD con estructura system_users
    const [users] = await pool.execute(
      'SELECT user_id, username, email, first_name, last_name, role_id, is_active, password_hash FROM system_users WHERE email = ? LIMIT 1',
      [email]
    );

    if (!users || (users as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const user = (users as any[])[0];

    if (!Number(user.is_active)) {
      return NextResponse.json(
        { success: false, error: 'Tu cuenta está inactiva. Contacta al administrador.' },
        { status: 403 }
      );
    }

    const storedPassword = String(user.password_hash || '');
    const isBcryptHash = /^\$2[aby]\$/.test(storedPassword);
    const passwordMatches = isBcryptHash
      ? await compare(password, storedPassword)
      : storedPassword === password;

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Migrar contraseñas legacy en texto plano al primer login exitoso
    if (!isBcryptHash) {
      const upgradedHash = await hash(password, 10);
      await pool.execute(
        'UPDATE system_users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?',
        [upgradedHash, user.user_id]
      );
    }

    // Obtener permisos del rol
    const [permissionRows] = await pool.execute(
      'SELECT permission_key FROM role_permissions WHERE role_id = ? ORDER BY permission_key ASC',
      [user.role_id]
    );

    const dbPermissions = (permissionRows as any[])
      .map((row) => String(row.permission_key || '').trim())
      .filter(Boolean);

    const effectivePermissions = dbPermissions.length > 0
      ? dbPermissions
      : getDefaultPermissionsForRole(Number(user.role_id ?? 0));

    const response = NextResponse.json({
      success: true,
      message: 'Sesión iniciada correctamente',
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role_id: user.role_id,
        permissions: effectivePermissions,
      },
    });

    // Establecer cookie de autenticación
    const authToken = await createSessionToken({
      id: user.user_id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role_id: Number(user.role_id ?? 0),
      permissions: effectivePermissions,
    });

    setAuthCookie(response, authToken);
    return response;

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
