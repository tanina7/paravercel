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
    const rolTexto = data.get('rol') as string || '';
    const foto = data.get('foto') as File;
    const firma = data.get('firma') as File;

    if (!nombre || !apellido || !rolTexto || !foto || !firma) {
      return NextResponse.json({ error: "Faltan datos, el rol o las imágenes" }, { status: 400 });
    }

    const nombreCompleto = `${nombre} ${apellido}`.trim();
    const correoGenerado = `${nombre.toLowerCase()}.${apellido.toLowerCase()}@univalle.edu`.replace(/\s+/g, '');
    
    // --- NUEVO: Generamos campos obligatorios para la BD ---
    const username = `${nombre.toLowerCase().substring(0, 3)}${apellido.toLowerCase().substring(0, 4)}${Date.now().toString().slice(-2)}`.replace(/\s+/g, '');
    const password_hash = '123456'; // Contraseña por defecto según tu BD
    const estado = 1; // 1 = Activo

    // --- NUEVO: Mapeo de Roles (Texto a Número) ---
    // Según tu BD: 1=Estudiante, 5=Director de Carrera. 
    // Asignaremos 6 al Vicerrector y 7 al Rector (si tienes otros IDs en tu BD real, cámbialos aquí).
    let id_rol = 1; 
    if (rolTexto === 'Director de Carrera') id_rol = 5;
    else if (rolTexto === 'Vicerrector Académico') id_rol = 6;
    else if (rolTexto === 'Rector') id_rol = 7;

    // 2. Crear la carpeta "public/uploads" si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // 3. Convertir y guardar la Foto
    const timestamp = Date.now();
    const fotoBuffer = Buffer.from(await foto.arrayBuffer());
    const fotoName = `foto_${timestamp}_${foto.name.replaceAll(' ', '_')}`;
    await writeFile(path.join(uploadDir, fotoName), fotoBuffer);
    const fotoUrl = `/uploads/${fotoName}`;

    // 4. Convertir y guardar la Firma
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

    // 6. VALIDACIÓN ESTRICTA: Evitar más de un Rector (ID 7)
    if (id_rol === 7) {
      const [rectorExistente]: any = await connection.execute(
        `SELECT id_usuario FROM usuarios WHERE id_rol = 7 LIMIT 1`
      );

      if (rectorExistente.length > 0) {
        await connection.end();
        return NextResponse.json(
          { error: "Ya existe un Rector registrado. El sistema solo permite un Rector a la vez." }, 
          { status: 400 }
        );
      }
    }

    // 7. INSERCIÓN FINAL (Con los nombres de columna exactos de tu BD)
    await connection.execute(
      `INSERT INTO usuarios (username, password_hash, nombre_completo, correo, id_rol, estado, foto_perfil_url, firma_digital_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, password_hash, nombreCompleto, correoGenerado, id_rol, estado, fotoUrl, firmaUrl]
    );

    await connection.end();

    return NextResponse.json({ success: true, message: "Autoridad y firma guardadas exitosamente" });

  } catch (error) {
    console.error("Error en la API de subida:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}