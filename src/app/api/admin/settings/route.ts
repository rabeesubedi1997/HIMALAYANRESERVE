import { getPool } from "@/lib/db";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import {
  isSectionKey,
  sanitizeSectionValue,
  buildSettings,
  type Settings,
} from "@/lib/settings";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

function currentAdmin(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);
  return verifyToken(token);
}

export async function GET(request: Request) {
  const admin = currentAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await buildSettingsFromDb();
  return Response.json({ settings });
}

export async function PUT(request: Request) {
  const admin = currentAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Expected an object of section updates." }, { status: 422 });
  }

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (!isSectionKey(key)) continue;
    const clean = sanitizeSectionValue(value);
    if (clean === undefined) continue;
    updates[key] = clean;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No valid sections provided." }, { status: 422 });
  }

  try {
    const pool = getPool();
    for (const [key, value] of Object.entries(updates)) {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO site_settings (setting_key, settings) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE settings = VALUES(settings)`,
        [key, JSON.stringify(value)]
      );
    }
    const settings = await buildSettingsFromDb();
    return Response.json({ ok: true, settings }, { status: 200 });
  } catch (err) {
    console.error("admin settings PUT failed:", err);
    return Response.json({ error: "Failed to save settings." }, { status: 500 });
  }
}

async function buildSettingsFromDb(): Promise<Settings> {
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT setting_key, settings FROM site_settings`);
    const dbRows: Record<string, unknown> = {};
    for (const row of rows) dbRows[String(row.setting_key)] = row.settings;
    return buildSettings(dbRows);
  } catch (err) {
    console.error("buildSettingsFromDb failed:", err);
    return buildSettings(null);
  }
}