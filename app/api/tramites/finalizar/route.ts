import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import puppeteer from "puppeteer";

async function generarPDF(tramiteId: string | number) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  const url = `http://localhost:3000/tramites/${tramiteId}`;

  await page.goto(url, {
    waitUntil: "networkidle0",
    timeout: 0,
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: "15mm",
      bottom: "15mm",
      left: "20mm",
      right: "20mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}

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

    // 2. Obtener el id_solicitud
    const [rows]: any = await pool.query(`
      SELECT id_solicitud FROM tramites WHERE id_tramite = ?
    `, [tramiteId]);

    if (rows && rows.length > 0) {
      const idSolicitud = rows[0].id_solicitud;

      // 3. Actualizar solicitud
      await pool.query(`
        UPDATE solicitudes_tramite 
        SET estado_general = 'Completado'
        WHERE id_solicitud = ?
      `, [idSolicitud]);
    }

    // 4. Historial
    await pool.query(`
      INSERT INTO historial_tramite (id_tramite, id_estado, id_usuario, comentario) 
      VALUES (
        ?, 
        (SELECT id_estado FROM estados_tramite WHERE nombre_estado = 'Finalizado' LIMIT 1), 
        ?, 
        CONCAT('Certificado emitido. Firmas autorizadas IDs: ', ?)
      )
    `, [tramiteId, usuarioOperadorId || null, firmasIds || 'Ninguna']);

    // 5. Archivo certificado
    if (archivo) {
      const UPLOAD_DIR = join(process.cwd(), 'public/uploads/documentos_adjuntos');
      await mkdir(UPLOAD_DIR, { recursive: true });

      const timestamp = Date.now();
      const nombreOriginal = archivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const nombreArchivo = `${tramiteId}_certificado_${timestamp}_${nombreOriginal}`;
      const rutaArchivo = `/uploads/documentos_adjuntos/${nombreArchivo}`;

      const buffer = await archivo.arrayBuffer();
      await writeFile(
        join(UPLOAD_DIR, nombreArchivo),
        Buffer.from(buffer)
      );

      const [tramiteRows]: any = await pool.query(`
        SELECT tt.nombre_tramite 
        FROM tramites t 
        LEFT JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo 
        WHERE t.id_tramite = ?
      `, [tramiteId]);

      const tipoDocumento = tramiteRows?.length
        ? tramiteRows[0].nombre_tramite
        : 'Certificado';

      await pool.query(`
        INSERT INTO documentos_adjuntos (id_tramite, nombre_archivo, ruta_archivo, tipo_documento) 
        VALUES (?, ?, ?, ?)
      `, [tramiteId, archivo.name, rutaArchivo, tipoDocumento]);
    }

    // 6. Archivo respaldo
    if (respaldo) {
      const UPLOAD_DIR = join(process.cwd(), 'public/uploads/documentos_adjuntos');
      await mkdir(UPLOAD_DIR, { recursive: true });

      const timestamp = Date.now();
      const nombreOriginal = respaldo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const nombreArchivo = `${tramiteId}_respaldo_${timestamp}_${nombreOriginal}`;
      const rutaArchivo = `/uploads/documentos_adjuntos/${nombreArchivo}`;

      const buffer = await respaldo.arrayBuffer();
      await writeFile(
        join(UPLOAD_DIR, nombreArchivo),
        Buffer.from(buffer)
      );

      await pool.query(`
        INSERT INTO documentos_adjuntos (id_tramite, nombre_archivo, ruta_archivo, tipo_documento) 
        VALUES (?, ?, ?, ?)
      `, [tramiteId, respaldo.name, rutaArchivo, 'Respaldo Adicional']);
    }

    // 7. GENERAR PDF EN BACKGROUND (NO BLOQUEA RESPUESTA)
    setTimeout(async () => {
      try {
        const pdf = await generarPDF(tramiteId);

        const pdfName = `${tramiteId}_certificado_final.pdf`;

        const pdfPath = join(
          process.cwd(),
          "public/uploads/documentos_adjuntos",
          pdfName
        );

        await writeFile(pdfPath, pdf);

        await pool.query(`
          INSERT INTO documentos_adjuntos 
          (id_tramite, nombre_archivo, ruta_archivo, tipo_documento) 
          VALUES (?, ?, ?, ?)
        `, [
          tramiteId,
          pdfName,
          `/uploads/documentos_adjuntos/${pdfName}`,
          "Certificado PDF Oficial"
        ]);

      } catch (err) {
        console.error("ERROR GENERANDO PDF:", err);
      }
    }, 0);

    return NextResponse.json({
      success: true,
      message: "Trámite finalizado con éxito."
    });

  } catch (error: any) {
    console.error("ERROR AL FINALIZAR TRÁMITE:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}