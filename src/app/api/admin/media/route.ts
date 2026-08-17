import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);
const DIR = path.join(process.cwd(), "public", "uploads");

function currentAdmin(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);
  return verifyToken(token);
}

function classify(name: string): "image" | "video" | null {
  const ext = path.extname(name).toLowerCase();
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  return null;
}

export async function GET(request: Request) {
  const admin = currentAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const names = await readdir(DIR);
    const files = await Promise.all(
      names.map(async (name): Promise<{ name: string; url: string; size: number; type: string; modified: string } | null> => {
        const full = path.join(DIR, name);
        if (!name.startsWith(".")) {
          try {
            const info = await stat(full);
            if (!info.isFile()) return null;
            return {
              name,
              url: `/uploads/${name}`,
              size: info.size,
              type: classify(name) ?? "file",
              modified: info.mtime.toISOString(),
            };
          } catch {
            return null;
          }
        }
        return null;
      })
    );
    const media = files.filter((f): f is NonNullable<typeof f> => f !== null).sort((a, b) => b.modified.localeCompare(a.modified));
    return Response.json({ media });
  } catch {
    return Response.json({ media: [] });
  }
}

export async function DELETE(request: Request) {
  const admin = currentAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url).searchParams.get("url");
  if (!url || !url.startsWith("/uploads/")) {
    return Response.json({ error: "Invalid media url." }, { status: 422 });
  }

  const name = path.basename(url);
  if (!name || name.includes("..")) {
    return Response.json({ error: "Invalid media name." }, { status: 422 });
  }

  try {
    await unlink(path.join(DIR, name));
    return Response.json({ ok: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return Response.json({ ok: true });
    return Response.json({ error: "Failed to delete file." }, { status: 500 });
  }
}