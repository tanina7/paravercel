import { NextRequest, NextResponse } from 'next/server';
import { readSessionFromRequest } from '@/lib/auth/session';
import { getPool } from '@/lib/db';

interface HistorialEstado {
  nombre_estado: string;
  fecha: string;
  comentario?: string;
}

interface TramiteActivo {
  id_tramite: number;
  codigo_tramite: string;
  fecha_solicitud: string;
  nombre_estado: string;
  tipo_tramite: string;
  historial: HistorialEstado[];
  visto_por_usuario?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Obtener la sesión del usuario
    const session = await readSessionFromRequest(request);
    
    if (!session || !session.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    console.log('Obteniendo trámites activos para usuario:', session.email);

    // Obtener pool de la BD
    const pool = await getPool();

    // Buscar trámites activos (no finalizados/rechazados) Y trámites finalizados que no hayan sido vistos
    let tramites: any[];
    
    try {
      // Intentar con la columna visto_por_usuario (después de la migración)
      const [result] = await pool.execute(
        `SELECT 
          t.id_tramite,
          t.codigo_tramite,
          s.fecha_solicitud,
          et.nombre_estado,
          tt.nombre_tramite as tipo_tramite,
          u.id_usuario,
          COALESCE(t.visto_por_usuario, 0) as visto_por_usuario
        FROM tramites t
        LEFT JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
        LEFT JOIN estados_tramite et ON t.id_estado = et.id_estado
        JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
        JOIN usuarios u ON s.id_estudiante = u.id_usuario
        WHERE u.correo = ? 
        AND (
          (t.id_estado NOT IN (7, 8))
          OR (t.id_estado IN (7, 8) AND t.visto_por_usuario = 0)
        )
        ORDER BY s.fecha_solicitud DESC`,
        [session.email]
      );
      tramites = result as any[];
    } catch (error) {
      // Si falla, es porque la columna no existe aún. Solo traer trámites no finalizados
      console.log('Columna visto_por_usuario no existe aún. Usando query sin esa columna...');
      const [result] = await pool.execute(
        `SELECT 
          t.id_tramite,
          t.codigo_tramite,
          s.fecha_solicitud,
          et.nombre_estado,
          tt.nombre_tramite as tipo_tramite,
          u.id_usuario,
          0 as visto_por_usuario
        FROM tramites t
        LEFT JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
        LEFT JOIN estados_tramite et ON t.id_estado = et.id_estado
        JOIN solicitudes_tramite s ON t.id_solicitud = s.id_solicitud
        JOIN usuarios u ON s.id_estudiante = u.id_usuario
        WHERE u.correo = ? 
        AND t.id_estado NOT IN (7, 8)
        ORDER BY s.fecha_solicitud DESC`,
        [session.email]
      );
      tramites = result as any[];
    }

    if (!Array.isArray(tramites) || tramites.length === 0) {
      return NextResponse.json({
        tramites: [],
        message: 'No hay trámites activos'
      });
    }

    // Para cada trámite, obtener su historial de estados
    const tramitesConHistorial: TramiteActivo[] = [];

    for (const tramite of tramites as any[]) {
      const [historial] = await pool.execute(
        `SELECT 
          et.nombre_estado,
          h.fecha,
          h.comentario
        FROM historial_tramite h
        LEFT JOIN estados_tramite et ON h.id_estado = et.id_estado
        WHERE h.id_tramite = ?
        ORDER BY h.fecha ASC`,
        [tramite.id_tramite]
      );

      tramitesConHistorial.push({
        id_tramite: tramite.id_tramite,
        codigo_tramite: tramite.codigo_tramite,
        fecha_solicitud: tramite.fecha_solicitud,
        nombre_estado: tramite.nombre_estado,
        tipo_tramite: tramite.tipo_tramite,
        historial: Array.isArray(historial) ? historial.map((h: any) => ({
          nombre_estado: h.nombre_estado,
          fecha: h.fecha,
          comentario: h.comentario
        })) : [],
        visto_por_usuario: tramite.visto_por_usuario === 1
      });
    }

    console.log('Trámites activos encontrados:', tramitesConHistorial.length);

    return NextResponse.json({
      tramites: tramitesConHistorial,
      count: tramitesConHistorial.length
    });
  } catch (error) {
    console.error('Error obteniendo trámites activos:', error);
    return NextResponse.json(
      { error: 'Error al obtener trámites activos' },
      { status: 500 }
    );
  }
}
