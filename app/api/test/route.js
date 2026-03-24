import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT 1 as test");
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message });
  }
}