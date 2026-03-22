import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM tramites");
    return Response.json(rows);
  } catch (error: any) {
    return Response.json({ error: error.message });
  }
}