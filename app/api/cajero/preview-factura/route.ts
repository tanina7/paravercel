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
    // 2. QUERY PRINCIPAL
    // =========================
    const [rows]: any = await pool.query(
      `
      SELECT
          t.id_tramite,
          s.id_estudiante,
          u.id_usuario,
          u.nombre_completo,
          u.correo,
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
    const tramite = data.nombre_tramite || "Sin trámite";
    const costo = data.costo || "0.00";

    console.log("\n✅ DATOS FINALES:");
    console.log({
      nombre,
      correo,
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
    }

    // =========================
    // 4. GENERAR PDF
    // =========================
    const fileName = `preview-${id_tramite}-${Date.now()}.pdf`;

    const filePath = path.join(folder, fileName);

    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([600, 800]);

    const { height } = page.getSize();

    page.drawText("PREVIEW FACTURA", {
      x: 200,
      y: height - 50,
      size: 18,
      color: rgb(0, 0, 0),
    });

    page.drawText(`ID: ${id_tramite}`, {
      x: 50,
      y: height - 100,
    });

    page.drawText(`Cliente: ${nombre}`, {
      x: 50,
      y: height - 120,
    });

    page.drawText(`Correo: ${correo}`, {
      x: 50,
      y: height - 140,
    });

    page.drawText(`Trámite: ${tramite}`, {
      x: 50,
      y: height - 180,
    });

    page.drawText(`Costo: Bs ${costo}`, {
      x: 50,
      y: height - 200,
    });

    const pdfBytes = await pdfDoc.save();

    fs.writeFileSync(filePath, Buffer.from(pdfBytes));

    console.log("🎉 PDF GENERADO");

    return NextResponse.json({
      success: true,
      debug: {
        id_tramite,
        nombre,
        correo,
        tramite,
        costo,
      },
      pdfUrl: `/uploads/facturas/${fileName}`,
    });
  } catch (error: any) {
    console.error("🔥 ERROR COMPLETO:", error);

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