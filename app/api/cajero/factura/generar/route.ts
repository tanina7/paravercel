import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_tramite, nombre: nombreUsuario } = body;

    if (!id_tramite) {
      return NextResponse.json({ error: "id_tramite requerido" }, { status: 400 });
    }

    const [rows]: any = await pool.query(
      `
      SELECT
        t.id_tramite,
        t.id_solicitud,
        u.nombre_completo,
        u.correo,
        u.ci AS ci_usuario,
        f.id_factura,
        f.nombre AS nombre_factura,
        f.nit_ci AS nit_ci_factura,
        f.numero_factura AS factura_numero,
        f.codigo_control AS factura_codigo_control,
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
    if (!data) return NextResponse.json({ error: "Sin datos" }, { status: 404 });

    const nombre =
      data.nombre_factura ||
      nombreUsuario ||
      data.nombre_completo ||
      "SIN NOMBRE";

    const nitCi = data.nit_ci_factura || data.ci_usuario || "0";
    const tramite = data.nombre_tramite || "TRAMITE";
    const costo = Number(data.costo ?? 0);

    let numeroFactura = Number(data.factura_numero ?? 0);
    let codigoControl = data.factura_codigo_control || "";

    if (!numeroFactura) {
      const [last]: any = await pool.query(`SELECT MAX(CAST(numero_factura AS UNSIGNED)) AS maxNum FROM facturas`);
      numeroFactura = Number(last?.[0]?.maxNum ?? 0) + 1;
      codigoControl = `CTRL-${Date.now()}`;
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { height } = page.getSize();

    page.drawText("UNIVERSIDAD PRIVADA DEL VALLE", { x: 120, y: height - 50, size: 14, font: bold });
    page.drawText(`FACTURA N° ${numeroFactura}`, { x: 400, y: height - 50, size: 10, font: bold });

    page.drawText(nombre, { x: 50, y: height - 150, size: 12, font: bold });
    page.drawText(`NIT/CI: ${nitCi}`, { x: 50, y: height - 170, size: 10, font });

    page.drawText(tramite, { x: 50, y: height - 250, size: 11, font });
    page.drawText(`${costo.toFixed(2)} Bs`, { x: 450, y: height - 250, size: 11, font: bold });

    const pdfBytes = await pdfDoc.save();

    const folder = path.join(process.cwd(), "public/uploads/facturas");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const fileName = `factura-${id_tramite}-${Date.now()}.pdf`;
    fs.writeFileSync(path.join(folder, fileName), Buffer.from(pdfBytes));

    const pdfUrl = `/uploads/facturas/${fileName}`;

    if (data.id_factura) {
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
        WHERE id_factura = ?
        `,
        [nombre, nitCi, numeroFactura, codigoControl, costo, pdfUrl, data.id_factura]
      );
    } else {
      await pool.query(
        `
        INSERT INTO facturas (
          id_solicitud,
          nombre,
          nit_ci,
          numero_factura,
          codigo_control,
          monto,
          documento_factura,
          fecha_emision
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [data.id_solicitud, nombre, nitCi, numeroFactura, codigoControl, costo, pdfUrl]
      );
    }

    const adjuntosPath = path.join(process.cwd(), "public/uploads/adjuntos", id_tramite);
    let adjuntos: string[] = [];

    if (fs.existsSync(adjuntosPath)) {
      adjuntos = fs
        .readdirSync(adjuntosPath)
        .filter((f) => f !== "_meta.json")
        .map((f) => `/uploads/adjuntos/${id_tramite}/${f}`);
    }

    return NextResponse.json({ success: true, pdfUrl, adjuntos });

  } catch (err: any) {
    console.error("Error generando factura:", err);
    return NextResponse.json({ error: err?.message || "Error generando factura" }, { status: 500 });
  }
}