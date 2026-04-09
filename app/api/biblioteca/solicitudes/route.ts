import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        COALESCE(u.nombre_completo, 'Sin nombre') AS nombre_completo,
        COALESCE(u.correo, 'Sin correo') AS correo,
        e.nombre_estado
      FROM tramites t
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN estudiantes es ON s.id_estudiante = es.id_estudiante
      JOIN usuarios u ON es.id_usuario = u.id_usuario
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      WHERE e.nombre_estado IN ('Recibido', 'Pagado')
      ORDER BY t.id_tramite DESC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error en API Solicitudes:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}