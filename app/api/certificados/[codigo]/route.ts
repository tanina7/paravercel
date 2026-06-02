import { NextResponse, NextRequest } from "next/server";
import { readSessionFromRequest } from "@/lib/auth/session";
import { getPool } from "@/lib/db";
import { readFile } from "fs/promises";
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

    console.log(`\n=== DESCARGANDO CERTIFICADO ===`);
    console.log(`Código de trámite solicitado: ${codigoTramite}`);
    console.log(`Usuario email: ${session.email}`);

    const pool = await getPool();

    // 1. Verificar que el usuario es propietario del trámite
    const [userTramiteRows]: any = await pool.execute(`
      SELECT t.id_tramite, t.id_solicitud FROM tramites t
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN usuarios u ON s.id_estudiante = u.id_usuario
      WHERE t.codigo_tramite = ? AND u.correo = ?
      LIMIT 1
    `, [codigoTramite, session.email]);

    console.log(`Query 1 - Resultado de buscar trámite:`, userTramiteRows);

    if (!Array.isArray(userTramiteRows) || userTramiteRows.length === 0) {
      console.log(`❌ No se encontró trámite para código: ${codigoTramite}`);
      return NextResponse.json(
        { error: "Trámite no encontrado o no autorizado" },
        { status: 404 }
      );
    }

    const id_tramite = userTramiteRows[0].id_tramite;
    const id_solicitud = userTramiteRows[0].id_solicitud;
    
    console.log(`✓ Trámite encontrado: id_tramite=${id_tramite}, id_solicitud=${id_solicitud}`);

    // 2. Buscar el documento certificado en la tabla documentos_adjuntos
    // Primero intenta buscar por tipo de documento que contenga "Certificado"
    let [rows]: any = await pool.execute(`
      SELECT * FROM documentos_adjuntos 
      WHERE id_tramite = ? 
      AND tipo_documento LIKE '%ertificado%'
      ORDER BY id_documento DESC
      LIMIT 1
    `, [id_tramite]);

    console.log(`Query 2a - Búsqueda por 'Certificado' (id_tramite=${id_tramite}):`, rows);

    // Si no encuentra, busca cualquier documento del trámite (como respaldo de la búsqueda)
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`  → No encontrado con 'Certificado', buscando cualquier documento...`);
      [rows] = await pool.execute(`
        SELECT * FROM documentos_adjuntos 
        WHERE id_tramite = ?
        ORDER BY id_documento DESC
        LIMIT 1
      `, [id_tramite]);
      
      console.log(`Query 2b - Búsqueda por cualquier documento:`, rows);
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`❌ No se encontró documento para id_tramite: ${id_tramite}`);
      // Devolver lista de documentos disponibles para debug
      const [debugRows]: any = await pool.execute(`
        SELECT id_documento, id_tramite, nombre_archivo, tipo_documento FROM documentos_adjuntos 
        WHERE id_tramite = ?
      `, [id_tramite]);
      console.log(`Debug - Documentos en base de datos para este trámite:`, debugRows);
      
      // También verificar los documentos de la solicitud por si acaso
      const [solicitudDocs]: any = await pool.execute(`
        SELECT d.id_documento, d.id_tramite, d.nombre_archivo, d.tipo_documento 
        FROM documentos_adjuntos d
        JOIN tramites t ON d.id_tramite = t.id_tramite
        WHERE t.id_solicitud = ?
      `, [id_solicitud]);
      console.log(`Debug - Documentos de toda la solicitud (id_solicitud=${id_solicitud}):`, solicitudDocs);
      
      return NextResponse.json(
        { error: "No se encontró el certificado para este trámite", disponibles: debugRows },
        { status: 404 }
      );
    }

    const documento = rows[0];
    const rutaArchivo = documento.ruta_archivo;

    console.log(`✓ Documento encontrado: id_documento=${documento.id_documento}`);
    console.log(`  - Nombre: ${documento.nombre_archivo}`);
    console.log(`  - Tipo: ${documento.tipo_documento}`);
    console.log(`  - Ruta: ${rutaArchivo}`);

    // 3. Construir la ruta completa del archivo
    const rutaCompleta = join(process.cwd(), "public", rutaArchivo);
    console.log(`  - Ruta completa del archivo: ${rutaCompleta}`);

    // 4. Leer el archivo del disco
    const buffer = await readFile(rutaCompleta);
    const fileSize = buffer.length;
    
    console.log(`✓ Archivo leído exitosamente (${fileSize} bytes)`);
    console.log(`=== FIN DESCARGA ===\n`);

    // 5. Crear blob del archivo
    const blob = new Blob([buffer], { type: 'application/pdf' });

    // 6. Devolver como respuesta directa
    const response = new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${documento.nombre_archivo}"`,
        'Content-Length': fileSize.toString(),
      }
    });

    return response;

  } catch (error: any) {
    console.error(`❌ ERROR al descargar certificado:`, error);
    console.error(`Mensaje: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.log(`=== FIN DESCARGA (ERROR) ===\n`);

    return NextResponse.json(
      { error: "Error al descargar el certificado", details: error.message },
      { status: 500 }
    );
  }
}
