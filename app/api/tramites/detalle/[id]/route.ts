import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const urlParts = request.url.split('/');
    const id = urlParts.pop();

    if (!id || id === 'undefined' || id === 'detalle') {
      return NextResponse.json({ success: false, error: "ID de trámite inválido" }, { status: 400 });
    }

    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        t.codigo_tramite,
        t.fecha_creacion AS fecha_cierre,
        'Trámite Universitario' AS tipo_tramite, 
        u.nombre_completo,
        u.correo,
        st.fecha_solicitud,
        st.total
      FROM tramites t
      LEFT JOIN solicitudes_tramite st ON t.id_solicitud = st.id_solicitud
      LEFT JOIN usuarios u ON st.id_estudiante = u.id_usuario
      WHERE t.id_tramite = ?
    `, [id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: "Trámite no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });

  } catch (error: any) {
    console.error("ERROR EN API DETALLE:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}