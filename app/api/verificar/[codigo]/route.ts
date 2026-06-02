import pool from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  // 🔥 CORRECCIÓN: En Next.js moderno, params es una Promesa 🔥
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    // 🔥 Esperamos a que la URL cargue antes de leerla
    const { codigo } = await params;
    
    // ====================================================================
    // 🔥 LA SOLUCIÓN: Verificamos si trae el prefijo UV- antes de recortar
    // Esto hace que soporte tanto "UV-2026-TRM-12345" como "TRM-12345"
    // ====================================================================
    let codigoRealDB = codigo;
    
    if (codigo.startsWith('UV-')) {
      const parts = codigo.split('-');
      // Si tiene el formato UV-AÑO-TRM...
      if (parts.length >= 3) {
        codigoRealDB = parts.slice(2).join('-'); 
      }
    }

    // ====================================================================
    // PASO 1: Buscar solo los datos del trámite por su código exacto
    // ====================================================================
    const [tramiteRows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        s.id_solicitud,
        t.codigo_tramite,
        tt.nombre_tramite AS tipo_tramite,
        tt.costo AS monto, /* 🔥 Aseguramos traer el precio para la tabla del certificado */
        e.nombre_estado,
        u.nombre_completo,
        u.ci,
        u.correo,
        es.carrera,
        es.subsede AS sede,
        t.fecha_creacion
      FROM tramites t
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN usuarios u ON s.id_estudiante = u.id_usuario
      LEFT JOIN estudiantes es ON u.id_usuario = es.id_usuario
      JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
      WHERE t.codigo_tramite = ?
        AND e.nombre_estado IN ('Listo para Impresion', 'Finalizado')
      LIMIT 1
    `, [codigoRealDB]);

    if (!tramiteRows || tramiteRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Documento no encontrado o inválido" }, 
        { status: 404 }
      );
    }

    const tramite = tramiteRows[0];

    // ====================================================================
    // PASO 2: Buscar el ID de las firmas en el historial
    // ====================================================================
    const [historialRows]: any = await pool.query(`
      SELECT comentario 
      FROM historial_tramite 
      WHERE id_tramite = ? 
        AND comentario LIKE 'Certificado emitido. Firmas autorizadas IDs:%'
      LIMIT 1
    `, [tramite.id_tramite]);

    let firmasIds = "";
    if (historialRows && historialRows.length > 0) {
      firmasIds = historialRows[0].comentario.replace('Certificado emitido. Firmas autorizadas IDs:', '').trim();
    }
    
    // Lo guardamos en ambas variables para no fallar con el frontend
    tramite.firma_digital_url = firmasIds;
    tramite.firma_ids = firmasIds;

    // ====================================================================
    // PASO 3: Buscar archivos iniciales del estudiante
    // ====================================================================
    const [archivosEstudiante]: any = await pool.query(`
      SELECT 
        id_archivo, 
        tipo_archivo, 
        archivo 
      FROM archivos_tramite 
      WHERE id_solicitud = ?
    `, [tramite.id_solicitud]);

    // ====================================================================
    // PASO 4: Buscar tus Certificados Oficiales y Respaldos (Sin duplicados)
    // ====================================================================
    const [documentosOficiales]: any = await pool.query(`
      SELECT 
        id_documento AS id_archivo, 
        tipo_documento AS tipo_archivo, 
        ruta_archivo AS archivo 
      FROM documentos_adjuntos 
      WHERE id_tramite = ?
        AND tipo_documento NOT IN ('Certificado PDF Oficial', 'Respaldo Adicional')
    `, [tramite.id_tramite]);

    // ====================================================================
    // PASO 5: Juntarlo todo con JavaScript (La forma más segura)
    // ====================================================================
    tramite.archivos = [
      ...(Array.isArray(archivosEstudiante) ? archivosEstudiante : []),
      ...(Array.isArray(documentosOficiales) ? documentosOficiales : [])
    ];

    return NextResponse.json({
      success: true,
      data: tramite
    });

  } catch (error: any) {
    console.error("ERROR EN VERIFICACIÓN:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}