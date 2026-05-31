import { NextRequest, NextResponse } from 'next/server';
import { readSessionFromRequest } from '@/lib/auth/session';
import { getPool } from '@/lib/db';

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

    console.log('Obteniendo historial para usuario:', session.email);

    // Obtener pool de la BD
    const pool = await getPool();

    // Buscar todos los trámites del usuario por correo
    const [rows] = await pool.execute(
      `SELECT 
        t.id_tramite,
        t.codigo_tramite,
        t.id_solicitud,
        s.codigo_tramite as codigo_solicitud,
        tt.nombre_tramite as tipo_tramite,
        et.nombre_estado as nombre_estado,
        u.nombre_completo,
        u.correo,
        t.fecha_creacion,
        t.id_estado
      FROM tramites t
      LEFT JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
      LEFT JOIN estados_tramite et ON t.id_estado = et.id_estado
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN usuarios u ON s.id_estudiante = u.id_usuario
      WHERE u.correo = ?
      ORDER BY t.fecha_creacion DESC`,
      [session.email]
    );

    if (!Array.isArray(rows)) {
      return NextResponse.json({
        tramites: [],
        message: 'Sin trámites registrados'
      });
    }

    console.log('Trámites encontrados:', rows.length);

    return NextResponse.json({
      tramites: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial' },
      { status: 500 }
    );
  }
}
