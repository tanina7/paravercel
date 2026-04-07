import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: 'mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com',
      user: 'avnadmin',
      password: 'AVNS_iKeVgvVdaPJAQcw2XtV', // <-- PEGA TU CONTRASEÑA AQUÍ
      database: 'tramites_univalle',
      port: 11597,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Buscamos a todos los usuarios que ya tengan una firma guardada
    const [rows] = await connection.execute(
      `SELECT id_usuario, nombre_completo, foto_perfil_url, firma_digital_url 
       FROM usuarios 
       WHERE firma_digital_url IS NOT NULL`
    );

    await connection.end();

    return NextResponse.json({ success: true, firmas: rows });

  } catch (error) {
    console.error("Error al obtener firmas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}