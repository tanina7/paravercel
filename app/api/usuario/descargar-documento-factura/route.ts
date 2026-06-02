import { NextRequest, NextResponse } from 'next/server';
import { readSessionFromRequest } from '@/lib/auth/session';
import { getPool } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DESCARGAR FACTURA ===');
    console.log('URL:', request.url);
    
    // Validar sesión
    const session = await readSessionFromRequest(request);
    if (!session || !session.email) {
      console.log('❌ No hay sesión válida');
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id_solicitud = searchParams.get('id_solicitud');
    console.log('📋 id_solicitud:', id_solicitud);
    console.log('📧 email:', session.email);

    if (!id_solicitud) {
      return NextResponse.json(
        { error: 'ID de solicitud requerido' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // Verificar que la solicitud pertenece al usuario autenticado
    const [solicitudRows]: any = await pool.execute(
      `SELECT s.id_solicitud, s.id_estudiante
       FROM solicitudes_tramite s
       JOIN usuarios u ON s.id_estudiante = u.id_usuario
       WHERE s.id_solicitud = ? AND u.correo = ?`,
      [id_solicitud, session.email]
    );

    console.log('📝 Solicitud encontrada:', solicitudRows?.length > 0);

    if (!Array.isArray(solicitudRows) || solicitudRows.length === 0) {
      console.log('❌ Solicitud no encontrada o no autorizado');
      return NextResponse.json(
        { error: 'Solicitud no encontrada o no autorizado' },
        { status: 404 }
      );
    }

    // Obtener el documento_factura de la tabla facturas
    const [facturaRows]: any = await pool.execute(
      `SELECT documento_factura
       FROM facturas
       WHERE id_solicitud = ? AND documento_factura IS NOT NULL AND documento_factura != ''`,
      [id_solicitud]
    );

    console.log('🧾 Factura encontrada:', facturaRows?.length > 0);
    console.log('📄 documento_factura:', facturaRows?.[0]?.documento_factura);

    if (!Array.isArray(facturaRows) || facturaRows.length === 0) {
      console.log('❌ Factura no disponible');
      return NextResponse.json(
        { error: 'Factura no disponible aún' },
        { status: 404 }
      );
    }

    const documento_factura = facturaRows[0].documento_factura;
    console.log('📄 documento_factura (completo):', documento_factura);

    // Extraer solo el nombre del archivo (en caso de que tenga la ruta completa)
    const nombreArchivo = path.basename(documento_factura);
    console.log('📄 nombreArchivo (extraído):', nombreArchivo);

    // Construir la ruta del archivo
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'facturas');
    const filePath = path.join(uploadsDir, nombreArchivo);

    console.log('📂 Ruta del archivo:', filePath);
    console.log('✓ Archivo existe:', fs.existsSync(filePath));

    // Validar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo no encontrado');
      console.log('📂 Contenido de carpeta uploads:', fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).slice(0, 10) : 'Carpeta no existe');
      return NextResponse.json(
        { error: 'Archivo no encontrado en el servidor' },
        { status: 404 }
      );
    }

    // Leer el archivo
    const fileContent = fs.readFileSync(filePath);
    console.log('✓ Archivo leído:', fileContent.length, 'bytes');

    // Determinar el tipo de contenido
    const ext = path.extname(nombreArchivo).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    console.log('✓ Tipo de contenido:', contentType);

    // Retornar el archivo
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="factura-${id_solicitud}${ext}"`,
        'Cache-Control': 'no-store',
      },
    });

  } catch (error: any) {
    console.error('❌ ERROR al descargar documento factura:', error);
    return NextResponse.json(
      {
        error: error.message,
        sqlMessage: error.sqlMessage,
        code: error.code
      },
      { status: 500 }
    );
  }
}
