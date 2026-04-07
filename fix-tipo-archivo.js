const mysql = require('mysql2/promise');

const connection = {
  host: 'mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_5aVYlqYKMy_Nw95j38j',
  database: 'tramites_univalle',
  port: 21039,
};

async function fixTipoArchivo() {
  let conn;
  try {
    conn = await mysql.createConnection(connection);
    
    console.log('Modificando columna tipo_archivo...');
    
    // Aumentar el tamaño del campo tipo_archivo de varchar(50) a varchar(255)
    await conn.execute(
      `ALTER TABLE archivos_tramite MODIFY COLUMN tipo_archivo varchar(255) DEFAULT NULL`
    );
    
    console.log('✅ Columna tipo_archivo modificada exitosamente a varchar(255)');
    
    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixTipoArchivo();
