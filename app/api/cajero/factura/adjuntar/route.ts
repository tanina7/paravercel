import pool from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getOriginalInvoicePath, mergeInvoiceWithAttachments } from "../utils";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const id_tramite = formData.get("id_tramite")?.toString();
    const tramiteId = String(id_tramite);
    const files = formData.getAll("files") as File[];

    if (!id_tramite || files.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const folder = path.join(process.cwd(), "public/uploads/adjuntos", tramiteId);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const metaPath = path.join(folder, "_meta.json");
    let meta = { files: [] as string[] };

    if (fs.existsSync(metaPath)) {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    }

    const urlsNuevas: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/\s+/g, "_");
      const destPath = path.join(folder, safeName);

      fs.writeFileSync(destPath, buffer);

      if (!meta.files.includes(safeName)) {
        meta.files.push(safeName);
      }

      urlsNuevas.push(`/uploads/adjuntos/${tramiteId}/${safeName}`);
    }

    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

    const [tramiteRows]: any = await pool.query(
      `
      SELECT
        t.id_solicitud,
        f.id_factura,
        f.documento_factura
      FROM tramites t
      LEFT JOIN facturas f ON f.id_solicitud = t.id_solicitud
      WHERE t.id_tramite = ?
      `,
      [id_tramite]
    );

    const tramiteData = tramiteRows?.[0];
    if (!tramiteData) {
      return NextResponse.json({ error: "Trámite no encontrado" }, { status: 404 });
    }

    const facturaFolder = path.join(process.cwd(), "public/uploads/facturas");
    const invoicePath = getOriginalInvoicePath(id_tramite, tramiteData.documento_factura);

    if (!invoicePath) {
      return NextResponse.json({ error: "Factura existente no encontrada para fusionar" }, { status: 404 });
    }

    const attachmentFiles = fs
      .readdirSync(folder)
      .filter((f) => f !== "_meta.json")
      .map((f) => path.join(folder, f));

    let pdfUrl: string | null = null;
    const adjuntosUrls = attachmentFiles.map((file) => {
      const fileName = path.basename(file);
      return `/uploads/adjuntos/${tramiteId}/${fileName}`;
    });

    if (attachmentFiles.length > 0) {
      const mergedFileName = `factura-${id_tramite}-merged-${Date.now()}.pdf`;
      const mergedFilePath = path.join(facturaFolder, mergedFileName);

      await mergeInvoiceWithAttachments(invoicePath, attachmentFiles, mergedFilePath);
      pdfUrl = `/uploads/facturas/${mergedFileName}`;

      if (tramiteData.id_factura) {
        await pool.query(
          `
          UPDATE facturas
          SET documento_factura = ?, fecha_emision = NOW()
          WHERE id_factura = ?
          `,
          [pdfUrl, tramiteData.id_factura]
        );
      }
    }

    return NextResponse.json({ ok: true, urlsNuevas, pdfUrl, adjuntos: adjuntosUrls });

  } catch (err) {
    console.error("Error al adjuntar:", err);
    return NextResponse.json({ error: "Error adjuntando" }, { status: 500 });
  }
}