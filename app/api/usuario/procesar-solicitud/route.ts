import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { readSessionFromRequest } from '@/lib/auth/session';

async function getConnection() {
  return await mysql.createConnection({
    host: "mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com",
    port: 11597,
    user: "avnadmin",
    password: "AVNS_iKeVgvVdaPJAQcw2XtV",
    database: "tramites_univalle",
    ssl: {
      rejectUnauthorized: false
    }
  });
}

export async function POST(request: NextRequest) {
  let connection;

  try {
    // =========================
    // SESIÓN
    // =========================
    const session = await readSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const idUsuario = session.id;
    const email = session.email;

    const nombreCompleto = `${session.firstName} ${session.lastName}`;
    const roleId = session.role_id;

    console.log('Usuario autenticado:', {
      idUsuario,
      nombreCompleto,
      email,
      roleId
    });

    // =========================
    // BODY
    // =========================
    const {
      nombreCompleto: nombreBody,
      carrera,
      subSede,
      tramites
    } = await request.json();

    if (
      !nombreBody ||
      !carrera ||
      !subSede ||
      !tramites ||
      tramites.length === 0
    ) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // =========================
    // CÓDIGO SOLICITUD
    // =========================
    const codigoSolicitud = `SOL-${Date.now()}`;

    const total = tramites.reduce(
      (sum: number, t: any) => sum + Number(t.costo),
      0
    );

    // =========================
    // INSERT SOLICITUD
    // =========================
    const [resultSolicitud] = await connection.execute(
      `INSERT INTO solicitudes_tramite 
      (id_estudiante, codigo_tramite, estado_general, total) 
      VALUES (?, ?, ?, ?)`,
      [idUsuario, codigoSolicitud, 'Pendiente', total]
    );

    const id_solicitud = (resultSolicitud as any).insertId;

    // =========================
    // INSERT TRÁMITES
    // =========================
    const tramitesCreados: any[] = [];

    for (const tramite of tramites) {

      const [tipos]: any = await connection.execute(
        `SELECT id_tipo 
         FROM tipos_tramite 
         WHERE nombre_tramite = ?`,
        [tramite.name]
      );

      if (tipos.length > 0) {

        const id_tipo = tipos[0].id_tipo;

        await connection.execute(
          `INSERT INTO detalle_solicitud 
          (id_solicitud, id_tipo, precio) 
          VALUES (?, ?, ?)`,
          [id_solicitud, id_tipo, tramite.costo]
        );

        const codigoTramite =
          `TRM-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 11)
            .toUpperCase()}`;

        const [resultTramite] = await connection.execute(
          `INSERT INTO tramites 
          (id_solicitud, id_tipo, id_estado, codigo_tramite) 
          VALUES (?, ?, ?, ?)`,
          [id_solicitud, id_tipo, 1, codigoTramite]
        );

        tramitesCreados.push({
          nombre: tramite.name,
          codigoTramite,
          costo: tramite.costo,
          id_tramite: (resultTramite as any).insertId
        });
      }
    }

    // =========================
    // RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      usuario: {
        id: idUsuario,
        email,
        nombreCompleto,
        role_id: roleId
      },
      id_solicitud,
      codigoSolicitud,
      tramites: tramitesCreados,
      mensaje: 'Solicitud creada exitosamente',
    });

  } catch (error) {

    console.error('Error al procesar solicitud:', error);

    return NextResponse.json(
      {
        error: 'Error al procesar la solicitud',
        details: error instanceof Error
          ? error.message
          : 'Error desconocido'
      },
      { status: 500 }
    );

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}