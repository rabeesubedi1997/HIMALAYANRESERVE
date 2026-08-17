// Creates the default admin user + seeds site_settings rows (via upsert).
// Usage: node db/seed-admin.mjs [username] [password]
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const username = process.argv[2] || "admin";
const password = process.argv[3] || "admin123";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "himalayan_reserve",
});

const hash = await bcrypt.hash(password, 10);
await pool.execute(
  `INSERT INTO users (username, password_hash, role)
   VALUES (?, ?, 'admin')
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
  [username, hash]
);
console.log(`Admin user ready: "${username}" (password set).`);

const sections = ["seo", "hero", "stats", "ancestral", "civet", "craft", "packaging", "dubai", "press", "nav", "footer", "media"];
for (const key of sections) {
  await pool.execute(
    `INSERT INTO site_settings (setting_key, settings) VALUES (?, JSON_OBJECT('_init', 1))
     ON DUPLICATE KEY UPDATE setting_key = setting_key`,
    [key]
  );
}
console.log(`Settings rows ready: ${sections.length} sections.`);
await pool.end();