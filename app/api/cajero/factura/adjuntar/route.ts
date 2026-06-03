import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();

  const id_tramite = formData.get("id_tramite") as string;
  const files = formData.getAll("files") as File[];

  if (!id_tramite || files.length === 0) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const folder = path.join(
    process.cwd(),
    "public/uploads/adjuntos",
    id_tramite
  );

  fs.mkdirSync(folder, { recursive: true });

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(folder, file.name), buffer);
  }

  return NextResponse.json({ ok: true });
}