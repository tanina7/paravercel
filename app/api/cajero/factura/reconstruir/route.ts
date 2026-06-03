import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getOriginalInvoicePath, mergeInvoiceWithAttachments } from "../utils";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body?.id_tramite) {
      return NextResponse.json(
        { error: "id_tramite requerido" },
        { status: 400 }
      );
    }

    const id_tramite = String(body.id_tramite);

    // =========================
    // FACTURAS
    // =========================
    const facturasPath = path.join(process.cwd(), "public/uploads/facturas");

    // =========================
    // ADJUNTOS
    // =========================
    const adjuntosPath = path.join(
      process.cwd(),
      "public/uploads/adjuntos",
      id_tramite
    );

    let adjuntos: string[] = [];
    let attachmentFiles: string[] = [];

    if (fs.existsSync(adjuntosPath)) {
      attachmentFiles = fs
        .readdirSync(adjuntosPath)
        .filter((f) => {
          if (f === "_meta.json" || f.startsWith(".")) return false;
          const filePath = path.join(adjuntosPath, f);
          try {
            return fs.statSync(filePath).isFile();
          } catch {
            return false;
          }
        })
        .map((f) => path.join(adjuntosPath, f));

      adjuntos = attachmentFiles.map((pathFile) => {
        const fileName = path.basename(pathFile);
        return `/uploads/adjuntos/${id_tramite}/${fileName}`;
      });
    }

    const baseInvoicePath = getOriginalInvoicePath(id_tramite);
    let pdfUrl: string | null = null;

    if (attachmentFiles.length > 0) {
      if (!baseInvoicePath) {
        return NextResponse.json({ error: "Factura base no encontrada para reconstruir" }, { status: 404 });
      }

      const mergedFileName = `factura-${id_tramite}-reconstruido-${Date.now()}.pdf`;
      const mergedFilePath = path.join(facturasPath, mergedFileName);
      await mergeInvoiceWithAttachments(baseInvoicePath, attachmentFiles, mergedFilePath);
      pdfUrl = `/uploads/facturas/${mergedFileName}`;
    } else if (baseInvoicePath) {
      pdfUrl = `/uploads/facturas/${path.basename(baseInvoicePath)}`;
    }

    return NextResponse.json({
      pdfUrl,
      adjuntos
    });

  } catch (error: any) {
    console.error("RECONSTRUIR ERROR:", error);

    return NextResponse.json(
      {
        error: "Error reconstruyendo factura",
        detail: error?.message
      },
      { status: 500 }
    );
  }
}