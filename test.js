require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function test() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL + "&ssl-mode=REQUIRED");
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log("✅ ¡CONEXIÓN EXITOSA! El resultado es:", rows[0].result);
    process.exit();
  } catch (err) {
    console.error("❌ ERROR REAL:", err.message);
    process.exit(1);
  }
}
test();