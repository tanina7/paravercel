import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

export function getOriginalInvoicePath(tramiteId: string, currentDocUrl?: string) {
  const facturaFolder = path.join(process.cwd(), "public/uploads/facturas");
  const candidatePath = currentDocUrl
    ? path.join(process.cwd(), currentDocUrl.replace(/^\//, ""))
    : "";

  if (currentDocUrl && fs.existsSync(candidatePath)) {
    const baseName = path.basename(candidatePath);
    if (!baseName.includes("-merged-") && baseName.startsWith(`factura-${tramiteId}-`)) {
      return candidatePath;
    }
  }

  if (fs.existsSync(facturaFolder)) {
    const originalFiles = fs
      .readdirSync(facturaFolder)
      .filter((f) => f.startsWith(`factura-${tramiteId}-`) && !f.includes("-merged-"))
      .sort((a, b) => b.localeCompare(a));

    if (originalFiles.length > 0) {
      return path.join(facturaFolder, originalFiles[0]);
    }
  }

  if (currentDocUrl && fs.existsSync(candidatePath)) {
    return candidatePath;
  }

  return "";
}

export async function mergeInvoiceWithAttachments(
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
    const attachBytes = fs.readFileSync(attachPath);

    if (ext === ".pdf") {
      const attachDoc = await PDFDocument.load(attachBytes);
      const attachPages = await mergedPdf.copyPages(attachDoc, attachDoc.getPageIndices());
      attachPages.forEach((page) => mergedPdf.addPage(page));
      continue;
    }

    if ([".png", ".jpg", ".jpeg"].includes(ext)) {
      const page = mergedPdf.addPage([595, 842]);
      const image = ext === ".png"
        ? await mergedPdf.embedPng(attachBytes)
        : await mergedPdf.embedJpg(attachBytes);

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
      continue;
    }

    console.warn(`Archivo no compatible para fusionar: ${attachPath}`);
  }

  const mergedBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, Buffer.from(mergedBytes));
}
