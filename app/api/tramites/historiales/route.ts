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
                'id_archivo', a.id_archivo,
                'tipo_archivo', a.tipo_archivo,
                'archivo', a.archivo,
                'fecha_subida', a.fecha_subida
              )
            ),
            JSON_ARRAY()
          )
          FROM archivos_tramite a
          WHERE a.id_solicitud = s.id_solicitud
        ) AS archivos

      FROM tramites t

      JOIN estados_tramite e 
        ON t.id_estado = e.id_estado

      JOIN solicitudes_tramite s 
        ON t.id_solicitud = s.id_solicitud

      /* 🔥 AQUÍ ESTÁ LA CORRECCIÓN DE LOS JOINS 🔥 */
      JOIN usuarios u 
        ON s.id_estudiante = u.id_usuario

      LEFT JOIN estudiantes es 
        ON u.id_usuario = es.id_usuario

      JOIN tipos_tramite tt 
        ON t.id_tipo = tt.id_tipo

      WHERE e.nombre_estado IN ('Listo para Impresion', 'Finalizado')

      ORDER BY t.fecha_creacion DESC
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