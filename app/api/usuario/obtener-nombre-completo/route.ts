import { NextRequest, NextResponse } from 'next/server';
import { readSessionFromRequest } from '@/lib/auth/session';
import { createAuthConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Obtener la sesión del usuario
    const session = await readSessionFromRequest(request);
    
    if (!session || !session.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    console.log('Buscando usuario con email:', session.email);

    // Obtener pool de la BD legalization
    const pool = await createAuthConnection();

    // Buscar en system_users por correo
    const [rows] = await pool.execute(
      'SELECT first_name, last_name FROM system_users WHERE email = ?',
      [session.email]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      console.warn('Usuario no encontrado en system_users para:', session.email);
      return NextResponse.json(
        { error: 'Usuario no encontrado en system_users' },
        { status: 404 }
      );
    }

    const user = rows[0] as { first_name: string; last_name: string };
    const nombreCompleto = `${user.first_name} ${user.last_name}`.trim();

    console.log('Nombre completo encontrado:', nombreCompleto);

    return NextResponse.json({
      nombreCompleto,
      firstName: user.first_name,
      lastName: user.last_name,
    });
  } catch (error) {
    console.error('Error obteniendo nombre completo:', error);
    return NextResponse.json(
      { error: 'Error al obtener nombre completo' },
      { status: 500 }
    );
  }
}
