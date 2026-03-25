// Usamos require para que sea compatible con la ejecución directa de Node
const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL + "?ssl-mode=REQUIRED");

  try {
    console.log("Conectado a Aiven. Creando tabla de usuarios...");
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        ci VARCHAR(20) NOT NULL UNIQUE,
        correo VARCHAR(100) NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL, 
        rol ENUM('estudiante', 'operador', 'caja', 'biblioteca', 'autoridad', 'admin') NOT NULL,
        estado ENUM('activo', 'inactivo') DEFAULT 'activo'
      )
    `);

    console.log("Insertando usuario de prueba...");
    
    // Cambia los datos si quieres, pero anótalos para el login
    await connection.execute(`
      INSERT INTO usuarios (nombre, ci, correo, contrasena, rol) 
      VALUES ('Hiber Leandro', '1234567', 'leandro@univalle.edu', '123456', 'biblioteca')
      ON DUPLICATE KEY UPDATE nombre=nombre
    `);

    console.log("✅ ¡Proceso completado con éxito!");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await connection.end();
  }
}

seed();