import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    console.log("\n==============================");
    console.log("🚀 INICIO PREVIEW FACTURA");
    console.log("==============================\n");

    const { id_tramite, nombre: nombreUsuario } = await req.json();

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
    // OBTENER DATOS + FACTURA
    // =========================
    const [rows]: any = await pool.query(
      `
      SELECT
          t.id_tramite,
          t.id_solicitud,
          s.id_estudiante,
          u.nombre_completo,
          u.correo,

          -- datos usuario
          u.ci AS ci_usuario,

          -- datos factura (lo importante)
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
        { error: "Sin datos del trámite" },
        { status: 404 }
      );
    }

    // =========================
    // 🔥 PRIORIDAD REAL
    // =========================

    // nombre: factura → frontend → usuario
    const nombre =
      data.nombre_factura ||
      nombreUsuario ||
      data.nombre_completo;

    // nit_ci: factura → usuario
    const nitCi =
      data.nit_ci_factura ||
      data.ci_usuario;

    const correo = data.correo;
    const tramite = data.nombre_tramite;
    const costo = Number(data.costo || 0);

    // =========================
    // PDF
    // =========================
    const folder = path.join(process.cwd(), "public/uploads/facturas");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const fileName = `factura-${id_tramite}-${Date.now()}.pdf`;
    const filePath = path.join(folder, fileName);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { height } = page.getSize();

    page.drawText("FACTURA", { x: 250, y: height - 50, size: 20 });

    page.drawText(`Cliente: ${nombre}`, { x: 50, y: height - 130 });
    page.drawText(`CI/NIT: ${nitCi}`, { x: 50, y: height - 160 });
    page.drawText(`Trámite: ${tramite}`, { x: 50, y: height - 220 });
    page.drawText(`Monto: Bs ${costo.toFixed(2)}`, { x: 50, y: height - 250 });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, Buffer.from(pdfBytes));

    // =========================
    // NUMERO FACTURA
    // =========================
    const [ultimaFactura]: any = await pool.query(
      `
      SELECT numero_factura
      FROM facturas
      WHERE numero_factura IS NOT NULL
      ORDER BY id_factura DESC
      LIMIT 1
      `
    );

    let numeroFactura = 1;

    if (ultimaFactura.length > 0) {
      numeroFactura = Number(ultimaFactura[0].numero_factura) + 1;
    }

    const codigoControl =
      "CTRL-" + Date.now() + "-" + Math.floor(Math.random() * 100000);

    const documentoFactura = `/uploads/facturas/${fileName}`;

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
      { error: error.message },
      { status: 500 }
    );
  }
}