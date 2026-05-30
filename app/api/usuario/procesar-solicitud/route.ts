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
    ssl: { rejectUnauthorized: false }
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

    const email = session.email;

    // =========================
    // BODY
    // =========================
    const {
      nombreCompleto,
      carrera,
      subSede,
      tramites
    } = await request.json();

    if (!tramites || tramites.length === 0) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // =========================
    // BUSCAR USUARIO EN BD
    // =========================
    const [usuarios]: any = await connection.execute(
      `SELECT id_usuario
       FROM usuarios
       WHERE correo = ?`,
      [email]
    );

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en BD de trámites' },
        { status: 404 }
      );
    }

    const idUsuario = usuarios[0].id_usuario;

    // =========================
    // BUSCAR O CREAR ESTUDIANTE
    // =========================
    const [estudiantes]: any = await connection.execute(
      `SELECT id_estudiante FROM estudiantes WHERE id_usuario = ?`,
      [idUsuario]
    );

    if (estudiantes.length === 0) {
      // Generar código único para estudiante
      const codigoEstudiante = `EST-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      
      // Crear nuevo registro en estudiantes
      await connection.execute(
        `INSERT INTO estudiantes (id_usuario, carrera, subsede, codigo_estudiante)
         VALUES (?, ?, ?, ?)`,
        [idUsuario, carrera, subSede, codigoEstudiante]
      );
    }

    // =========================
    // CÓDIGO Y TOTAL
    // =========================
    const codigoSolicitud = `SOL-${Date.now()}`;

    const total = tramites.reduce(
      (sum: number, t: any) => sum + Number(t.costo),
      0
    );

    // =========================
    // INSERT SOLICITUD (usar idUsuario, no idEstudiante)
    // =========================
    const [resultSolicitud]: any = await connection.execute(
      `INSERT INTO solicitudes_tramite
       (id_estudiante, codigo_tramite, estado_general, total)
       VALUES (?, ?, ?, ?)`,
      [idUsuario, codigoSolicitud, 'Pendiente', total]
    );

    const id_solicitud = resultSolicitud.insertId;

    // =========================
    // INSERT DETALLE + TRÁMITES
    // =========================
    const tramitesCreados: any[] = [];

    for (const tramite of tramites) {

      const [tipos]: any = await connection.execute(
        `SELECT id_tipo
         FROM tipos_tramite
         WHERE nombre_tramite = ?`,
        [tramite.name]
      );

      if (tipos.length === 0) continue;

      const id_tipo = tipos[0].id_tipo;

      await connection.execute(
        `INSERT INTO detalle_solicitud
         (id_solicitud, id_tipo, precio)
         VALUES (?, ?, ?)`,
        [id_solicitud, id_tipo, tramite.costo]
      );

      const codigoTramite =
        `TRM-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

      const [resultTramite]: any = await connection.execute(
        `INSERT INTO tramites
         (id_solicitud, id_tipo, id_estado, codigo_tramite)
         VALUES (?, ?, ?, ?)`,
        [id_solicitud, id_tipo, 1, codigoTramite]
      );

      const id_tramite = resultTramite.insertId;

      // Crear registro inicial en historial_tramite
      await connection.execute(
        `INSERT INTO historial_tramite
         (id_tramite, id_estado, comentario, fecha)
         VALUES (?, ?, ?, NOW())`,
        [id_tramite, 1, 'Trámite iniciado']
      );

      tramitesCreados.push({
        nombre: tramite.name,
        codigoTramite,
        costo: tramite.costo,
        id_tramite
      });
    }

    // =========================
    // RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      id_solicitud,
      codigoSolicitud,
      tramites: tramitesCreados
    });

  } catch (error: any) {

    console.error('ERROR COMPLETO:', error);

    return NextResponse.json(
      {
        error: error.message,
        sqlMessage: error.sqlMessage,
        code: error.code
      },
      { status: 500 }
    );

  } finally {
    if (connection) await connection.end();
  }
}