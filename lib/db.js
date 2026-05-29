// =================================================================
// MySQL connection pool — shared across all Next.js API routes.
// Reads from process.env (set in Hostinger Environment variables).
// =================================================================

import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    const {
      DB_HOST = '127.0.0.1',
      DB_PORT = '3306',
      DB_NAME,
      DB_USER,
      DB_PASSWORD,
    } = process.env;

    if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
      throw new Error(
        'DB env vars missing: DB_NAME, DB_USER, DB_PASSWORD must all be set.'
      );
    }

    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,        // shared hosting: keep low
      maxIdle: 5,
      idleTimeout: 60_000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10_000,
      charset: 'utf8mb4',
      timezone: 'Z',
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}
