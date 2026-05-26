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

const UPLOAD_DIR = join(process.cwd(), 'public/uploads/comprobantes');

export async function POST(request: NextRequest) {
  let connection;
  try {
    const formData = await request.formData();
    const id_solicitud = formData.get('id_solicitud') as string;
    const monto = formData.get('monto') as string;
    const comprobante = formData.get('comprobante') as File;

    console.log('=== COMPROBANTE RECIBIDO ===');
    console.log('id_solicitud:', id_solicitud);
    console.log('monto:', monto);
    console.log('comprobante:', comprobante?.name || 'SIN ARCHIVO');

    if (!id_solicitud || !monto || !comprobante) {
      console.log('ERROR: Datos incompletos');
      return NextResponse.json(
        { 
          error: 'Datos incompletos', 
          details: { id_solicitud, monto, comprobante: comprobante?.name } 
        },
        { status: 400 }
      );
    }

    // Validar tipo de archivo (PDF, PNG, JPG, JPEG)
    const tiposPermitidos = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const esValido = tiposPermitidos.includes(comprobante.type) || 
                     comprobante.name.toLowerCase().endsWith('.pdf') ||
                     comprobante.name.toLowerCase().endsWith('.png') ||
                     comprobante.name.toLowerCase().endsWith('.jpg') ||
                     comprobante.name.toLowerCase().endsWith('.jpeg');
    
    if (!esValido) {
      console.log('ERROR: Tipo de archivo no permitido:', comprobante.type, 'Nombre:', comprobante.name);
      return NextResponse.json(
        { error: 'Solo se aceptan archivos PDF, PNG o JPG/JPEG' },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    if (comprobante.size > 5 * 1024 * 1024) {
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
    const nombreOriginal = comprobante.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const nombreArchivo = `${id_solicitud}_${timestamp}_${nombreOriginal}`;
    const rutaArchivo = `/uploads/comprobantes/${nombreArchivo}`;

    // Guardar archivo
    const buffer = await comprobante.arrayBuffer();
    await writeFile(
      join(UPLOAD_DIR, nombreArchivo),
      Buffer.from(buffer)
    );

    console.log('Archivo guardado en:', rutaArchivo);

    // Guardar en base de datos
    connection = await getConnection();
    console.log('Conexión a BD establecida');

    try {
      console.log('Creando registro de pago...');
      // Primero crear/obtener el registro de pago
      const pagoResult = await connection.execute(
        `INSERT INTO pagos (id_solicitud, monto, fecha_pago, estado_pago, metodo_pago) 
         VALUES (?, ?, NOW(), 'Completado', 'Transferencia')`,
        [id_solicitud, monto]
      );
      
      const idPago = (pagoResult[0] as any).insertId;
      console.log('Registro de pago creado con ID:', idPago);

      console.log('Insertando comprobante en tabla comprobantes...');
      const result = await connection.execute(
        `INSERT INTO comprobantes (id_pago, archivo) 
         VALUES (?, ?)`,
        [idPago, rutaArchivo]
      );
      console.log('Resultado INSERT:', result);
    } catch (insertError) {
      console.error('Error al insertar comprobante:', insertError instanceof Error ? insertError.message : 'Error desconocido');
      throw insertError;
    }

    // Actualizar estado de solicitud a "Pagado" (id_estado = 5)
    try {
      const updateResult = await connection.execute(
        `UPDATE tramites SET id_estado = 1 WHERE id_solicitud = ?`,
        [id_solicitud]
      );
      console.log('Estado de solicitud actualizado a Pagado:', updateResult);
    } catch (updateError) {
      console.warn('Advertencia al actualizar estado:', updateError instanceof Error ? updateError.message : 'Error desconocido');
      // No lanzamos error aquí, el comprobante ya se guardó exitosamente
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Comprobante guardado exitosamente',
      ruta: rutaArchivo,
    });
  } catch (error) {
    console.error('❌ Error general al guardar comprobante:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    const errorStack = error instanceof Error ? error.stack : 'Sin stack trace';
    
    console.error('Stack trace:', errorStack);
    
    return NextResponse.json(
      { 
        error: 'Error al guardar el comprobante', 
        details: errorMessage,
        stack: errorStack
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
