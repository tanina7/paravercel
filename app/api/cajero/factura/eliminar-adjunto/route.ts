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

    // url espera formato /uploads/adjuntos/<id_tramite>/<file>
    const parsed = url.replace(/^\//, "");
    const filePath = path.join(process.cwd(), parsed);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }

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
