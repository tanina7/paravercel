import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        h.id_historial,
        t.id_tramite,
        u.nombre_completo AS estudiante,
        e.nombre_estado,
        h.comentario,
        h.fecha
      FROM historial_tramite h
      JOIN tramites t ON h.id_tramite = t.id_tramite
      JOIN estados_tramite e ON h.id_estado = e.id_estado
      LEFT JOIN usuarios u ON t.id_usuario_asignado = u.id_usuario
      ORDER BY h.fecha DESC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error historial:', error);
    return NextResponse.json(
      { error: error.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}