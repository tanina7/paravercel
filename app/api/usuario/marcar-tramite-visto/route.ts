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

    // 1. Marcar el trámite como visto
    await pool.execute(
      `UPDATE tramites 
       SET visto_por_usuario = 1 
       WHERE id_tramite = ?`,
      [id_tramite]
    );

    // 2. Obtener los datos actuales del trámite
    const [rows]: any = await pool.execute(
      `SELECT 
         t.codigo_tramite, 
         t.fecha_creacion, 
         e.nombre_estado 
       FROM tramites t
       JOIN estados_tramite e ON t.id_estado = e.id_estado
       WHERE t.id_tramite = ?`,
      [id_tramite]
    );

    let codigoOficial = null;
    let qrUrl = null;
    let estado = null;

    if (rows && rows.length > 0) {
      const tramite = rows[0];
      estado = tramite.nombre_estado;

      // 3. Si el trámite está finalizado, armamos el código y la URL del QR
      if (estado === 'Finalizado') {
        const anio = new Date(tramite.fecha_creacion).getFullYear();
        codigoOficial = `UV-${anio}-${tramite.codigo_tramite}`;
        
        // Obtenemos la URL base dinámicamente (ej: http://localhost:3000)
        const origin = request.headers.get('origin') || request.nextUrl.origin;
        qrUrl = `${origin}/verificar/${codigoOficial}`;
      }
    }

    // 4. Retornamos todo al frontend
    return NextResponse.json({
      success: true,
      message: 'Trámite marcado como visto',
      estado: estado,
      datosVerificacion: codigoOficial ? {
        codigo: codigoOficial,
        url: qrUrl
      } : null
    });

  } catch (error) {
    console.error('Error marcando trámite como visto:', error);
    return NextResponse.json(
      { error: 'Error al marcar trámite como visto' },
      { status: 500 }
    );
  }
}