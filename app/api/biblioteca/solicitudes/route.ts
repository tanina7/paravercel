import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        t.id_solicitud,
        u.nombre_completo,
        u.correo,
        e.nombre_estado,
        c.archivo AS comprobante_pago

      FROM tramites t

      JOIN solicitudes_tramite s
        ON t.id_solicitud = s.id_solicitud

      JOIN usuarios u
        ON s.id_estudiante = u.id_usuario

      JOIN estados_tramite e
        ON t.id_estado = e.id_estado

      LEFT JOIN pagos p
        ON s.id_solicitud = p.id_solicitud

      LEFT JOIN comprobantes c
        ON p.id_pago = c.id_pago

      WHERE e.nombre_estado IN ('Recibido', 'Pagado')

      ORDER BY t.id_tramite DESC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error en API Biblioteca:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}