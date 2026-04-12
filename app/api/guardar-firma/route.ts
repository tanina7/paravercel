import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import mysql from 'mysql2/promise'; // Requiere: npm install mysql2

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const foto = data.get('foto') as File;
    const firma = data.get('firma') as File;
    const idUsuario = data.get('id_usuario');

    if (!foto || !firma || !idUsuario) {
      return NextResponse.json({ error: "Faltan datos o imágenes" }, { status: 400 });
    }

    // 1. Convertir los archivos a un formato que Node.js pueda guardar
    const fotoBuffer = Buffer.from(await foto.arrayBuffer());
    const firmaBuffer = Buffer.from(await firma.arrayBuffer());

    // 2. Limpiar nombres para evitar errores y hacerlos únicos
    const timestamp = Date.now();
    const fotoName = `foto_${timestamp}_${foto.name.replaceAll(' ', '_')}`;
    const firmaName = `firma_${timestamp}_${firma.name.replaceAll(' ', '_')}`;

    // 3. Crear las rutas físicas en tu carpeta "public"
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Esto crea la carpeta /public/uploads/ si no existe
    await mkdir(uploadDir, { recursive: true });

    // 4. Guardar los archivos físicamente en el disco duro
    await writeFile(path.join(uploadDir, fotoName), fotoBuffer);
    await writeFile(path.join(uploadDir, firmaName), firmaBuffer);

    // 5. Las rutas web (lo que se guardará en MySQL)
    const fotoUrl = `/uploads/${fotoName}`;
    const firmaUrl = `/uploads/${firmaName}`;

    // 6. Conectarse a Aiven y actualizar la base de datos
    // 🔴 IMPORTANTE: Cambia estos valores por tus credenciales de Aiven
const connection = await mysql.createConnection({
      host: 'mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com',
      user: 'avnadmin',
      password: 'AVNS_iKeVgvVdaPJAQcw2XtV', // Haz clic en el ícono del ojito en Aiven para copiarla
      database: 'tramites_univalle',       // Mantenemos este porque aquí creaste tus tablas (según tu captura de Workbench)
      port: 11597,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // 7. Ejecutamos el UPDATE (Asumiendo que hiciste el ALTER TABLE en la tabla usuarios)
    const [result] = await connection.execute(
      `UPDATE usuarios SET foto_perfil_url = ?, firma_digital_url = ? WHERE id_usuario = ?`,
      [fotoUrl, firmaUrl, idUsuario]
    );

    await connection.end();

    return NextResponse.json({ success: true, fotoUrl, firmaUrl });

  } catch (error) {
    console.error("Error en la API de subida:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}