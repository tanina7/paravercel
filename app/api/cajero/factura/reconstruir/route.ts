import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
    let match = null;

    if (fs.existsSync(facturasPath)) {
      const files = fs.readdirSync(facturasPath);
      match = files
        .filter(f => f.startsWith(`factura-${id_tramite}-`)) // <-- CORREGIDO CON BACKTICKS
        .sort((a, b) => b.localeCompare(a))[0];
    }

    // =========================
    // ADJUNTOS
    // =========================
    const adjuntosPath = path.join(
      process.cwd(),
      "public/uploads/adjuntos",
      id_tramite
    );

    let adjuntos: string[] = [];

    if (fs.existsSync(adjuntosPath)) {
      adjuntos = fs
        .readdirSync(adjuntosPath)
        .filter(f => f !== "_meta.json") // <-- CORREGIDO: Ignora el archivo de configuración
        .map(f => `/uploads/adjuntos/${id_tramite}/${f}`); // <-- CORREGIDO CON BACKTICKS
    }

    return NextResponse.json({
      pdfUrl: match ? `/uploads/facturas/${match}` : null, // <-- CORREGIDO CON BACKTICKS
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