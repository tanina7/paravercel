import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [[pendientes]]: any = await pool.query(`
      SELECT COUNT(*) as total FROM tramites t
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      WHERE e.nombre_estado = 'Recibido'
    `);

    const [[aprobados]]: any = await pool.query(`
      SELECT COUNT(*) as total FROM tramites t
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      WHERE e.nombre_estado = 'Finalizado'
    `);

    const [[rechazados]]: any = await pool.query(`
      SELECT COUNT(*) as total FROM tramites t
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      WHERE e.nombre_estado = 'Rechazado'
    `);

    return NextResponse.json({
      pendientes: pendientes.total,
      aprobados: aprobados.total,
      rechazados: rechazados.total
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}