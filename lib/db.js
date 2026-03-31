import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: "mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com",
  port: 11597,
  user: "avnadmin",
  password: "AVNS_iKeVgvVdaPJAQcw2XtV",
  database: "tramites_univalle",
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;