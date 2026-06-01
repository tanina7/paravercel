import pool from "@/lib/db";
import { NextResponse } from "next/server";

// 🔥 Por si acaso, ponemos el escudo anti-caché aquí también
export const dynamic = 'force-dynamic';

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
        t.fecha_creacion,
        t.fecha_creacion AS fecha_cierre,
        tt.nombre_tramite AS tipo_tramite, /* <-- AHORA SÍ TRAE EL NOMBRE REAL */
        u.nombre_completo,
        u.correo,
        u.ci,                              /* <-- AÑADIDO: Carnet */
        es.carrera,                        /* <-- AÑADIDO: Carrera */
        es.subsede AS sede,                /* <-- AÑADIDO: Sede */
        st.fecha_solicitud,
        st.total AS monto                  /* <-- AÑADIDO: Monto correctamente nombrado */
      FROM tramites t
      LEFT JOIN solicitudes_tramite st ON t.id_solicitud = st.id_solicitud
      LEFT JOIN usuarios u ON st.id_estudiante = u.id_usuario
      LEFT JOIN estudiantes es ON u.id_usuario = es.id_usuario
      LEFT JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
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