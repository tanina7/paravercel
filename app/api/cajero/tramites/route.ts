import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        COALESCE(u.nombre_completo, 'Sin nombre') AS nombre_completo,
        COALESCE(u.correo, 'Sin correo') AS correo,
        e.nombre_estado,
        c.archivo AS comprobante_pago
      FROM tramites t
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN estudiantes es ON s.id_estudiante = es.id_estudiante
      JOIN usuarios u ON es.id_usuario = u.id_usuario

      -- 🔥 RELACIÓN CORRECTA DEL COMPROBANTE
      LEFT JOIN pagos p ON s.id_solicitud = p.id_solicitud
      LEFT JOIN comprobantes c ON p.id_pago = c.id_pago

      WHERE e.nombre_estado = 'Revision Tecnica'
      ORDER BY t.id_tramite DESC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error API tramites:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}