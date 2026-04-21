import { NextResponse } from 'next/server';
import pool from '@/lib/db'; 

export async function POST(request: Request) {
    try {
        const { correo, contrasena } = await request.json();

        // CORRECCIÓN 1: Usamos JOIN para traer el nombre del rol desde la tabla 'roles'
        // CORRECCIÓN 2: Usamos 'password_hash' que es el nombre real en tu SQL
        const [rows] = await pool.query(
            `SELECT u.nombre_completo, r.nombre_rol 
             FROM usuarios u
             JOIN roles r ON u.id_rol = r.id_rol
             WHERE u.correo = ? AND u.password_hash = ?`,
            [correo, contrasena]
        );

        if (rows.length === 0) {
            return NextResponse.json({ message: "Usuario o clave incorrectos" }, { status: 401 });
        }

        const usuario = rows[0];

        // Enviamos los datos tal cual los espera tu Frontend
        return NextResponse.json({
            rol: usuario.nombre_rol, // Ejemplo: "Estudiante", "Caja"
            nombre: usuario.nombre_completo
        });

    } catch (error: any) {
        console.error("Error de base de datos:", error.message);
        return NextResponse.json({ 
            message: "Error de conexión", 
            details: error.message 
        }, { status: 500 });
    }
}