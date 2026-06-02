import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { costo } = body;

    if (!costo || costo <= 0) {
      return NextResponse.json(
        { error: "Costo inválido" },
        { status: 400 }
      );
    }

    await pool.query(
      `
      UPDATE tipos_tramite
      SET costo = ?
      WHERE id_tipo = ?
      `,
      [costo, id]
    );

    return NextResponse.json({
      success: true,
      message: "Precio actualizado correctamente",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}