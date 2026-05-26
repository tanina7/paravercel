import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tramiteId, firmaId, usuarioOperadorId } = body;

    // 1. Actualizar la tabla 'tramites' al estado 'Completado'
    await pool.query(`
      UPDATE tramites 
      SET id_estado = (SELECT id_estado FROM estados_tramite WHERE nombre_estado = 'Completado' LIMIT 1)
      WHERE id_tramite = ?
    `, [tramiteId]);

    // 2. Obtener el id_solicitud vinculado a este trámite para actualizar su estado general
    const [rows]: any = await pool.query(`
      SELECT id_solicitud FROM tramites WHERE id_tramite = ?
    `, [tramiteId]);

    if (rows && rows.length > 0) {
      const idSolicitud = rows[0].id_solicitud;
      
      // 3. Actualizar la tabla 'solicitudes_tramite' a 'Completado'
      await pool.query(`
        UPDATE solicitudes_tramite 
        SET estado_general = 'Completado'
        WHERE id_solicitud = ?
      `, [idSolicitud]);
    }

    // 4. Registrar la acción en el historial dejando constancia de la firma utilizada
    await pool.query(`
      INSERT INTO historial_tramite (id_tramite, id_estado, id_usuario, comentario) 
      VALUES (
        ?, 
        (SELECT id_estado FROM estados_tramite WHERE nombre_estado = 'Completado' LIMIT 1), 
        ?, 
        CONCAT('Certificado emitido. Firma autorizada ID: ', ?)
      )
    `, [tramiteId, usuarioOperadorId, firmaId]);

    return NextResponse.json({ success: true, message: "Trámite finalizado con éxito." });

  } catch (error: any) {
    console.error("ERROR AL FINALIZAR TRÁMITE:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}