import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as { _pool?: mysql.Pool };

export function getPool(): mysql.Pool {
  if (!globalForDb._pool) {
    globalForDb._pool = mysql.createPool({
      host: process.env.DB_HOST ?? "127.0.0.1",
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME ?? "himalayan_reserve",
      waitForConnections: true,
      connectionLimit: 10,
      charset: "utf8mb4_unicode_ci",
    });
  }
  return globalForDb._pool;
}