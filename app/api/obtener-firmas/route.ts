import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    // 1. Conectarse a tu base de datos en Aiven
    const connection = await mysql.createConnection({
      host: 'mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com',
      user: 'avnadmin',
      password: 'AVNS_iKeVgvVdaPJAQcw2XtV',
      database: 'tramites_univalle',
      port: 11597,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // 2. Buscar a todos los usuarios que tengan una firma guardada
    const [rows] = await connection.execute(`
      SELECT 
        id_usuario, 
        nombre_completo, 
        foto_perfil_url, 
        firma_digital_url 
      FROM usuarios 
      WHERE firma_digital_url IS NOT NULL 
      AND firma_digital_url != ''
    `);

    // 3. Cerrar la conexión
    await connection.end();

    // 4. Enviar los datos al frontend en el formato que tu React espera
    return NextResponse.json({
      success: true,
      firmas: rows
    }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener firmas de Aiven:", error);
    return NextResponse.json({
      success: false,
      message: "Error al obtener las firmas",
    }, { status: 500 });
  }
}