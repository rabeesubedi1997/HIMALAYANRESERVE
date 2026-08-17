import { z } from "zod";
import { getPool } from "@/lib/db";
import { verifyPassword, signToken, ADMIN_COOKIE } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid credentials." }, { status: 422 });
  }

  const { username, password } = parsed.data;

  try {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, username, password_hash, role FROM users WHERE username = ? LIMIT 1`,
      [username]
    );
    const user = rows[0];
    if (!user) {
      await verifyPassword(password, "$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid");
      return Response.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const ok = await verifyPassword(password, String(user.password_hash));
    if (!ok) {
      return Response.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const token = signToken({ sub: Number(user.id), username: String(user.username), role: String(user.role) });

    return Response.json(
      { ok: true, username: user.username, role: user.role },
      {
        status: 200,
        headers: {
          "Set-Cookie": `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
        },
      }
    );
  } catch (err) {
    console.error("admin login failed:", err);
    return Response.json({ error: "Login temporarily unavailable." }, { status: 500 });
  }
}