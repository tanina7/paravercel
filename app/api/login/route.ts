import { NextResponse } from 'next/server';
import pool from '@/lib/db'; 

export async function POST(request: Request) {
  try {
    const { correo, contrasena } = await request.json();

    const [rows]: any = await pool.query(
      `SELECT 
          u.id_usuario,
          u.nombre_completo, 
          r.nombre_rol,
          es.id_estudiante
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       LEFT JOIN estudiantes es ON u.id_usuario = es.id_usuario
       WHERE u.correo = ? AND u.password_hash = ?`,
      [correo, contrasena]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Usuario o clave incorrectos" },
        { status: 401 }
      );
    }

    const usuario = rows[0];

    return NextResponse.json({
      rol: usuario.nombre_rol,
      nombre: usuario.nombre_completo,
      id_usuario: usuario.id_usuario,
      id_estudiante: usuario.id_estudiante
    });

  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json(
      { message: "Error de conexión" },
      { status: 500 }
    );
  }
}