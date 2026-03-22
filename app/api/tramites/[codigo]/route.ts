import pool from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { codigo: string } }
) {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM tramites WHERE codigo = ?",
      [params.codigo]
    );

    if (rows.length === 0) {
      return Response.json({ error: "No encontrado" }, { status: 404 });
    }

    return Response.json(rows[0]);
  } catch (error: any) {
    return Response.json({ error: error.message });
  }
}