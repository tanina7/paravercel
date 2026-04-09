import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        s.codigo_tramite AS codigo_solicitud,
        tt.nombre_tramite,
        t.fecha_creacion,
        t.fecha_finalizacion,
        e.nombre_estado,
        u.nombre_completo AS usuario_asignado
      FROM tramites t
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      LEFT JOIN usuarios u ON t.id_usuario_asignado = u.id_usuario
      ORDER BY t.fecha_creacion DESC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error al obtener trámites:', error);
    return NextResponse.json(
      { error: error.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}