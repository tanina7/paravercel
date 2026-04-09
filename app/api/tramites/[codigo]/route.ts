import pool from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo: codigoParam } = await params;
    const codigo = codigoParam.trim();

    if (!codigo) {
      return Response.json(
        { error: "Código de trámite es requerido" },
        { status: 400 }
      );
    }

    console.log(`\n=== Buscando trámite con código: ${codigo} ===`);

    // Buscar por codigo_tramite
    let [rows]: any = await pool.query(
      `SELECT 
        t.id_tramite,
        t.id_solicitud,
        t.codigo_tramite as codigoTramite,
        tt.nombre_tramite,
        COALESCE(et.nombre_estado, 'Desconocido') as estado,
        t.id_estado,
        t.fecha_creacion as fechaCreacion,
        COALESCE(dt.precio, 0) as costo
       FROM tramites t
       LEFT JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
       LEFT JOIN estados_tramite et ON t.id_estado = et.id_estado
       LEFT JOIN detalle_solicitud dt ON t.id_solicitud = dt.id_solicitud AND t.id_tipo = dt.id_tipo
       WHERE t.codigo_tramite = ?
       LIMIT 1`,
      [codigo]
    );

    console.log(`Registros encontrados: ${rows.length}`);

    if (rows.length === 0) {
      console.log('Trámite no encontrado');
      return Response.json(
        { error: "Trámite no encontrado. Verifica el código ingresado." },
        { status: 404 }
      );
    }

    const tramite = rows[0];
    
    console.log(`✅ Trámite encontrado:`, {
      id_tramite: tramite.id_tramite,
      nombre: tramite.nombre_tramite,
      estado: tramite.estado
    });
    
    return Response.json({
      id_tramite: tramite.id_tramite,
      id_solicitud: tramite.id_solicitud,
      codigoTramite: tramite.codigoTramite,
      nombre_tramite: tramite.nombre_tramite || "Tipo de trámite desconocido",
      estado: tramite.estado || "Estado desconocido",
      id_estado: tramite.id_estado,
      fechaCreacion: tramite.fechaCreacion,
      costo: tramite.costo ? parseFloat(tramite.costo) : 0
    });
  } catch (error: any) {
    console.error("❌ Error al buscar trámite:", error.message);
    console.error("Stack:", error.stack);
    return Response.json(
      { 
        error: "Error al buscar el trámite",
        details: error.message 
      },
      { status: 500 }
    );
  }
}