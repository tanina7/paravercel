import mysql from 'mysql2/promise';

let pool;

export const createConnection = async () => {
  if (!pool) {
    pool = await mysql.createPool({
      host: "mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com",
      port: 11597,
      user: "avnadmin",
      password: "AVNS_iKeVgvVdaPJAQcw2XtV",
      database: "tramites_univalle",
      ssl: {
        rejectUnauthorized: false
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

export const getPool = async () => {
  if (!pool) {
    await createConnection();
  }
  return pool;
}

let authPool;

export const createAuthConnection = async () => {
  if (!authPool) {
    authPool = await mysql.createPool({
      host: "mysql-1470c02-tramites-uv-a.l.aivencloud.com",
      port: 18679,
      user: "avnadmin",
      password: "AVNS_sfDsSFCChtqAU6NMNJ1",
      database: "legalization",
      ssl: {
        rejectUnauthorized: false
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return authPool;
}

export const getAuthPool = async () => {
  if (!authPool) {
    await createAuthConnection();
  }
  return authPool;
}

export async function query(sql, params = []) {
  const p = await getPool();
  return await p.execute(sql, params);
}

export default { getPool, getAuthPool, query, createConnection, createAuthConnection };