import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id_tramite, aprobar, comentario, id_usuario } = await req.json();

    const nuevoEstado = aprobar ? 'Pagado' : 'Rechazado';

    const [estadoRows]: any = await pool.query(
      "SELECT id_estado FROM estados_tramite WHERE nombre_estado = ?",
      [nuevoEstado]
    );

    if (!estadoRows || estadoRows.length === 0) {
      return NextResponse.json(
        { error: 'Estado no encontrado' },
        { status: 404 }
      );
    }

    const nuevoEstadoId = estadoRows[0].id_estado;

    // 🔹 actualizar trámite
    await pool.query(
      "UPDATE tramites SET id_estado = ? WHERE id_tramite = ?",
      [nuevoEstadoId, id_tramite]
    );

    // 🔹 guardar historial
    await pool.query(
      `INSERT INTO historial_tramite 
      (id_tramite, id_estado, comentario, id_usuario, fecha) 
      VALUES (?, ?, ?, ?, NOW())`,
      [id_tramite, nuevoEstadoId, comentario || '', id_usuario || null]
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error procesar:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}