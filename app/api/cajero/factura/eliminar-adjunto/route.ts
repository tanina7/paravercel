import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_tramite, url } = body;

    if (!id_tramite || !url) {
      return NextResponse.json({ error: "id_tramite y url son requeridos" }, { status: 400 });
    }

    // url puede venir como /uploads/adjuntos/<id_tramite>/<file>
    // o bien como una URL completa.
    let parsed = url;
    try {
      const parsedUrl = new URL(url, "http://localhost");
      parsed = parsedUrl.pathname;
    } catch {
      // si no es URL completa, mantener el valor original.
    }

    parsed = parsed.replace(/^\//, "").split(/[?#]/)[0];
    const fileName = path.basename(parsed);
    const candidatePaths = [
      path.join(process.cwd(), parsed),
      path.join(process.cwd(), "public/uploads/adjuntos", String(id_tramite), fileName),
      path.join(process.cwd(), "public/uploads/adjuntos", String(id_tramite), decodeURIComponent(fileName))
    ];

    const filePath = candidatePaths.find((candidate) => fs.existsSync(candidate));

    if (!filePath) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    // actualizar _meta.json si existe
    const folder = path.join(process.cwd(), "public/uploads/adjuntos", String(id_tramite));
    const metaPath = path.join(folder, "_meta.json");

    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
        const fname = path.basename(filePath);
        meta.files = (meta.files || []).filter((f: string) => f !== fname);
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      } catch (e) {
        console.warn("No se pudo actualizar _meta.json", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error eliminar-adjunto:", err);
    return NextResponse.json({ error: err?.message || "Error eliminando adjunto" }, { status: 500 });
  }
}
