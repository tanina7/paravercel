import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const { id_tramite } = await req.json();

  const folder = path.join(process.cwd(), "public/uploads/facturas");

  if (!fs.existsSync(folder)) {
    return NextResponse.json({ error: "No existe carpeta" }, { status: 404 });
  }

  const files = fs.readdirSync(folder);

  const match = files
    .filter(f => f.includes(`factura-${id_tramite}-`))
    .sort()
    .reverse()[0];

  if (!match) {
    return NextResponse.json(
      { error: "Factura no encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    pdfUrl: `/uploads/facturas/${match}`
  });
}