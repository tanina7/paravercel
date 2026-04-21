import { NextResponse } from 'next/server';
import { getAuthPool } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  let connection;

  try {
    const body = await request.json();
    const { firstName, lastName, idNumber, documentType, email, phone, password } = body;
    
    const cleanFirstName = String(firstName || '').trim();
    const cleanLastName = String(lastName || '').trim();
    const cleanIdNumber = String(idNumber || '').trim();
    const cleanDocumentType = String(documentType || 'CI Boliviano').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();
    
    // Validar campos requeridos
    if (!cleanFirstName || !cleanLastName || !cleanIdNumber || !cleanEmail || !password) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar longitud de nombre
    if (cleanFirstName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'El nombre debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }
    if (cleanFirstName.length > 100) {
      return NextResponse.json(
        { success: false, error: 'El nombre no puede exceder 100 caracteres' },
        { status: 400 }
      );
    }

    // Validar que nombre solo contiene letras y espacios
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/i.test(cleanFirstName)) {
      return NextResponse.json(
        { success: false, error: 'El nombre solo debe contener letras y espacios' },
        { status: 400 }
      );
    }

    // Validar longitud de apellido
    if (cleanLastName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'El apellido debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }
    if (cleanLastName.length > 100) {
      return NextResponse.json(
        { success: false, error: 'El apellido no puede exceder 100 caracteres' },
        { status: 400 }
      );
    }

    // Validar que apellido solo contiene letras y espacios
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/i.test(cleanLastName)) {
      return NextResponse.json(
        { success: false, error: 'El apellido solo debe contener letras y espacios' },
        { status: 400 }
      );
    }

    // Validar cédula
    if (cleanIdNumber.length < 5 || cleanIdNumber.length > 20) {
      return NextResponse.json(
        { success: false, error: 'La cédula debe tener entre 5 y 20 caracteres' },
        { status: 400 }
      );
    }
    if (!/^[0-9\-]+$/.test(cleanIdNumber)) {
      return NextResponse.json(
        { success: false, error: 'La cédula solo puede contener números y guiones' },
        { status: 400 }
      );
    }

    // Validar tipo de documento
    const validDocumentTypes = ['CI Boliviano', 'Pasaporte Extranjero'];
    if (!validDocumentTypes.includes(cleanDocumentType)) {
      return NextResponse.json(
        { success: false, error: 'El tipo de documento no es válido' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'El correo electrónico no es válido' },
        { status: 400 }
      );
    }
    if (cleanEmail.length > 100) {
      return NextResponse.json(
        { success: false, error: 'El correo electrónico es muy largo' },
        { status: 400 }
      );
    }

    // Validar teléfono si se proporciona
    if (cleanPhone) {
      if (cleanPhone.length < 7 || cleanPhone.length > 20) {
        return NextResponse.json(
          { success: false, error: 'El teléfono debe tener entre 7 y 20 caracteres' },
          { status: 400 }
        );
      }
      if (!/^[\d\s\-\(\)+]+$/.test(cleanPhone)) {
        return NextResponse.json(
          { success: false, error: 'El teléfono contiene caracteres inválidos' },
          { status: 400 }
        );
      }
    }

    // Validar contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }
    if (password.length > 50) {
      return NextResponse.json(
        { success: false, error: 'La contraseña no puede exceder 50 caracteres' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);
    const pool = await getAuthPool();
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar que el email no exista en system_users
    const [existingUsers] = await connection.execute(
      'SELECT user_id FROM system_users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if ((existingUsers as any[]).length > 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    const username = cleanEmail.split('@')[0];

    // Insertar nuevo usuario en system_users con role_id por defecto (3 = estudiante típicamente)
    await connection.execute(
      `INSERT INTO system_users 
       (username, email, password_hash, first_name, last_name, role_id, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [username, cleanEmail, hashedPassword, cleanFirstName, cleanLastName, 3, 1]
    );

    await connection.commit();
    connection.release();

    return NextResponse.json(
      {
        success: true,
        message: 'Registro completado exitosamente. Por favor inicia sesión.',
      },
      { status: 201 }
    );

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Error en registro:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar usuario. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
