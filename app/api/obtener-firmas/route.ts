import { NextResponse } from 'next/server';
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        id_usuario, 
        id_rol, 
        nombre_completo, 
        foto_perfil_url, 
        firma_digital_url 
      FROM usuarios 
      WHERE firma_digital_url IS NOT NULL 
      AND firma_digital_url != ''
    `);

    return NextResponse.json({
      success: true,
      firmas: rows
    });

  } catch (error: any) {
    console.error("ERROR EN API FIRMAS:", error.message);

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}