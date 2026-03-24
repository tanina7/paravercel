import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT id_tipo as id, nombre_tramite as name, descripcion, costo, COALESCE(requisitos, 'Consultar en oficina de trámites') as requisitos FROM tipos_tramite"
    );
    return Response.json(rows);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}