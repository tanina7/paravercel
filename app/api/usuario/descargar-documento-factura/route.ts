import { NextRequest, NextResponse } from 'next/server';
import { readSessionFromRequest } from '@/lib/auth/session';
import { getPool } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Validar sesión
    const session = await readSessionFromRequest(request);
    if (!session || !session.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id_solicitud = searchParams.get('id_solicitud');

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

    if (!Array.isArray(solicitudRows) || solicitudRows.length === 0) {
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

    if (!Array.isArray(facturaRows) || facturaRows.length === 0) {
      return NextResponse.json(
        { error: 'Factura no disponible aún' },
        { status: 404 }
      );
    }

    const documento_factura = facturaRows[0].documento_factura;

    // Construir la ruta del archivo
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'facturas');
    const filePath = path.join(uploadsDir, documento_factura);

    // Validar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Archivo no encontrado en el servidor' },
        { status: 404 }
      );
    }

    // Leer el archivo
    const fileContent = fs.readFileSync(filePath);

    // Determinar el tipo de contenido
    const ext = path.extname(documento_factura).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Retornar el archivo
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="factura-${id_solicitud}${ext}"`,
      },
    });

  } catch (error: any) {
    console.error('ERROR al descargar documento factura:', error);
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
