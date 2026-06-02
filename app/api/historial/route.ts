import pool from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        t.codigo_tramite,
        tt.nombre_tramite AS tipo_tramite,
        e.nombre_estado,
        u.nombre_completo,
        u.ci,
        u.correo,
        es.carrera,
        es.subsede AS sede,
        t.fecha_creacion,
        
        (
          SELECT COALESCE(
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id_archivo', f.id_archivo,
                'tipo_archivo', f.tipo_archivo,
                'archivo', f.archivo
              )
            ),
            '[]'
          )
          FROM (
            /* 1. Traemos los requisitos iniciales del estudiante */
            SELECT 
              id_archivo, 
              tipo_archivo, 
              archivo 
            FROM archivos_tramite 
            WHERE id_solicitud = s.id_solicitud
            
            UNION ALL
            
            /* 2. Traemos LOS DOCUMENTOS OFICIALES EMITIDOS POR TI */
            /* 🔥 CORRECCIÓN 1: Filtramos los duplicados generados por el backend 🔥 */
            SELECT 
              id_documento AS id_archivo, 
              tipo_documento AS tipo_archivo, 
              ruta_archivo AS archivo 
            FROM documentos_adjuntos 
            WHERE id_tramite = t.id_tramite
              AND tipo_documento NOT IN ('Certificado PDF Oficial', 'Respaldo Adicional')
          ) f
        ) AS archivos

      FROM tramites t
      JOIN estados_tramite e ON t.id_estado = e.id_estado
      JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
      JOIN usuarios u ON s.id_estudiante = u.id_usuario
      LEFT JOIN estudiantes es ON u.id_usuario = es.id_usuario
      JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
      
      WHERE e.nombre_estado IN ('Listo para Impresion', 'Finalizado')
      
      /* 🔥 CORRECCIÓN 2: Ordenar por el último documento emitido 🔥 */
      ORDER BY 
        COALESCE((SELECT MAX(id_documento) FROM documentos_adjuntos WHERE id_tramite = t.id_tramite), 0) DESC, 
        t.id_tramite DESC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("ERROR HISTORIAL:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}