import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id_tramite, estado, comentario, id_usuario } = await req.json();

    // 1. Buscamos el ID del nuevo estado (Finalizado o Rechazado)
    const [estadoRows] = await pool.query(
      "SELECT id_estado FROM estados_tramite WHERE nombre_estado = ?", 
      [estado]
    );
    const nuevoEstadoId = estadoRows[0].id_estado;

    // 2. Actualizamos el trámite
    await pool.query(
      "UPDATE tramites SET id_estado = ? WHERE id_tramite = ?",
      [nuevoEstadoId, id_tramite]
    );

    // 3. Insertamos en el historial para que aparezca en la vista de "Terminados"
    await pool.query(
      "INSERT INTO historial_tramite (id_tramite, id_estado, comentario, fecha) VALUES (?, ?, ?, NOW())",
      [id_tramite, nuevoEstadoId, comentario]
    );

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}