import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import mysql from 'mysql2/promise';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    
    // 1. Recibimos los datos del formulario
    const nombre = data.get('nombre') as string || '';
    const apellido = data.get('apellido') as string || '';
    const foto = data.get('foto') as File;
    const firma = data.get('firma') as File;

    if (!foto || !firma) {
      return NextResponse.json({ error: "Faltan datos o imágenes" }, { status: 400 });
    }

    const nombreCompleto = `${nombre} ${apellido}`.trim();

    // 2. Crear la carpeta "public/uploads" si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // 3. Convertir y guardar la Foto en tu disco duro
    const timestamp = Date.now();
    const fotoBuffer = Buffer.from(await foto.arrayBuffer());
    const fotoName = `foto_${timestamp}_${foto.name.replaceAll(' ', '_')}`;
    await writeFile(path.join(uploadDir, fotoName), fotoBuffer);
    const fotoUrl = `/uploads/${fotoName}`;

    // 4. Convertir y guardar la Firma en tu disco duro
    const firmaBuffer = Buffer.from(await firma.arrayBuffer());
    const firmaName = `firma_${timestamp}_${firma.name.replaceAll(' ', '_')}`;
    await writeFile(path.join(uploadDir, firmaName), firmaBuffer);
    const firmaUrl = `/uploads/${firmaName}`;

    // 5. Conectarse a Aiven
    const connection = await mysql.createConnection({
      host: 'mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com',
      user: 'avnadmin',
      password: 'AVNS_iKeVgvVdaPJAQcw2XtV',
      database: 'tramites_univalle',
      port: 11597,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // 6. Ejecutamos el INSERT (Para que se cree un nuevo registro en tu tabla 'usuarios')
    // Guardamos las rutas cortas (/uploads/foto.png) en la base de datos
    await connection.execute(
      `INSERT INTO usuarios (nombre_completo, foto_perfil_url, firma_digital_url) VALUES (?, ?, ?)`,
      [nombreCompleto, fotoUrl, firmaUrl]
    );

    await connection.end();

    return NextResponse.json({ success: true, message: "Firma creada y guardada en local" });

  } catch (error) {
    console.error("Error en la API de subida:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}