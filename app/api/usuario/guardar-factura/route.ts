import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { readSessionFromRequest } from "@/lib/auth/session";

async function getConnection() {
  return await mysql.createConnection({
    host: "mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com",
    port: 11597,
    user: "avnadmin",
    password: "AVNS_iKeVgvVdaPJAQcw2XtV",
    database: "tramites_univalle",
    ssl: { rejectUnauthorized: false },
  });
}

export async function POST(request: NextRequest) {
  let connection;

  try {
    const session = await readSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { id_solicitud, nit_ci, nombre } = await request.json();

    if (!id_solicitud || !nit_ci || !nombre) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // ❗ SOLO SOLICITUD (sin factura final)
    const [result]: any = await connection.execute(
      `
      INSERT INTO facturas (
        id_solicitud,
        nit_ci,
        nombre
      )
      VALUES (?, ?, ?)
      `,
      [id_solicitud, nit_ci, nombre]
    );

    return NextResponse.json({
      success: true,
      id_factura: result.insertId,
      message: "Solicitud de factura registrada",
    });
  } catch (error: any) {
    console.error("ERROR al guardar factura:", error);

    return NextResponse.json(
      {
        error: error.message,
        sqlMessage: error.sqlMessage,
        code: error.code,
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}