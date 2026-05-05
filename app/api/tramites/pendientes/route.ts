import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        s.codigo_tramite,
        tt.nombre_tramite AS tipo_tramite,
        e.nombre_estado,
        u.nombre_completo,
        t.fecha_creacion
      FROM tramites t
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN estudiantes es ON s.id_estudiante = es.id_estudiante
      JOIN usuarios u ON es.id_usuario = u.id_usuario
      
      -- Aquí filtramos para que solo aparezcan los trámites activos
      WHERE e.nombre_estado IN ('Iniciado', 'Recibido', 'En Proceso', 'Derivado a Tramites')
      
      ORDER BY t.fecha_creacion DESC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("ERROR API TRAMITES PENDIENTES:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}