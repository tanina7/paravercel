import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        COALESCE(u.nombre_completo, 'Sin nombre') AS nombre_completo,
        e.nombre_estado,
        h.comentario,
        h.fecha
      FROM historial_tramite h
      JOIN tramites t ON h.id_tramite = t.id_tramite
      JOIN estados_tramite e ON h.id_estado = e.id_estado
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN estudiantes es ON s.id_estudiante = es.id_estudiante
      JOIN usuarios u ON es.id_usuario = u.id_usuario
      ORDER BY h.fecha DESC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error en API Historial:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}