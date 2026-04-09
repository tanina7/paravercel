import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id_tramite, comentario, id_usuario } = await req.json();

    if (!id_tramite || isNaN(Number(id_tramite))) {
      return NextResponse.json(
        { error: "El id_tramite es obligatorio y debe ser numérico" },
        { status: 400 }
      );
    }

    // Usamos "Revision Tecnica" en la DB
    const [estadoRows]: any = await pool.query(
      "SELECT id_estado FROM estados_tramite WHERE nombre_estado = ?",
      ["Revision Tecnica"]
    );

    if (!estadoRows || estadoRows.length === 0) {
      return NextResponse.json(
        { error: "Estado 'Revision Tecnica' no encontrado en la base de datos" },
        { status: 404 }
      );
    }

    const nuevoEstadoId = estadoRows[0].id_estado;

    // Actualizar el estado del trámite
    await pool.query(
      "UPDATE tramites SET id_estado = ? WHERE id_tramite = ?",
      [nuevoEstadoId, id_tramite]
    );

    // Registrar en historial
    await pool.query(
      "INSERT INTO historial_tramite (id_tramite, id_estado, comentario, id_usuario, fecha) VALUES (?, ?, ?, ?, NOW())",
      [id_tramite, nuevoEstadoId, comentario || "", id_usuario || null]
    );

    // Retornamos "Aprobado" para mostrar en la UI
    return NextResponse.json({
      success: true,
      mensaje: "Trámite aprobado correctamente",
      id_tramite,
      estado_mostrar: "Aprobado" // <-- aquí es lo que se verá en la tabla
    });
  } catch (error: any) {
    console.error("Error al aprobar trámite:", error);
    return NextResponse.json(
      { error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}