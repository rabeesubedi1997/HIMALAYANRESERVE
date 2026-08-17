import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);
const MAX_BYTES = 30 * 1024 * 1024;

function currentAdmin(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);
  return verifyToken(token);
}

export async function POST(request: Request) {
  const admin = currentAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file." }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File exceeds 30MB limit." }, { status: 413 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!IMAGE_EXT.has(ext) && !VIDEO_EXT.has(ext)) {
    return Response.json({ error: "Unsupported file type." }, { status: 422 });
  }

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, safeName), buffer);

  return Response.json({ ok: true, url: `/uploads/${safeName}`, ext }, { status: 201 });
}