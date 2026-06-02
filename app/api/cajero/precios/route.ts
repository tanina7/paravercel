import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        id_tipo,
        nombre_tramite,
        descripcion,
        costo
      FROM tipos_tramite
      ORDER BY nombre_tramite
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}