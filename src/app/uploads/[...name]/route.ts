import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { UPLOADS_DIR } from "@/lib/uploads";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export async function GET(_req: Request, { params }: { params: Promise<{ name: string[] }> }) {
  const { name } = await params;
  const rel = name.join("/");
  if (!/^[\w\-. ]+(\/[\w\-. ]+)*$/.test(rel)) {
    return new NextResponse("Bad Request", { status: 400 });
  }
  const filePath = path.join(UPLOADS_DIR, rel);
  if (!filePath.startsWith(UPLOADS_DIR)) {
    return new NextResponse("Bad Request", { status: 400 });
  }
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
