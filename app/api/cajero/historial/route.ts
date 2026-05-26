import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        COALESCE(u.nombre_completo, 'Sin nombre') AS nombre_completo,
        COALESCE(u.correo, 'Sin correo') AS correo,
        e.nombre_estado,
        h.comentario,
        h.fecha
      FROM historial_tramite h

      INNER JOIN (
        SELECT id_tramite, MAX(fecha) AS ultima_fecha
        FROM historial_tramite
        GROUP BY id_tramite
      ) ult 
        ON h.id_tramite = ult.id_tramite 
       AND h.fecha = ult.ultima_fecha

      JOIN tramites t 
        ON h.id_tramite = t.id_tramite

      JOIN estados_tramite e 
        ON h.id_estado = e.id_estado

      JOIN solicitudes_tramite s 
        ON t.id_solicitud = s.id_solicitud

      -- 🔥 CAMBIO CLAVE (SIN estudiantes)
      JOIN usuarios u 
        ON s.id_estudiante = u.id_usuario

      WHERE LOWER(e.nombre_estado) IN ('pagado', 'rechazado')

      ORDER BY h.fecha DESC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("Error historial:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}