import { NextResponse, NextRequest } from "next/server";
import { readSessionFromRequest } from "@/lib/auth/session";
import { getPool } from "@/lib/db";
import { readFile } from "fs/promises";
import { existsSync, readdirSync } from "fs";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    // Validar sesión
    const session = await readSessionFromRequest(request);
    if (!session || !session.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { codigo } = await params;
    const codigoTramite = codigo?.trim() || "";

    if (!codigoTramite) {
      return NextResponse.json(
        { error: "Código de trámite es requerido" },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // Verificar que el usuario es propietario del trámite
    const [userTramiteRows]: any = await pool.execute(`
      SELECT t.id_tramite, t.id_solicitud FROM tramites t
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN usuarios u ON s.id_estudiante = u.id_usuario
      WHERE t.codigo_tramite = ? AND u.correo = ?
      LIMIT 1
    `, [codigoTramite, session.email]);

    if (!Array.isArray(userTramiteRows) || userTramiteRows.length === 0) {
      return NextResponse.json(
        { error: "Trámite no encontrado o no autorizado" },
        { status: 404 }
      );
    }

    const id_tramite = userTramiteRows[0].id_tramite;

    // Buscar el documento certificado
    let [rows]: any = await pool.execute(`
      SELECT * FROM documentos_adjuntos 
      WHERE id_tramite = ? 
      AND tipo_documento LIKE '%ertificado%'
      ORDER BY id_documento DESC
      LIMIT 1
    `, [id_tramite]);

    if (!Array.isArray(rows) || rows.length === 0) {
      [rows] = await pool.execute(`
        SELECT * FROM documentos_adjuntos 
        WHERE id_tramite = ?
        ORDER BY id_documento DESC
        LIMIT 1
      `, [id_tramite]);
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No se encontró el certificado para este trámite" },
        { status: 404 }
      );
    }

    const documento = rows[0];
    const rutaArchivo = documento.ruta_archivo;
    const rutaCompleta = join(process.cwd(), "public", rutaArchivo);

    console.log(`\n=== DESCARGA CERTIFICADO (Nueva ruta) ===`);
    console.log(`Ruta archivo en DB: ${rutaArchivo}`);
    console.log(`Ruta completa: ${rutaCompleta}`);
    console.log(`¿Archivo existe?: ${existsSync(rutaCompleta)}`);

    if (!existsSync(rutaCompleta)) {
      console.log(`❌ El archivo NO existe en: ${rutaCompleta}`);
      console.log(`Verificando si la carpeta existe: ${existsSync(join(process.cwd(), "public", "uploads"))}`);
      console.log(`Verificando documentos_adjuntos: ${existsSync(join(process.cwd(), "public", "uploads", "documentos_adjuntos"))}`);
      
      // Listar archivos en la carpeta si existe
      const folderPath = join(process.cwd(), "public", "uploads", "documentos_adjuntos");
      if (existsSync(folderPath)) {
        const files = readdirSync(folderPath);
        console.log(`Archivos en la carpeta:`, files);
      }
      
      return NextResponse.json(
        { error: "El archivo no existe en el servidor" },
        { status: 404 }
      );
    }

    // Leer el archivo del disco
    const buffer = await readFile(rutaCompleta);
    console.log(`✓ Archivo leído: ${buffer.length} bytes`);
    console.log(`=== FIN DESCARGA (EXITOSA) ===\n`);

    // Devolver PDF con headers explícitos
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${documento.nombre_archivo}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

    return response;

  } catch (error: any) {
    console.error("Error al descargar certificado:", error);
    return NextResponse.json(
      { error: "Error al descargar el certificado" },
      { status: 500 }
    );
  }
}
