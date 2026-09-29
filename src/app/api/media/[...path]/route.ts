import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const MEDIA_ROOT = path.resolve(process.cwd(), "public");

const PASSTHROUGH: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const decodedSegments = segments.map((seg) => decodeURIComponent(seg));
  const target = path.resolve(MEDIA_ROOT, ...decodedSegments);
  const relative = path.relative(MEDIA_ROOT, target);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let info;
  try {
    info = await stat(target);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = path.extname(target).toLowerCase();
  const search = new URL(request.url).searchParams;
  const width = clamp(Number(search.get("w")) || 1080, 16, 3200);
  const quality = clamp(Number(search.get("q")) || 75, 20, 90);

  let file: Buffer;
  try {
    file = await readFile(target);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  if (PASSTHROUGH[extension]) {
    const body = new Uint8Array(file);
    return new NextResponse(body, {
      headers: { "Content-Type": PASSTHROUGH[extension], ...CACHE_HEADERS },
    });
  }

  try {
    const optimized = await sharp(file)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    const body = new Uint8Array(optimized);
    return new NextResponse(body, {
      headers: { "Content-Type": "image/webp", ...CACHE_HEADERS },
    });
  } catch {
    const body = new Uint8Array(file);
    const contentType =
      extension === ".png"
        ? "image/png"
        : extension === ".jpg" || extension === ".jpeg"
        ? "image/jpeg"
        : "application/octet-stream";

    return new NextResponse(body, {
      headers: { "Content-Type": contentType, ...CACHE_HEADERS },
    });
  }
}
