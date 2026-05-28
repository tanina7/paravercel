import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;
    const codigoTramite = codigo?.trim() || "";

    if (!codigoTramite) {
      return NextResponse.json(
        { error: "Código de trámite es requerido" },
        { status: 400 }
      );
    }

    console.log(`Buscando certificado para código: ${codigoTramite}`);

    // 1. Buscar el id_tramite usando el código del trámite
    const [tramiteRows]: any = await pool.query(`
      SELECT id_tramite FROM tramites 
      WHERE codigo_tramite = ?
      LIMIT 1
    `, [codigoTramite]);

    if (!tramiteRows || tramiteRows.length === 0) {
      return NextResponse.json(
        { error: "Trámite no encontrado" },
        { status: 404 }
      );
    }

    const id_tramite = tramiteRows[0].id_tramite;

    // 2. Buscar el documento certificado en la tabla documentos_adjuntos
    // Primero intenta buscar por tipo de documento que contenga "Certificado"
    let [rows]: any = await pool.query(`
      SELECT * FROM documentos_adjuntos 
      WHERE id_tramite = ? 
      AND tipo_documento LIKE '%ertificado%'
      ORDER BY id_documento DESC
      LIMIT 1
    `, [id_tramite]);

    // Si no encuentra, busca cualquier documento del trámite (como respaldo de la búsqueda)
    if (!rows || rows.length === 0) {
      [rows] = await pool.query(`
        SELECT * FROM documentos_adjuntos 
        WHERE id_tramite = ?
        ORDER BY id_documento DESC
        LIMIT 1
      `, [id_tramite]);
    }

    if (!rows || rows.length === 0) {
      console.log(`No se encontró documento para id_tramite: ${id_tramite}`);
      // Devolver lista de documentos disponibles para debug
      const [debugRows]: any = await pool.query(`
        SELECT id_documento, nombre_archivo, tipo_documento FROM documentos_adjuntos 
        WHERE id_tramite = ?
      `, [id_tramite]);
      console.log('Documentos disponibles:', debugRows);
      
      return NextResponse.json(
        { error: "No se encontró el certificado para este trámite", disponibles: debugRows },
        { status: 404 }
      );
    }

    const documento = rows[0];
    const rutaArchivo = documento.ruta_archivo;

    // 3. Construir la ruta completa del archivo
    const rutaCompleta = join(process.cwd(), "public", rutaArchivo);

    // 4. Leer el archivo del disco
    const buffer = await readFile(rutaCompleta);

    // 5. Devolver el archivo como respuesta con headers apropiados
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${documento.nombre_archivo}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

  } catch (error: any) {
    console.error("Error al descargar certificado:", error);

    return NextResponse.json(
      { error: "Error al descargar el certificado" },
      { status: 500 }
    );
  }
}
