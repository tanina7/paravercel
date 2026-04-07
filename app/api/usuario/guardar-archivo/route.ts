import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import mysql from 'mysql2/promise';

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

const UPLOAD_DIR = join(process.cwd(), 'public/uploads/documentos');

export async function POST(request: NextRequest) {
  let connection;
  try {
    const formData = await request.formData();
    const id_solicitud = formData.get('id_solicitud') as string;
    const nombre_tramite = formData.get('nombre_tramite') as string;
    const tipo_documento = formData.get('tipo_documento') as string;
    const archivo = formData.get('archivo') as File;

    console.log('=== DATOS RECIBIDOS ===');
    console.log('id_solicitud:', id_solicitud);
    console.log('nombre_tramite:', nombre_tramite);
    console.log('tipo_documento:', tipo_documento);
    console.log('archivo:', archivo?.name || 'SIN ARCHIVO');

    if (!id_solicitud || !nombre_tramite || !tipo_documento || !archivo) {
      console.log('ERROR: Datos incompletos');
      return NextResponse.json(
        { error: 'Datos incompletos', details: { id_solicitud, nombre_tramite, tipo_documento, archivo: archivo?.name } },
        { status: 400 }
      );
    }

    // Validar que sea PDF
    if (!archivo.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Solo se aceptan archivos PDF' },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El tamaño máximo de archivo es 5MB' },
        { status: 400 }
      );
    }

    // Crear directorio si no existe
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (err) {
      // El directorio puede que ya exista
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const nombreOriginal = archivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const nombreArchivo = `${id_solicitud}_${timestamp}_${nombreOriginal}`;
    const rutaArchivo = `/uploads/documentos/${nombreArchivo}`;

    // Guardar archivo
    const buffer = await archivo.arrayBuffer();
    await writeFile(
      join(UPLOAD_DIR, nombreArchivo),
      Buffer.from(buffer)
    );

    // Guardar en base de datos
    connection = await getConnection();

    // Guardar solo el tipo de documento (suficientemente descriptivo)
    // El tramite se identifica vía id_solicitud, así que no es necesario repetir el nombre
    await connection.execute(
      `INSERT INTO archivos_tramite (id_solicitud, tipo_archivo, archivo) 
       VALUES (?, ?, ?)`,
      [id_solicitud, tipo_documento, rutaArchivo]
    );

    return NextResponse.json({
      success: true,
      mensaje: 'Archivo guardado exitosamente',
      ruta: rutaArchivo,
    });
  } catch (error) {
    console.error('Error al guardar archivo:', error);
    return NextResponse.json(
      { error: 'Error al guardar el archivo', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
