/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const envFile = path.join(__dirname, ".env");
let loaded = false;
if (fs.existsSync(envFile)) {
  for (const raw of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
  loaded = true;
}

console.error(
  `[app] started from ${__dirname}; ${loaded ? "env" : "NO .env (process env only)"} -> DB_USER=${process.env.DB_USER ?? "MISSING"} DB_NAME=${process.env.DB_NAME ?? "MISSING"}`
);

process.env.HOSTNAME = "127.0.0.1";
require("./.next/standalone/server.js");
