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

    const { id_tramite, nombre: nombreUsuario } = await req.json();

    if (!id_tramite) {
      return NextResponse.json(
        { error: "id_tramite es requerido" },
        { status: 400 }
      );
    }

    // =========================
    // TRÁMITE
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
    // DATOS
    // =========================
    const [rows]: any = await pool.query(
      `
      SELECT
        t.id_tramite,
        t.id_solicitud,
        u.nombre_completo,
        u.correo,
        u.ci AS ci_usuario,
        f.nombre AS nombre_factura,
        f.nit_ci AS nit_ci_factura,
        tt.nombre_tramite,
        tt.costo
      FROM tramites t
      INNER JOIN solicitudes_tramite s ON s.id_solicitud = t.id_solicitud
      INNER JOIN usuarios u ON u.id_usuario = s.id_estudiante
      INNER JOIN tipos_tramite tt ON tt.id_tipo = t.id_tipo
      LEFT JOIN facturas f ON f.id_solicitud = t.id_solicitud
      WHERE t.id_tramite = ?
      `,
      [id_tramite]
    );

    const data = rows?.[0];

    if (!data) {
      return NextResponse.json(
        { error: "Sin datos" },
        { status: 404 }
      );
    }

    const nombre =
      data.nombre_factura ||
      nombreUsuario ||
      data.nombre_completo;

    const nitCi = data.nit_ci_factura || data.ci_usuario;

    const correo = data.correo;
    const tramite = data.nombre_tramite;
    const costo = Number(data.costo || 0);

    // =========================
    // NUMERO FACTURA
    // =========================
    const [ultimaFactura]: any = await pool.query(`
      SELECT numero_factura
      FROM facturas
      ORDER BY id_factura DESC
      LIMIT 1
    `);

    let numeroFactura = 1;
    if (ultimaFactura.length > 0) {
      numeroFactura =
        Number(ultimaFactura[0].numero_factura) + 1;
    }

    const codigoControl =
      "CTRL-" + Date.now() + "-" + Math.floor(Math.random() * 100000);

    // =========================
    // PDF
    // =========================
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);

    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // =========================
    // HEADER
    // =========================
    page.drawText("UNIVERSIDAD PRIVADA DEL VALLE", {
      x: 150,
      y: height - 40,
      size: 14,
      font: bold,
    });

    page.drawText(`FACTURA N° ${numeroFactura}`, {
      x: 400,
      y: height - 40,
      size: 10,
      font: bold,
    });

    page.drawText(`Control: ${codigoControl}`, {
      x: 400,
      y: height - 58,
      size: 8,
      font,
    });

    // =========================
    // CLIENTE
    // =========================
    page.drawText(nombre.toUpperCase(), {
      x: 50,
      y: height - 170,
      size: 16,
      font: bold,
    });

    page.drawText(`NIT/CI: ${nitCi}`, {
      x: 50,
      y: height - 200,
      size: 12,
      font,
    });

    // =========================
    // DETALLE
    // =========================
    page.drawText(tramite, {
      x: 50,
      y: height - 300,
      size: 12,
      font,
    });

    page.drawText(`${costo.toFixed(2)} Bs`, {
      x: 400,
      y: height - 300,
      size: 12,
      font: bold,
    });

    const pdfBytes = await pdfDoc.save();

    const folder = path.join(process.cwd(), "public/uploads/facturas");

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const fileName = `factura-${id_tramite}-${Date.now()}.pdf`;
    const filePath = path.join(folder, fileName);

    fs.writeFileSync(filePath, Buffer.from(pdfBytes));

    const pdfUrl = `/uploads/facturas/${fileName}`;

    // =========================
    // SAVE FACTURA
    // =========================
    await pool.query(
      `
      UPDATE facturas
      SET nombre=?, nit_ci=?, numero_factura=?, codigo_control=?, monto=?, documento_factura=?, fecha_emision=NOW()
      WHERE id_solicitud=?
      `,
      [
        nombre,
        nitCi,
        numeroFactura,
        codigoControl,
        costo,
        pdfUrl,
        data.id_solicitud,
      ]
    );

    return NextResponse.json({
      success: true,
      pdfUrl,
      numeroFactura,
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}