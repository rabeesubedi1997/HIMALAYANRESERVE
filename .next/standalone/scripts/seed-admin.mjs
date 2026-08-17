import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "himalayan_reserve",
  ADMIN_USERNAME = "admin",
  ADMIN_PASSWORD = "admin123",
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

await pool.execute(
  `INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
  [ADMIN_USERNAME, hash]
);

await pool.end();

console.log(`Admin user "${ADMIN_USERNAME}" ready.`);
console.log("Set ADMIN_USERNAME / ADMIN_PASSWORD env vars to override.");