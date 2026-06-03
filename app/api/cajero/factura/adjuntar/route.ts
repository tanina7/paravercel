import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

function isPdf(ext: string) {
  return ext === ".pdf";
}

function isImage(ext: string) {
  return [".png", ".jpg", ".jpeg"].includes(ext);
}

async function mergeInvoiceWithAttachments(
  invoicePath: string,
  attachmentPaths: string[],
  outputPath: string
) {
  const mergedPdf = await PDFDocument.create();
  const invoiceBytes = fs.readFileSync(invoicePath);
  const invoiceDoc = await PDFDocument.load(invoiceBytes);
  const invoicePages = await mergedPdf.copyPages(invoiceDoc, invoiceDoc.getPageIndices());
  invoicePages.forEach((page) => mergedPdf.addPage(page));

  for (const attachPath of attachmentPaths) {
    const ext = path.extname(attachPath).toLowerCase();

    if (isPdf(ext)) {
      const attachBytes = fs.readFileSync(attachPath);
      const attachDoc = await PDFDocument.load(attachBytes);
      const attachPages = await mergedPdf.copyPages(attachDoc, attachDoc.getPageIndices());
      attachPages.forEach((page) => mergedPdf.addPage(page));
    } else if (isImage(ext)) {
      const imageBytes = fs.readFileSync(attachPath);
      const page = mergedPdf.addPage([595, 842]);

      const image =
        ext === ".png"
          ? await mergedPdf.embedPng(imageBytes)
          : await mergedPdf.embedJpg(imageBytes);

      const { width, height } = image.scale(1);
      const maxWidth = 550;
      const maxHeight = 800;
      const scale = Math.min(maxWidth / width, maxHeight / height, 1);
      const imgWidth = width * scale;
      const imgHeight = height * scale;

      page.drawImage(image, {
        x: (595 - imgWidth) / 2,
        y: (842 - imgHeight) / 2,
        width: imgWidth,
        height: imgHeight,
      });
    } else {
      console.warn(`Archivo no compatible para fusionar: ${attachPath}`);
    }
  }

  const mergedBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, Buffer.from(mergedBytes));
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const id_tramite = formData.get("id_tramite")?.toString();
    const files = formData.getAll("files") as File[];

    if (!id_tramite || files.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const folder = path.join(process.cwd(), "public/uploads/adjuntos", id_tramite);
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

      urlsNuevas.push(`/uploads/adjuntos/${id_tramite}/${safeName}`);
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
    let invoicePath = "";

    if (tramiteData.documento_factura) {
      const candidate = path.join(process.cwd(), tramiteData.documento_factura.replace(/^\//, ""));
      if (fs.existsSync(candidate)) {
        invoicePath = candidate;
      }
    }

    if (!invoicePath && fs.existsSync(facturaFolder)) {
      const facturaFiles = fs.readdirSync(facturaFolder).filter((f) => f.includes(`factura-${id_tramite}-`));
      const latest = facturaFiles.sort().reverse()[0];
      if (latest) {
        invoicePath = path.join(facturaFolder, latest);
      }
    }

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
      return `/uploads/adjuntos/${id_tramite}/${fileName}`;
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