import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id_tramite } = await req.json();

    const [rows]: any = await pool.query(`
      SELECT 
        t.id_tramite,
        u.nombre_completo,
        u.correo,
        tt.nombre_tramite,
        tt.costo
      FROM tramites t
      INNER JOIN solicitudes_tramite st ON st.id_solicitud = t.id_solicitud
      INNER JOIN estudiantes e ON e.id_estudiante = st.id_estudiante
      INNER JOIN usuarios u ON u.id_usuario = e.id_usuario
      INNER JOIN tipos_tramite tt ON tt.id_tipo = t.id_tipo
      WHERE t.id_tramite = ?
    `, [id_tramite]);

    const data = rows?.[0];

    if (!data) {
      return NextResponse.json(
        { error: "Trámite no encontrado" },
        { status: 404 }
      );
    }

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial;
              padding: 40px;
              color: #111;
            }
            .box {
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 8px;
            }
            h1 {
              color: #b91c1c;
              text-align: center;
            }
            .row {
              margin: 6px 0;
            }
          </style>
        </head>
        <body>
          <div class="box">

            <h1>FACTURA OFICIAL</h1>

            <div class="row"><b>ID:</b> ${data.id_tramite}</div>
            <div class="row"><b>Cliente:</b> ${data.nombre_completo}</div>
            <div class="row"><b>Correo:</b> ${data.correo}</div>

            <hr />

            <div class="row"><b>Trámite:</b> ${data.nombre_tramite}</div>
            <div class="row"><b>Costo:</b> Bs ${data.costo}</div>

            <hr />

            <h2 style="text-align:right;">
              TOTAL: Bs ${data.costo}
            </h2>

          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "domcontentloaded"
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    // ✅ FIX IMPORTANTE: convertir Uint8Array → Buffer
    const buffer = Buffer.from(pdfBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=factura-${id_tramite}.pdf`
      }
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}