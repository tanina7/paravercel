import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        h.id_historial, 
        t.id_tramite,
        u.nombre_completo,
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

    return Response.json(rows);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}