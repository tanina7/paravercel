import pool from "@/lib/db";
import { NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    console.log("\n==============================");
    console.log("🚀 INICIO PREVIEW FACTURA");
    console.log("==============================\n");

    const {
      id_tramite,
      nombre: nombreUsuario,
    } = await req.json();

    if (!id_tramite) {
      return NextResponse.json(
        { error: "id_tramite es requerido" },
        { status: 400 }
      );
    }

    // =========================
    // VALIDAR TRÁMITE
    // =========================
    const [tramiteCheck]: any = await pool.query(
      "SELECT * FROM tramites WHERE id_tramite = ?",
      [id_tramite]
    );

    if (!tramiteCheck.length) {
      return NextResponse.json(
        { error: "Trámite no encontrado" },
        { status: 404 }
      );
    }

    // =========================
    // OBTENER DATOS
    // =========================
    const [rows]: any = await pool.query(
      `
      SELECT
        t.id_tramite,
        t.id_solicitud,
        s.id_estudiante,
        u.nombre_completo,
        u.correo,
        u.ci AS ci_usuario,
        f.nombre AS nombre_factura,
        f.nit_ci AS nit_ci_factura,
        tt.nombre_tramite,
        tt.costo
      FROM tramites t
      INNER JOIN solicitudes_tramite s
        ON s.id_solicitud = t.id_solicitud
      INNER JOIN usuarios u
        ON u.id_usuario = s.id_estudiante
      INNER JOIN tipos_tramite tt
        ON tt.id_tipo = t.id_tipo
      LEFT JOIN facturas f
        ON f.id_solicitud = t.id_solicitud
      WHERE t.id_tramite = ?
      `,
      [id_tramite]
    );

    const data = rows?.[0];

    if (!data) {
      return NextResponse.json(
        { error: "Sin datos del trámite" },
        { status: 404 }
      );
    }
    // =========================
// OBTENER ARCHIVOS ADJUNTOS
// =========================
const [archivosAdjuntos]: any = await pool.query(
  `
  SELECT
    id_archivo,
    tipo_archivo,
    archivo
  FROM archivos_tramite
  WHERE id_solicitud = ?
  `,
  [data.id_solicitud]
);

    // =========================
    // DATOS FACTURA
    // =========================
    const nombre =
      data.nombre_factura ||
      nombreUsuario ||
      data.nombre_completo;

    const nitCi =
      data.nit_ci_factura ||
      data.ci_usuario;

    const correo = data.correo;
    const tramite = data.nombre_tramite;
    const costo = Number(data.costo || 0);

    // =========================
    // NUMERO FACTURA
    // =========================
    const [ultimaFactura]: any = await pool.query(`
      SELECT numero_factura
      FROM facturas
      WHERE numero_factura IS NOT NULL
      ORDER BY id_factura DESC
      LIMIT 1
    `);

    let numeroFactura = 1;

    if (ultimaFactura.length > 0) {
      numeroFactura =
        Number(ultimaFactura[0].numero_factura) + 1;
    }

    const codigoControl =
      "CTRL-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 100000);

    // =========================
    // CARPETA PDF
    // =========================
    const folder = path.join(
      process.cwd(),
      "public/uploads/facturas"
    );

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const fileName = `factura-${id_tramite}-${Date.now()}.pdf`;
    const filePath = path.join(folder, fileName);

    // =========================
    // PDF
    // =========================
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4

    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

    const bold = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

    // =========================
    // LOGO
    // =========================
    const logoPath = path.join(
      process.cwd(),
      "public/logo.png"
    );

    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      const logo = await pdfDoc.embedPng(logoBytes);

      page.drawImage(logo, {
        x: 25,
        y: height - 100,
        width: 75,
        height: 75,
      });
    }

    // =========================
    // ENCABEZADO
    // =========================
    page.drawText(
      "UNIVERSIDAD PRIVADA DEL VALLE",
      {
        x: 150,
        y: height - 40,
        size: 14,
        font: bold,
      }
    );

    page.drawText(
      "COCHABAMBA - BOLIVIA",
      {
        x: 205,
        y: height - 58,
        size: 10,
        font,
      }
    );

    page.drawText(
      `FACTURA N° ${numeroFactura}`,
      {
        x: 400,
        y: height - 40,
        size: 10,
        font: bold,
      }
    );

    page.drawText(
      `Control: ${codigoControl}`,
      {
        x: 400,
        y: height - 58,
        size: 8,
        font,
      }
    );

   // =========================
// BLOQUE PRINCIPAL CLIENTE
// =========================
page.drawRectangle({
  x: 40,
  y: height - 220,
  width: 515,
  height: 90,
  color: rgb(0.95, 0.95, 0.95),
  borderWidth: 1,
  borderColor: rgb(0.7, 0.7, 0.7),
});

// Titulo
page.drawText("RAZON SOCIAL / NOMBRE", {
  x: 50,
  y: height - 150,
  size: 10,
  font: bold,
});

// Nombre grande
page.drawText(nombre.toUpperCase(), {
  x: 50,
  y: height - 175,
  size: 18,
  font: bold,
});

// NIT grande
page.drawText(`NIT / CI: ${nitCi}`, {
  x: 50,
  y: height - 200,
  size: 14,
  font: bold,
});

// =========================
// TITULO FACTURA
// =========================
page.drawText("FACTURA", {
  x: 240,
  y: height - 260,
  size: 22,
  font: bold,
});

page.drawText(
  "(Con Derecho a Crédito Fiscal)",
  {
    x: 190,
    y: height - 280,
    size: 8,
    font,
  }
);

// =========================
// DATOS CLIENTE
// =========================
let y = height - 330;

page.drawText(
  `Fecha: ${new Date().toLocaleDateString("es-BO")}`,
  {
    x: 40,
    y,
    size: 10,
    font,
  }
);

y -= 25;

page.drawText(
  `Correo: ${correo}`,
  {
    x: 40,
    y,
    size: 10,
    font,
  }
);
    // =========================
    // TABLA
    // =========================
    y -= 45;

    page.drawRectangle({
      x: 40,
      y: y - 20,
      width: 515,
      height: 22,
      color: rgb(0.9, 0.9, 0.9),
    });

    page.drawText("CODIGO", {
      x: 50,
      y: y - 14,
      size: 8,
      font: bold,
    });

    page.drawText("CANT.", {
      x: 110,
      y: y - 14,
      size: 8,
      font: bold,
    });

    page.drawText("DESCRIPCION", {
      x: 170,
      y: y - 14,
      size: 8,
      font: bold,
    });

    page.drawText("P. UNIT.", {
      x: 380,
      y: y - 14,
      size: 8,
      font: bold,
    });

    page.drawText("SUBTOTAL", {
      x: 485,
      y: y - 14,
      size: 8,
      font: bold,
    });

    // FILA
    y -= 45;

    page.drawRectangle({
      x: 40,
      y: y - 5,
      width: 515,
      height: 30,
      borderWidth: 1,
      borderColor: rgb(0.7, 0.7, 0.7),
    });

    page.drawText("TRM", {
      x: 50,
      y: y + 5,
      size: 9,
      font,
    });

    page.drawText("1", {
      x: 115,
      y: y + 5,
      size: 9,
      font,
    });

    page.drawText(tramite, {
      x: 170,
      y: y + 5,
      size: 9,
      font,
    });

    page.drawText(
      costo.toFixed(2),
      {
        x: 390,
        y: y + 5,
        size: 9,
        font,
      }
    );

    page.drawText(
      costo.toFixed(2),
      {
        x: 495,
        y: y + 5,
        size: 9,
        font,
      }
    );

    // =========================
    // TOTAL
    // =========================
    y -= 70;

    page.drawLine({
      start: { x: 340, y: y + 25 },
      end: { x: 555, y: y + 25 },
      thickness: 1,
    });

    page.drawText("TOTAL Bs:", {
      x: 410,
      y,
      size: 12,
      font: bold,
    });

    page.drawText(
      costo.toFixed(2),
      {
        x: 500,
        y,
        size: 12,
        font: bold,
      }
    );

    // =========================
    // PIE
    // =========================
    page.drawText(
      "Esta factura contribuye al desarrollo del pais.",
      {
        x: 140,
        y: 90,
        size: 8,
        font,
      }
    );

    page.drawText(
      "Gracias por utilizar nuestros servicios.",
      {
        x: 165,
        y: 75,
        size: 8,
        font,
      }
    );
    

    const pdfBytes = await pdfDoc.save();

    fs.writeFileSync(
      filePath,
      Buffer.from(pdfBytes)
    );

    const documentoFactura =
      `/uploads/facturas/${fileName}`;

    // =========================
    // UPDATE FACTURA
    // =========================
    await pool.query(
      `
      UPDATE facturas
      SET
        nombre = ?,
        nit_ci = ?,
        numero_factura = ?,
        codigo_control = ?,
        monto = ?,
        documento_factura = ?,
        fecha_emision = NOW()
      WHERE id_solicitud = ?
      `,
      [
        nombre,
        nitCi,
        numeroFactura,
        codigoControl,
        costo,
        documentoFactura,
        data.id_solicitud,
      ]
    );

    return NextResponse.json({
      success: true,
      factura: {
        numero_factura: numeroFactura,
        codigo_control: codigoControl,
        nombre,
        nit_ci: nitCi,
        monto: costo,
      },
      pdfUrl: documentoFactura,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}