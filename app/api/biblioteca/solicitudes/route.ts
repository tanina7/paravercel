import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.id_tramite,
        u.nombre_completo,
        u.correo,
        e.nombre_estado
      FROM tramites t
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN estudiantes es ON s.id_estudiante = es.id_estudiante
      JOIN usuarios u ON es.id_usuario = u.id_usuario
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      WHERE e.nombre_estado = 'Pagado'
    `);

    return Response.json(rows);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}