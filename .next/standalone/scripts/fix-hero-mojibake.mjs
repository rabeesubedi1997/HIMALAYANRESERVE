import mysql from "mysql2/promise";

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "himalayan_reserve",
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  charset: "utf8mb4",
});

const hero = {
  eyebrow: "Ancestral Single-Estate Kaskikot — Himalayan Range · 1,700m",
};

await pool.execute(
  `INSERT INTO site_settings (setting_key, settings) VALUES ('hero', ?)
   ON DUPLICATE KEY UPDATE settings = VALUES(settings)`,
  [JSON.stringify(hero)]
);

const [rows] = await pool.query(`SELECT setting_key, JSON_EXTRACT(settings, '$.eyebrow') AS eyebrow FROM site_settings`);
for (const r of rows) {
  console.log(`${r.setting_key}: ${r.eyebrow ?? "(none)"}`);
}

await pool.end();