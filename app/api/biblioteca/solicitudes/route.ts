import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Esta consulta une las tablas para sacar el Nombre y Correo que pide tu tabla
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        u.nombre_completo,
        u.correo,
        e.nombre_estado
      FROM tramites t
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN estudiantes es ON s.id_estudiante = es.id_estudiante
      JOIN usuarios u ON es.id_usuario = u.id_usuario
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      WHERE e.nombre_estado IN ('Recibido', 'Pagado')
      ORDER BY t.id_tramite DESC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error en API Biblioteca:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}