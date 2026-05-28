import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let tramiteId: string | number;
    let firmasIds: string;
    let usuarioOperadorId: string | number | null = null;
    let archivo: File | null = null;
    let respaldo: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      tramiteId = formData.get("tramiteId") as string;
      firmasIds = formData.get("firmasIds") as string;
      usuarioOperadorId = formData.get("usuarioOperadorId") as string;
      archivo = formData.get("archivo") as File;
      respaldo = formData.get("respaldo") as File;
    } else {
      const body = await request.json();
      tramiteId = body.tramiteId;
      firmasIds = body.firmasIds;
      usuarioOperadorId = body.usuarioOperadorId;
    }

    // 1. Actualizar la tabla 'tramites' al estado 'Finalizado'
    await pool.query(`
      UPDATE tramites 
      SET id_estado = (SELECT id_estado FROM estados_tramite WHERE nombre_estado = 'Finalizado' LIMIT 1)
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

    // 4. Registrar la acción en el historial dejando constancia de las firmas utilizadas
    // Si firmasIds viene vacío por alguna razón, usamos 'null' explícito para que MySQL no lance error
    await pool.query(`
      INSERT INTO historial_tramite (id_tramite, id_estado, id_usuario, comentario) 
      VALUES (
        ?, 
        (SELECT id_estado FROM estados_tramite WHERE nombre_estado = 'Finalizado' LIMIT 1), 
        ?, 
        CONCAT('Certificado emitido. Firmas autorizadas IDs: ', ?)
      )
    `, [tramiteId, usuarioOperadorId || null, firmasIds || 'Ninguna']);

    // 5. Si viene un archivo de certificado, guardarlo y asociarlo en 'documentos_adjuntos'
    if (archivo) {
      const UPLOAD_DIR = join(process.cwd(), 'public/uploads/documentos_adjuntos');
      try {
        await mkdir(UPLOAD_DIR, { recursive: true });
      } catch (err) {
        // Ignorar si el directorio ya existe
      }

      const timestamp = Date.now();
      const nombreOriginal = archivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const nombreArchivo = `${tramiteId}_certificado_${timestamp}_${nombreOriginal}`;
      const rutaArchivo = `/uploads/documentos_adjuntos/${nombreArchivo}`;

      // Guardar en disco
      const buffer = await archivo.arrayBuffer();
      await writeFile(
        join(UPLOAD_DIR, nombreArchivo),
        Buffer.from(buffer)
      );

      // Obtener el tipo de trámite para utilizarlo como tipo_documento
      const [tramiteRows]: any = await pool.query(`
        SELECT tt.nombre_tramite 
        FROM tramites t 
        LEFT JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo 
        WHERE t.id_tramite = ?
      `, [tramiteId]);
      
      const tipoDocumento = (tramiteRows && tramiteRows.length > 0)
        ? tramiteRows[0].nombre_tramite
        : 'Certificado';

      // Insertar en la tabla documentos_adjuntos
      await pool.query(`
        INSERT INTO documentos_adjuntos (id_tramite, nombre_archivo, ruta_archivo, tipo_documento) 
        VALUES (?, ?, ?, ?)
      `, [tramiteId, archivo.name, rutaArchivo, tipoDocumento]);
    }

    // 6. Si viene un archivo de respaldo adicional (opcional), guardarlo y asociarlo en 'documentos_adjuntos'
    if (respaldo) {
      const UPLOAD_DIR = join(process.cwd(), 'public/uploads/documentos_adjuntos');
      try {
        await mkdir(UPLOAD_DIR, { recursive: true });
      } catch (err) {
        // Ignorar si el directorio ya existe
      }

      const timestamp = Date.now();
      const nombreOriginal = respaldo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const nombreArchivo = `${tramiteId}_respaldo_${timestamp}_${nombreOriginal}`;
      const rutaArchivo = `/uploads/documentos_adjuntos/${nombreArchivo}`;

      // Guardar en disco
      const buffer = await respaldo.arrayBuffer();
      await writeFile(
        join(UPLOAD_DIR, nombreArchivo),
        Buffer.from(buffer)
      );

      // Insertar en la tabla documentos_adjuntos
      await pool.query(`
        INSERT INTO documentos_adjuntos (id_tramite, nombre_archivo, ruta_archivo, tipo_documento) 
        VALUES (?, ?, ?, ?)
      `, [tramiteId, respaldo.name, rutaArchivo, 'Respaldo Adicional']);
    }

    return NextResponse.json({ success: true, message: "Trámite finalizado con éxito." });

  } catch (error: any) {
    console.error("ERROR AL FINALIZAR TRÁMITE:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}