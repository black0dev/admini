import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getProductImages(productName: string): { url: string; order: number; lifestyle: boolean }[] {
  const publicDir = path.resolve(process.cwd(), "public");
  const folderPath = path.join(publicDir, "imagenes", productName);
  
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  try {
    const files = fs.readdirSync(folderPath);
    return files
      .filter((file) => /\.(jpg|jpeg|png|webp|svg)$/i.test(file))
      .map((file, idx) => {
        const isLifestyle = file.startsWith("2T4A") || file.toLowerCase().includes("lifestyle");
        const relativePath = `imagenes/${productName}/${file}`;
        return {
          url: `/api/media/${relativePath.split("/").map(encodeURIComponent).join("/")}`,
          order: idx + 1,
          lifestyle: isLifestyle,
        };
      });
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    // 1. Obtener productos publicados desde la tabla 'variants' en Supabase DB
    const { data: variants, error: vErr } = await supabase
      .from("variants")
      .select("*")
      .eq("is_published", true)
      .order("id", { ascending: true });

    if (vErr) {
      throw vErr;
    }

    // 2. Obtener portada publicada desde la tabla 'hero_slides' en Supabase DB
    const { data: slides } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    const products = (variants || []).map((variant) => {
      const images = getProductImages(variant.product_name);
      const coverImage = images.find((img) => !img.lifestyle) ?? images[0] ?? null;

      return {
        slug: slugify(variant.product_name),
        name: variant.product_name,
        category: variant.category,
        price: Number(variant.price),
        sku: variant.sku,
        cover: coverImage?.url ?? null,
        images: images,
      };
    });

    const hero = (slides || []).map((slide) => ({
      url: slide.media_url,
      order: slide.order_index,
      title: slide.title,
      subtitle: slide.subtitle,
    }));

    return NextResponse.json({
      source: "Supabase DB (table: variants)",
      generatedAt: new Date().toISOString(),
      total: products.length,
      hero,
      products,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "catalog_unavailable", message: String(error) },
      { status: 500 }
    );
  }
}
