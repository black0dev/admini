import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Guardar en public/imagenes/portadas
    const uploadDir = path.resolve(process.cwd(), "public", "imagenes", "portadas");
    await mkdir(uploadDir, { recursive: true });

    // Sanitizar nombre del archivo
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);

    await writeFile(filePath, buffer);

    const mediaUrl = `/api/media/imagenes/portadas/${encodeURIComponent(safeName)}`;

    return NextResponse.json({
      success: true,
      url: mediaUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al subir el archivo", message: String(error) },
      { status: 500 }
    );
  }
}
