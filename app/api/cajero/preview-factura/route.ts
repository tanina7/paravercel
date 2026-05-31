import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

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

    const folder = path.join(process.cwd(), "public/uploads/facturas");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

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

    page.drawText(`ID: ${data.id_tramite}`, { x: 50, y: height - 100, size: 12 });
    page.drawText(`Cliente: ${data.nombre_completo}`, { x: 50, y: height - 120, size: 12 });
    page.drawText(`Correo: ${data.correo}`, { x: 50, y: height - 140, size: 12 });

    page.drawText(`Trámite: ${data.nombre_tramite}`, { x: 50, y: height - 180, size: 12 });
    page.drawText(`Costo: Bs ${data.costo}`, { x: 50, y: height - 200, size: 12 });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);

    return NextResponse.json({
      pdfUrl: `/uploads/facturas/${fileName}`
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}