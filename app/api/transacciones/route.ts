import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        s.id_solicitud,
        s.codigo_tramite AS nro_recibo,
        u.nombre_completo AS estudiante,
        tt.nombre_tramite AS concepto,
        s.total AS monto,
        'Caja Central 1' AS cajero
      FROM solicitudes_tramite s
      JOIN usuarios u ON s.id_estudiante = u.id_usuario
      JOIN detalle_solicitud ds ON s.id_solicitud = ds.id_solicitud
      JOIN tipos_tramite tt ON ds.id_tipo = tt.id_tipo
      WHERE s.estado_general IN ('Pagado', 'Completado')
      ORDER BY s.id_solicitud DESC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("ERROR AL OBTENER TRANSACCIONES:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}