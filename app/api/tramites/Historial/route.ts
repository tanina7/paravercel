import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        t.codigo_tramite,
        t.fecha_creacion,
        u.nombre_completo,
        u.correo
      FROM tramites t
      INNER JOIN solicitudes_tramite st 
        ON t.id_solicitud = st.id_solicitud
      INNER JOIN usuarios u 
        ON st.id_estudiante = u.id_usuario
      ORDER BY t.fecha_creacion DESC
      LIMIT 50
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("ERROR EN CONSULTA:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}