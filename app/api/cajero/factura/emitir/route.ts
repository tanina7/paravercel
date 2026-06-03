import pool from "@/lib/db";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_tramite, pdfUrl } = body;

    if (!id_tramite || !pdfUrl) {
      return NextResponse.json({ error: "id_tramite y pdfUrl son requeridos" }, { status: 400 });
    }

    const [rows]: any = await pool.query(
      `
      SELECT t.id_solicitud, f.id_factura
      FROM tramites t
      LEFT JOIN facturas f ON f.id_solicitud = t.id_solicitud
      WHERE t.id_tramite = ?
      `,
      [id_tramite]
    );

    const data = rows?.[0];
    if (!data) return NextResponse.json({ error: "Trámite no encontrado" }, { status: 404 });

    // Si no existe registro en facturas, crearlo
    if (!data.id_factura) {
      await pool.query(
        `INSERT INTO facturas (id_solicitud, nombre, nit_ci, numero_factura, codigo_control, monto, documento_factura, fecha_emision)
         VALUES (?, '', '', '', '', 0, ?, NOW())`,
        [data.id_solicitud, pdfUrl]
      );
    } else {
      await pool.query(
        `UPDATE facturas SET documento_factura = ?, fecha_emision = NOW() WHERE id_factura = ?`,
        [pdfUrl, data.id_factura]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error emitir:", err);
    return NextResponse.json({ error: err?.message || "Error emitiendo factura" }, { status: 500 });
  }
}
