const mysql = require('mysql2/promise');

const connection = {
  host: 'mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_5aVYlqYKMy_Nw95j38j',
  database: 'tramites_univalle',
  port: 21039,
};

async function fixComprobantesTable() {
  let conn;
  try {
    conn = await mysql.createConnection(connection);
    
    console.log('Modificando tabla comprobantes...');
    
    // Agregar columna id_solicitud si no existe
    try {
      await conn.execute(
        `ALTER TABLE comprobantes ADD COLUMN id_solicitud INT DEFAULT NULL AFTER id_comprobante`
      );
      console.log('✅ Columna id_solicitud agregada');
    } catch (error) {
      if (error.message.includes('Duplicate column')) {
        console.log('ℹ️  Columna id_solicitud ya existe');
      } else {
        throw error;
      }
    }
    
    // Agregar foreign key para id_solicitud si no existe
    try {
      await conn.execute(
        `ALTER TABLE comprobantes ADD CONSTRAINT fk_comprobantes_solicitud 
         FOREIGN KEY (id_solicitud) REFERENCES solicitudes_tramite(id_solicitud) ON DELETE CASCADE`
      );
      console.log('✅ Foreign key para id_solicitud agregada');
    } catch (error) {
      if (error.message.includes('Duplicate key')) {
        console.log('ℹ️  Foreign key ya existe');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Tabla comprobantes modificada exitosamente');
    
    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixComprobantesTable();
