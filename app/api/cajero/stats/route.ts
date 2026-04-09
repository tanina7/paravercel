import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        SUM(CASE WHEN nombre_estado = 'Revision Tecnica' THEN 1 ELSE 0 END) AS revision,
        SUM(CASE WHEN nombre_estado = 'Pagado' THEN 1 ELSE 0 END) AS pagado,
        SUM(CASE WHEN nombre_estado = 'Rechazado' THEN 1 ELSE 0 END) AS rechazado
      FROM tramites t
      JOIN estados_tramite e ON t.id_estado = e.id_estado
    `);
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error("Error stats:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}