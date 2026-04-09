import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id_tramite, estado, comentario } = await req.json();

    if (!id_tramite || !estado) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const [estadoRows]: any = await pool.query(
      "SELECT id_estado FROM estados_tramite WHERE nombre_estado = ?",
      [estado]
    );

    if (!estadoRows || estadoRows.length === 0) {
      return NextResponse.json({ error: `Estado '${estado}' no encontrado` }, { status: 404 });
    }

    const nuevoEstadoId = estadoRows[0].id_estado;

    await pool.query(
      "UPDATE tramites SET id_estado = ? WHERE id_tramite = ?",
      [nuevoEstadoId, id_tramite]
    );

    await pool.query(
      "INSERT INTO historial_tramite (id_tramite, id_estado, comentario, fecha) VALUES (?, ?, ?, NOW())",
      [id_tramite, nuevoEstadoId, comentario || ""]
    );

    return NextResponse.json({ success: true, mensaje: "Trámite procesado" });
  } catch (error: any) {
    console.error("Error procesando trámite:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}