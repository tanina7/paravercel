import { NextRequest, NextResponse } from 'next/server';
import { readSessionFromRequest } from '@/lib/auth/session';
import { getPool } from '@/lib/db';

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

    // Obtener id_solicitud de los query params
    const { searchParams } = new URL(request.url);
    const idSolicitud = searchParams.get('id_solicitud');

    if (!idSolicitud) {
      return NextResponse.json(
        { error: 'id_solicitud es requerido' },
        { status: 400 }
      );
    }

    // Obtener pool de la BD
    const pool = await getPool();

    // Verificar que la solicitud pertenece al usuario autenticado
    const [solicitudes]: any = await pool.execute(
      `SELECT s.* FROM solicitudes_tramite s
       JOIN usuarios u ON s.id_estudiante = u.id_usuario
       WHERE s.id_solicitud = ? AND u.correo = ?`,
      [idSolicitud, session.email]
    );

    if (!Array.isArray(solicitudes) || solicitudes.length === 0) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada o no autorizado' },
        { status: 404 }
      );
    }

    // Obtener todos los trámites de esta solicitud
    const [tramites]: any = await pool.execute(
      `SELECT 
        t.id_tramite,
        t.codigo_tramite,
        tt.nombre_tramite,
        ds.precio
       FROM tramites t
       JOIN detalle_solicitud ds ON t.id_tipo = ds.id_tipo AND ds.id_solicitud = ?
       LEFT JOIN tipos_tramite tt ON t.id_tipo = tt.id_tipo
       WHERE t.id_solicitud = ?
       ORDER BY t.id_tramite ASC`,
      [idSolicitud, idSolicitud]
    );

    // Obtener datos de la solicitud
    const solicitud = solicitudes[0];
    const [usuario]: any = await pool.execute(
      `SELECT * FROM usuarios WHERE id_usuario = ?`,
      [solicitud.id_estudiante]
    );

    if (!Array.isArray(usuario) || usuario.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Intentar obtener la factura de la tabla facturas
    const [facturasResult]: any = await pool.execute(
      `SELECT * FROM facturas WHERE id_solicitud = ? LIMIT 1`,
      [idSolicitud]
    );
    
    let nitCi = usuario[0]?.ci || 'N/A';
    let nombreFactura = usuario[0]?.nombre_completo || 'Cliente General';
    let numeroFactura = 'S/N';
    let codigoControl = 'S/C';
    let fechaEmision = solicitud.fecha_solicitud 
      ? new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')
      : new Date().toLocaleDateString('es-ES');

    if (Array.isArray(facturasResult) && facturasResult.length > 0) {
      const factura = facturasResult[0];
      nitCi = factura.nit_ci;
      nombreFactura = factura.nombre;
      numeroFactura = factura.numero_factura;
      codigoControl = factura.codigo_control;
      fechaEmision = factura.fecha_emision 
        ? new Date(factura.fecha_emision).toLocaleDateString('es-ES')
        : fechaEmision;
    }

    // Generar HTML de la factura
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Factura ${numeroFactura}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background-color: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #8B1A1A;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #8B1A1A;
              margin-bottom: 10px;
            }
            .titulo {
              font-size: 20px;
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
            }
            .info-section {
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
            }
            .info-block {
              flex: 1;
            }
            .label {
              font-weight: bold;
              color: #666;
              font-size: 12px;
              margin-bottom: 5px;
            }
            .value {
              color: #333;
              font-size: 14px;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #8B1A1A;
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 13px;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #eee;
              font-size: 13px;
            }
            tr:hover {
              background-color: #f9f9f9;
            }
            .total-section {
              text-align: right;
              margin-bottom: 30px;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .total-label {
              font-weight: bold;
              margin-right: 30px;
              width: 150px;
            }
            .total-amount {
              width: 100px;
              text-align: right;
            }
            .total-final {
              border-top: 2px solid #8B1A1A;
              border-bottom: 2px solid #8B1A1A;
              padding-top: 10px;
              padding-bottom: 10px;
              font-size: 16px;
              font-weight: bold;
            }
            footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #999;
              font-size: 12px;
            }
            .no-print {
              display: none;
            }
            @media print {
              body {
                background-color: white;
              }
              .container {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <div class="logo">🎓 Universidad del Valle</div>
              <div class="titulo">FACTURA DE SOLICITUD DE TRÁMITES</div>
            </header>

            <div class="info-section">
              <div class="info-block">
                <div class="label">NÚMERO DE FACTURA</div>
                <div class="value">${numeroFactura}</div>
                
                <div class="label">CÓDIGO DE CONTROL</div>
                <div class="value">${codigoControl}</div>

                <div class="label">FECHA DE EMISIÓN</div>
                <div class="value">${fechaEmision}</div>
              </div>
              
              <div class="info-block">
                <div class="label">RAZÓN SOCIAL / NOMBRE</div>
                <div class="value">${nombreFactura}</div>

                <div class="label">NIT / CI</div>
                <div class="value">${nitCi}</div>
                
                <div class="label">NÚMERO DE SOLICITUD</div>
                <div class="value">${solicitud.codigo_tramite || 'S/N'}</div>
              </div>
            </div>

            <h3 style="margin-bottom: 15px; color: #333;">Detalle de Trámites Solicitados</h3>
            
            <table>
              <thead>
                <tr>
                  <th>Código Trámite</th>
                  <th>Descripción</th>
                  <th style="text-align: right;">Monto</th>
                </tr>
              </thead>
              <tbody>
                ${tramites.map((tramite: any) => `
                  <tr>
                    <td>${tramite.codigo_tramite}</td>
                    <td>${tramite.nombre_tramite}</td>
                    <td style="text-align: right;">Bs. ${parseFloat(tramite.precio).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-row total-final">
                <div class="total-label">TOTAL A PAGAR:</div>
                <div class="total-amount">Bs. ${parseFloat(solicitud.total).toFixed(2)}</div>
              </div>
            </div>

            <footer>
              <p>Esta factura fue generada electrónicamente. Conserve este documento para su registro.</p>
              <p>Sistema de Gestión de Trámites - Universidad del Valle © 2024</p>
            </footer>
          </div>
        </body>
      </html>
    `;

    // Retornar como HTML
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="factura-${numeroFactura}.html"`
      }
    });

  } catch (error) {
    console.error('Error descargando factura:', error);
    return NextResponse.json(
      { error: 'Error al descargar factura' },
      { status: 500 }
    );
  }
}
