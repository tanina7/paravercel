import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Asegúrate de que esta ruta apunte a tu configuración de base de datos

export async function GET(
  request: Request,
  { params }: { params: { codigo: string } }
) {
  try {
    const { codigo } = params;

    // Buscamos el trámite por su código_tramite
    // Ajusta los nombres de las tablas y campos según tu DB real
    const [rows]: any = await pool.query(
      `SELECT 
        t.codigo_tramite, 
        tt.nombre_tramite, 
        u.nombre_completo, 
        u.ci, 
        est.carrera, 
        est.subsede AS sede, 
        t.fecha_creacion 
       FROM tramites t
       JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
       JOIN usuarios u ON s.id_estudiante = u.id_usuario
       LEFT JOIN estudiantes est ON u.id_usuario = est.id_usuario
       JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
       WHERE t.codigo_tramite = ?`,
      [codigo]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const tramite = rows[0];

    return NextResponse.json({
      success: true,
      tramite: {
        codigo_tramite: tramite.codigo_tramite,
        tipo_tramite: tramite.nombre_tramite,
        nombre_completo: tramite.nombre_completo,
        ci: tramite.ci,
        carrera: tramite.carrera || 'N/A',
        sede: tramite.sede || 'N/A',
        fecha_emision: new Date(tramite.fecha_creacion).toLocaleDateString('es-ES'),
        estado: 'Finalizado'
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}