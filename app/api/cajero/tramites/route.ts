import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        t.id_solicitud,
        t.id_estado,

        COALESCE(u.nombre_completo, 'Sin nombre') AS nombre_completo,
        COALESCE(u.correo, 'Sin correo') AS correo,

        e.nombre_estado,
        c.archivo AS comprobante_pago

      FROM tramites t

      -- Estado siempre seguro
      LEFT JOIN estados_tramite e 
        ON t.id_estado = e.id_estado

      -- Base principal
      LEFT JOIN solicitudes_tramite s 
        ON t.id_solicitud = s.id_solicitud

      -- 🔥 CAMBIO IMPORTANTE: evitamos que estudiantes rompa todo
      LEFT JOIN usuarios u 
        ON s.id_estudiante = u.id_usuario

      -- pagos (opcionales)
      LEFT JOIN pagos p 
        ON s.id_solicitud = p.id_solicitud

      LEFT JOIN comprobantes c 
        ON p.id_pago = c.id_pago

      WHERE t.id_estado = 3

      ORDER BY t.id_tramite DESC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error API tramites:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}