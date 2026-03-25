import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id_tramite, estado, comentario, id_usuario } = await req.json();

    const [estadoRows]: any = await pool.query(
      "SELECT id_estado FROM estados_tramite WHERE nombre_estado = ?",
      [estado]
    );

    if (estadoRows.length === 0) {
      return Response.json({ error: "Estado inválido" }, { status: 400 });
    }

    const id_estado = estadoRows[0].id_estado;

    await pool.query(
      "UPDATE tramites SET id_estado = ? WHERE id_tramite = ?",
      [id_estado, id_tramite]
    );

    await pool.query(
      `INSERT INTO historial_tramite 
       (id_tramite, id_estado, comentario, id_usuario) 
       VALUES (?, ?, ?, ?)`,
      [id_tramite, id_estado, comentario, id_usuario]
    );

    return Response.json({ ok: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}