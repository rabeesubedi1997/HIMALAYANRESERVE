import { allocationSchema } from "@/lib/validation";
import { getPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = allocationSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return Response.json(
      { error: first ? first.message : "Validation failed." },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const ip =
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 255) || null;

  try {
    const pool = getPool();

    const [dupRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM allocations
       WHERE email = ? AND phone = ? AND created_at > (NOW() - INTERVAL 10 MINUTE)
       LIMIT 1`,
      [data.email.toLowerCase(), data.phone]
    );
    if (dupRows.length > 0) {
      return Response.json(
        { error: "This inquiry was already submitted. Our allocation desk will contact you." },
        { status: 409 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO allocations
        (full_name, email, phone, country_city, inquiry_type, message, channel, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.fullName,
        data.email.toLowerCase(),
        data.phone,
        data.countryCity,
        data.inquiryType,
        data.message || null,
        data.channel,
        ip,
        userAgent,
      ]
    );

    return Response.json(
      { ok: true, id: result.insertId },
      { status: 201 }
    );
  } catch (err) {
    console.error("allocations POST failed:", err);
    return Response.json({ error: "Unable to store inquiry. Please try again." }, { status: 500 });
  }
}