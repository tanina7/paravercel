import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        t.codigo_tramite,
        tt.nombre_tramite AS tipo_tramite,
        e.nombre_estado,
        u.nombre_completo,
        u.correo,
        u.ci, /* Asumimos que el carnet está en la tabla usuarios. Si se llama distinto, cambia 'ci' por el nombre correcto */
        est.carrera,
        est.subsede AS sede,
        t.fecha_creacion,
        s.total AS monto, /* <-- AÑADIDO: El costo total de la solicitud */

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

      JOIN usuarios u 
        ON s.id_estudiante = u.id_usuario

      -- 🔥 AÑADIMOS LA TABLA ESTUDIANTES PARA OBTENER CARRERA Y SEDE
      LEFT JOIN estudiantes est 
        ON u.id_usuario = est.id_usuario

      JOIN tipos_tramite tt 
        ON t.id_tipo = tt.id_tipo

      WHERE e.nombre_estado = 'Pagado'

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