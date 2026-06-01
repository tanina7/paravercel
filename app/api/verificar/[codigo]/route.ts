import pool from "@/lib/db";
import { NextResponse } from "next/server";

// 🔥 Desactivamos la caché para que siempre verifique en tiempo real
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Extraemos el código de la URL
    const urlParts = request.url.split('/');
    const codigo = urlParts.pop();

    if (!codigo || codigo === 'undefined') {
      return NextResponse.json({ success: false, error: "Código de verificación inválido" }, { status: 400 });
    }

    // 2. Buscamos el trámite. 
    // Usamos CONCAT para armar el formato "UV-Año-Codigo" y compararlo con lo que escribió el usuario.
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        t.codigo_tramite,
        t.fecha_creacion,
        t.fecha_creacion AS fecha_cierre,
        tt.nombre_tramite AS tipo_tramite,
        u.nombre_completo,
        u.correo,
        u.ci,
        es.carrera,
        es.subsede AS sede,
        st.fecha_solicitud,
        st.total AS monto
      FROM tramites t
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      LEFT JOIN solicitudes_tramite st ON t.id_solicitud = st.id_solicitud
      LEFT JOIN usuarios u ON st.id_estudiante = u.id_usuario
      LEFT JOIN estudiantes es ON u.id_usuario = es.id_usuario
      LEFT JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
      WHERE 
        (t.codigo_tramite = ? OR CONCAT('UV-', YEAR(t.fecha_creacion), '-', t.codigo_tramite) = ?)
        AND e.nombre_estado = 'Finalizado'
    `, [codigo, codigo]);

    // 3. Si no existe o no está "Finalizado", devolvemos error 404
    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: "Documento no encontrado o inválido" }, { status: 404 });
    }

    // 4. Si todo está correcto, enviamos los datos
    return NextResponse.json({ success: true, data: rows[0] });

  } catch (error: any) {
    console.error("ERROR EN API VERIFICACIÓN:", error.message);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}