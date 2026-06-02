
import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    console.log("\n==============================");
    console.log("🚀 INICIO PREVIEW FACTURA");
    console.log("==============================\n");

    const { id_tramite } = await req.json();

    console.log("📩 BODY RECIBIDO:", { id_tramite });

    if (!id_tramite) {
      return NextResponse.json(
        { error: "id_tramite es requerido" },
        { status: 400 }
      );
    }

    // =========================
    // 1. VALIDAR TRÁMITE
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
    // 2. OBTENER DATOS
    // =========================
    const [rows]: any = await pool.query(
      `
      SELECT
          t.id_tramite,
          t.id_solicitud,
          s.id_estudiante,
          u.id_usuario,
          u.nombre_completo,
          u.correo,
          u.ci,
          tt.nombre_tramite,
          tt.costo
      FROM tramites t

      INNER JOIN solicitudes_tramite s
          ON s.id_solicitud = t.id_solicitud

      INNER JOIN usuarios u
          ON u.id_usuario = s.id_estudiante

      LEFT JOIN estudiantes e
          ON e.id_usuario = u.id_usuario

      INNER JOIN tipos_tramite tt
          ON tt.id_tipo = t.id_tipo

      WHERE t.id_tramite = ?
      `,
      [id_tramite]
    );

    console.log("\n📊 RESULTADO QUERY:");
    console.log(rows);

    const data = rows?.[0];

    if (!data) {
      return NextResponse.json(
        { error: "Sin datos del trámite" },
        { status: 404 }
      );
    }

    const nombre = data.nombre_completo || "Sin nombre";
    const correo = data.correo || "Sin correo";
    const nitCi = data.ci || "";
    const tramite = data.nombre_tramite || "Sin trámite";
    const costo = Number(data.costo || 0);

    console.log("\n✅ DATOS FINALES:");
    console.log({
      nombre,
      correo,
      nitCi,
      tramite,
      costo,
    });

    // =========================
    // 3. CREAR CARPETA
    // =========================
    const folder = path.join(
      process.cwd(),
      "public/uploads/facturas"
    );

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log("📁 Carpeta creada");
    }

    // =========================
    // 4. GENERAR PDF
    // =========================
    const fileName = `factura-${id_tramite}-${Date.now()}.pdf`;

    const filePath = path.join(folder, fileName);

    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([600, 800]);

    const { height } = page.getSize();

    page.drawText("FACTURA", {
      x: 250,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    });

    page.drawText(`ID Trámite: ${id_tramite}`, {
      x: 50,
      y: height - 100,
    });

    page.drawText(`Cliente: ${nombre}`, {
      x: 50,
      y: height - 130,
    });

    page.drawText(`CI/NIT: ${nitCi}`, {
      x: 50,
      y: height - 160,
    });

    page.drawText(`Correo: ${correo}`, {
      x: 50,
      y: height - 190,
    });

    page.drawText(`Trámite: ${tramite}`, {
      x: 50,
      y: height - 220,
    });

    page.drawText(`Monto: Bs ${costo.toFixed(2)}`, {
      x: 50,
      y: height - 250,
    });

    const pdfBytes = await pdfDoc.save();

    fs.writeFileSync(filePath, Buffer.from(pdfBytes));

    console.log("🎉 PDF GENERADO");

    // =========================
    // 5. GENERAR NUMERO FACTURA
    // =========================
    const [ultimaFactura]: any = await pool.query(
      `
      SELECT numero_factura
      FROM facturas
      ORDER BY id_factura DESC
      LIMIT 1
      `
    );

    let numeroFactura = 1;

    if (
      ultimaFactura.length > 0 &&
      ultimaFactura[0].numero_factura
    ) {
      numeroFactura =
        Number(ultimaFactura[0].numero_factura) + 1;
    }

    // =========================
    // 6. GENERAR CODIGO CONTROL
    // =========================
    const codigoControl =
      "CTRL-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 100000);

    // =========================
    // 7. GUARDAR FACTURA EN BD
    // =========================
    const documentoFactura = `/uploads/facturas/${fileName}`;

    const [facturaResult]: any = await pool.query(
      `
      INSERT INTO facturas (
          id_solicitud,
          nit_ci,
          nombre,
          numero_factura,
          codigo_control,
          monto,
          documento_factura,
          fecha_emision
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        data.id_solicitud,
        nitCi,
        nombre,
        numeroFactura,
        codigoControl,
        costo,
        documentoFactura,
      ]
    );

    console.log("✅ FACTURA REGISTRADA");
    console.log("ID FACTURA:", facturaResult.insertId);

    // =========================
    // 8. RESPUESTA
    // =========================
    return NextResponse.json({
      success: true,
      factura: {
        id_factura: facturaResult.insertId,
        numero_factura: numeroFactura,
        codigo_control: codigoControl,
        nit_ci: nitCi,
        nombre,
        monto: costo,
        fecha_emision: new Date(),
      },
      pdfUrl: documentoFactura,
    });
  } catch (error: any) {
    console.error("\n🔥 ERROR COMPLETO:");
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Error interno del servidor",
      },
      {
        status: 500,
      }
    );
  }
}

