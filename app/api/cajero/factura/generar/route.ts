import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_tramite, nombre: nombreUsuario } = body;

    if (!id_tramite) {
      return NextResponse.json({ error: "id_tramite requerido" }, { status: 400 });
    }

    const [rows]: any = await pool.query(
      `
      SELECT
        t.id_tramite,
        t.id_solicitud,
        u.nombre_completo,
        u.correo,
        u.ci AS ci_usuario,
        f.nombre AS nombre_factura,
        f.nit_ci AS nit_ci_factura,
        tt.nombre_tramite,
        tt.costo
      FROM tramites t
      INNER JOIN solicitudes_tramite s ON s.id_solicitud = t.id_solicitud
      INNER JOIN usuarios u ON u.id_usuario = s.id_estudiante
      INNER JOIN tipos_tramite tt ON tt.id_tipo = t.id_tipo
      LEFT JOIN facturas f ON f.id_solicitud = t.id_solicitud
      WHERE t.id_tramite = ?
      `,
      [id_tramite]
    );

    const data = rows?.[0];
    if (!data) return NextResponse.json({ error: "Sin datos" }, { status: 404 });

    const nombre = data.nombre_factura || nombreUsuario || data.nombre_completo || "SIN NOMBRE";
    const nitCi = data.nit_ci_factura || data.ci_usuario || "0";
    const tramite = data.nombre_tramite || "TRAMITE";
    const costo = Number(data.costo ?? 0);

    // FACTURA NUM
    const [last]: any = await pool.query(`SELECT MAX(numero_factura) AS maxNum FROM facturas`);
    const numeroFactura = (last?.[0]?.maxNum ?? 0) + 1;

    const codigoControl = `CTRL-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 99)}`;

    // ==========================================
    // 🎨 DIBUJO DEL PDF - DISEÑO PREMIUM UNIVALLE
    // ==========================================
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // Formato A4

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { height } = page.getSize();

    // Paleta de colores (Guindo Univalle: #8B1A1A)
    const primaryColor = rgb(0.545, 0.102, 0.102); 
    const darkText = rgb(0.15, 0.15, 0.15);
    const grayText = rgb(0.4, 0.4, 0.4);
    const lightBg = rgb(0.97, 0.97, 0.97);
    const borderColor = rgb(0.85, 0.85, 0.85);

    // --- ENCABEZADO (Izquierda) ---
    page.drawText("UNIVERSIDAD PRIVADA DEL VALLE", { x: 50, y: height - 60, size: 16, font: bold, color: primaryColor });
    page.drawText("Departamento de Admisiones y Caja", { x: 50, y: height - 78, size: 10, font, color: grayText });
    page.drawText("Cochabamba - Bolivia", { x: 50, y: height - 92, size: 9, font, color: grayText });

    // --- ENCABEZADO (Derecha - Info Factura) ---
    // 1. Caja más ancha para números gigantes
    page.drawRectangle({ x: 340, y: height - 95, width: 205, height: 50, borderColor: primaryColor, borderWidth: 1.5, color: rgb(1,1,1) });
    page.drawText("FACTURA", { x: 405, y: height - 65, size: 14, font: bold, color: primaryColor });
    
    // 2. Formatear el número y ajustar el tamaño de letra si es muy largo
    const numFormateado = String(numeroFactura).padStart(6, '0');
    const tamanoLetra = numFormateado.length > 8 ? 9 : 12; // Letra más pequeña si pasa de 8 dígitos
    
    page.drawText(`N° ${numFormateado}`, { x: 350, y: height - 85, size: tamanoLetra, font: bold, color: darkText });

    // --- SECCIÓN: DATOS DEL CLIENTE ---
    const clientY = height - 180;
    // Fondo gris claro
    page.drawRectangle({ x: 50, y: clientY, width: 495, height: 60, color: lightBg, borderColor: borderColor, borderWidth: 1 });
    // Línea de acento color guindo a la izquierda
    page.drawRectangle({ x: 50, y: clientY, width: 5, height: 60, color: primaryColor });

    page.drawText("DATOS DEL CLIENTE", { x: 65, y: clientY + 45, size: 8, font: bold, color: primaryColor });
    page.drawText(`Señor(es): ${nombre.toUpperCase()}`, { x: 65, y: clientY + 25, size: 11, font: bold, color: darkText });
    page.drawText(`NIT / CI: ${nitCi}`, { x: 65, y: clientY + 10, size: 10, font: bold, color: darkText });
    page.drawText(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, { x: 420, y: clientY + 25, size: 10, font, color: darkText });

    // --- TABLA DE DETALLES ---
    const tableY = clientY - 45;
    
    // Cabecera de tabla (Fondo guindo, letras blancas)
    page.drawRectangle({ x: 50, y: tableY, width: 495, height: 25, color: primaryColor });
    page.drawText("CANT.", { x: 65, y: tableY + 8, size: 9, font: bold, color: rgb(1,1,1) });
    page.drawText("DESCRIPCIÓN DEL SERVICIO", { x: 130, y: tableY + 8, size: 9, font: bold, color: rgb(1,1,1) });
    page.drawText("P. UNIT.", { x: 410, y: tableY + 8, size: 9, font: bold, color: rgb(1,1,1) });
    page.drawText("SUBTOTAL", { x: 485, y: tableY + 8, size: 9, font: bold, color: rgb(1,1,1) });

    // Fila de contenido
    const contentY = tableY - 25;
    page.drawText("1", { x: 75, y: contentY, size: 10, font, color: darkText });
    page.drawText(tramite, { x: 130, y: contentY, size: 10, font, color: darkText });
    page.drawText(costo.toFixed(2), { x: 410, y: contentY, size: 10, font, color: darkText });
    page.drawText(costo.toFixed(2), { x: 485, y: contentY, size: 10, font, color: darkText });

    // Línea separadora sutil
    page.drawLine({ start: { x: 50, y: contentY - 15 }, end: { x: 545, y: contentY - 15 }, thickness: 1, color: borderColor });

    // --- SECCIÓN: TOTALES Y CONTROL ---
    const totalY = contentY - 55;
    
    // Info Izquierda (Código de control)
    page.drawText(`Código de Control: ${codigoControl}`, { x: 50, y: totalY + 15, size: 10, font: bold, color: darkText });
    page.drawText(`Solicitud #${data.id_solicitud} | Trámite #${id_tramite}`, { x: 50, y: totalY, size: 9, font, color: grayText });

    // Caja de Total (Derecha)
    page.drawRectangle({ x: 380, y: totalY, width: 165, height: 30, color: lightBg, borderColor: primaryColor, borderWidth: 1 });
    page.drawText("TOTAL Bs.", { x: 395, y: totalY + 10, size: 11, font: bold, color: darkText });
    page.drawText(costo.toFixed(2), { x: 485, y: totalY + 10, size: 12, font: bold, color: primaryColor });

    // --- PIE DE PÁGINA (Textos Legales) ---
    page.drawText(`"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS. EL USO ILÍCITO DE ÉSTA SERÁ SANCIONADO DE ACUERDO A LEY"`, 
      { x: 50, y: 70, size: 7, font: bold, color: darkText });
    page.drawText("Ley N° 453: Los servicios deben suministrarse en condiciones de inocuidad, calidad y seguridad.", 
      { x: 120, y: 55, size: 7, font, color: grayText });

    // ==========================================
    // GUARDADO DEL ARCHIVO
    // ==========================================
    const pdfBytes = await pdfDoc.save();

    const folder = path.join(process.cwd(), "public/uploads/facturas");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const fileName = `factura-${id_tramite}-${Date.now()}.pdf`;
    fs.writeFileSync(path.join(folder, fileName), Buffer.from(pdfBytes));

    const pdfUrl = `/uploads/facturas/${fileName}`;

    // UPSERT FACTURA DB
    await pool.query(
      `
      INSERT INTO facturas (
        id_solicitud,
        nombre,
        nit_ci,
        numero_factura,
        codigo_control,
        monto,
        documento_factura,
        fecha_emision
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        nombre=VALUES(nombre),
        nit_ci=VALUES(nit_ci),
        numero_factura=VALUES(numero_factura),
        codigo_control=VALUES(codigo_control),
        monto=VALUES(monto),
        documento_factura=VALUES(documento_factura)
      `,
      [
        data.id_solicitud,
        nombre,
        nitCi,
        numeroFactura,
        codigoControl,
        costo,
        pdfUrl,
      ]
    );

    return NextResponse.json({ success: true, pdfUrl });

  } catch (err: any) {
    console.error("Error al generar:", err);
    return NextResponse.json({ error: "Error generando factura" }, { status: 500 });
  }
}