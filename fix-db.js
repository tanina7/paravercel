const mysql = require('mysql2/promise');

async function alterTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com",
      port: 11597,
      user: "avnadmin",
      password: "AVNS_iKeVgvVdaPJAQcw2XtV",
      database: "tramites_univalle",
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Conectado a la base de datos...');

    // Modificar la tabla para permitir id_estudiante NULL
    await connection.execute(
      'ALTER TABLE `solicitudes_tramite` MODIFY COLUMN `id_estudiante` INT NULL'
    );

    console.log('✓ Tabla modificada correctamente: id_estudiante ahora permite NULL');

    // Actualizar la constraint si es necesario
    try {
      await connection.execute(
        'ALTER TABLE `solicitudes_tramite` DROP FOREIGN KEY `solicitudes_tramite_ibfk_1`'
      );
      console.log('✓ Constraint anterior eliminada');

      await connection.execute(
        'ALTER TABLE `solicitudes_tramite` ADD CONSTRAINT `solicitudes_tramite_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE SET NULL'
      );
      console.log('✓ Nueva constraint creada con ON DELETE SET NULL');
    } catch (err) {
      console.log('Nota: Constraint ya estaba actualizada o no existe');
    }

    await connection.end();
    console.log('✓ Listo! Ahora puedes usar la aplicación.');
  } catch (error) {
    console.error('Error:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

alterTable();
