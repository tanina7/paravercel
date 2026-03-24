import { NextResponse } from 'next/server';
import pool from '@/lib/db'; 

export async function POST(request: Request) {
    try {
        const { correo, contrasena } = await request.json();

        // IMPORTANTE: Si usas la URL completa en el .env, el pool ya sabe a dónde ir
        const [rows]: any = await pool.query(
            'SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?',
            [correo, contrasena]
        );

        if (rows.length === 0) {
            return NextResponse.json({ message: "Usuario o clave incorrectos" }, { status: 401 });
        }

        const usuario = rows[0];
        return NextResponse.json({
            rol: usuario.rol,
            nombre: usuario.nombre
        });

    } catch (error: any) {
        // Esto imprimirá el error real en tu terminal de VS Code
        console.error("Error de base de datos:", error.message);
        return NextResponse.json({ message: "Error de conexión con Aiven" }, { status: 500 });
    }
}