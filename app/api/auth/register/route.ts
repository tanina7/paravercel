import { NextResponse } from 'next/server';
import { getPool, getAuthPool } from '@/lib/db';
import { hash } from 'bcryptjs';

const STUDENT_ROLE_ID = 13;
const Estudiante_ROLE_ID = 1;

export async function POST(request: Request) {
  let connTramites;
  let connLegalization;

  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      password,
      idNumber
    } = body;

    const cleanFirstName = String(firstName || '').trim();
    const cleanLastName = String(lastName || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanIdNumber = String(idNumber || '').trim();

    if (
      !cleanFirstName ||
      !cleanLastName ||
      !cleanEmail ||
      !password ||
      !cleanIdNumber
    ) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);
    const username = cleanEmail.split('@')[0];

    // Conexiones a ambas bases de datos
    const tramitesPool = await getPool();
    const legalizationPool = await getAuthPool();

    connTramites = await tramitesPool.getConnection();
    connLegalization = await legalizationPool.getConnection();

    await connTramites.beginTransaction();
    await connLegalization.beginTransaction();

    // =========================
    // DB TRAMITES → usuarios
    // =========================
    await connTramites.execute(
      `INSERT INTO usuarios
      (username, correo, nombre_completo, password_hash, id_rol, ci)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        username,
        cleanEmail,
        `${cleanFirstName} ${cleanLastName}`,
        hashedPassword,
        Estudiante_ROLE_ID,
        cleanIdNumber
      ]
    );

    // =========================
    // DB LEGALIZATION → system_users
    // =========================
    await connLegalization.execute(
      `INSERT INTO system_users
      (username, email, password_hash, first_name, last_name, role_id, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        username,
        cleanEmail,
        hashedPassword,
        cleanFirstName,
        cleanLastName,
        STUDENT_ROLE_ID,
        1
      ]
    );

    await connTramites.commit();
    await connLegalization.commit();

    connTramites.release();
    connLegalization.release();

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario registrado correctamente en ambas bases'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error register:', error);

    if (connTramites) await connTramites.rollback();
    if (connLegalization) await connLegalization.rollback();

    if (connTramites) connTramites.release();
    if (connLegalization) connLegalization.release();

    return NextResponse.json(
      { success: false, error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}