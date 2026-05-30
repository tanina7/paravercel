import { NextRequest, NextResponse } from 'next/server';
import { readSessionFromRequest } from '@/lib/auth/session';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Obtener la sesión del usuario
    const session = await readSessionFromRequest(request);
    
    if (!session || !session.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id_tramite } = await request.json();

    if (!id_tramite) {
      return NextResponse.json(
        { error: 'ID de trámite requerido' },
        { status: 400 }
      );
    }

    // Obtener pool de la BD
    const pool = await getPool();

    // Marcar el trámite como visto
    const [result] = await pool.execute(
      `UPDATE tramites 
       SET visto_por_usuario = 1 
       WHERE id_tramite = ?`,
      [id_tramite]
    );

    return NextResponse.json({
      success: true,
      message: 'Trámite marcado como visto'
    });

  } catch (error) {
    console.error('Error marcando trámite como visto:', error);
    return NextResponse.json(
      { error: 'Error al marcar trámite como visto' },
      { status: 500 }
    );
  }
}
