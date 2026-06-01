import { NextResponse } from 'next/server';
import pool from '@/lib/db'; 

export async function GET(request: Request, { params }: { params: { codigo: string } }) {
  try {
    const { codigo } = params;

    const [rows]: any = await pool.query(
      `SELECT t.codigo_tramite, tt.nombre_tramite, u.nombre_completo, u.ci, est.carrera, est.subsede AS sede, t.fecha_creacion 
       FROM tramites t
       JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
       JOIN usuarios u ON s.id_estudiante = u.id_usuario
       LEFT JOIN estudiantes est ON u.id_usuario = est.id_usuario
       JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
       WHERE t.codigo_tramite = ?`,
      [codigo]
    );

    if (rows.length === 0) return NextResponse.json({ success: false }, { status: 404 });

    return NextResponse.json({
      success: true,
      tramite: {
        codigo_tramite: rows[0].codigo_tramite,
        tipo_tramite: rows[0].nombre_tramite,
        nombre_completo: rows[0].nombre_completo,
        ci: rows[0].ci,
        carrera: rows[0].carrera,
        sede: rows[0].sede,
        fecha_emision: new Date(rows[0].fecha_creacion).toLocaleDateString('es-ES')
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}