import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id_tramite, aprobar, comentario, id_usuario } = await req.json();

    // 1. Definir estado
    const nuevoEstado = aprobar ? "Pagado" : "Rechazado";

    // 2. Obtener ID del estado
    const [estadoRows]: any = await pool.query(
      "SELECT id_estado FROM estados_tramite WHERE nombre_estado = ?",
      [nuevoEstado]
    );

    if (!estadoRows || estadoRows.length === 0) {
      return NextResponse.json(
        { error: "Estado no encontrado" },
        { status: 400 }
      );
    }

    const nuevoEstadoId = estadoRows[0].id_estado;

    // 3. Actualizar trámite
    await pool.query(
      "UPDATE tramites SET id_estado = ? WHERE id_tramite = ?",
      [nuevoEstadoId, id_tramite]
    );

    // 4. Guardar historial
    await pool.query(
      `INSERT INTO historial_tramite 
      (id_tramite, id_estado, comentario, id_usuario, fecha)
      VALUES (?, ?, ?, ?, NOW())`,
      [
        id_tramite,
        nuevoEstadoId,
        comentario || "",
        id_usuario || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Trámite procesado correctamente",
    });

  } catch (error: any) {
    console.error("Error en /api/cajero/procesar:", error);

    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}