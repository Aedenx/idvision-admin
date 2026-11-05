import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// 1. GET SEMUA BANNER
export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT * FROM banners ORDER BY sort_order ASC, id DESC
    `);

    // Format URL gambar jika disimpan di local folder
    const formattedBanners = rows.map((b: any) => ({
      ...b,
      image:
        b.image && !b.image.startsWith("http")
          ? `/uploads/banners/${b.image}`
          : b.image,
    }));

    return NextResponse.json({ success: true, data: formattedBanners });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// 2. POST TAMBAH BANNER BARU
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const ctaLabel = formData.get("cta_label") as string;
    const ctaLink = formData.get("cta_link") as string;
    const sortOrder = parseInt(formData.get("sort_order") as string) || 0;
    const file = formData.get("image") as File | null;

    if (!title || !file) {
      return NextResponse.json(
        { success: false, message: "Judul dan gambar banner wajib diisi!" },
        { status: 400 },
      );
    }

    // Upload file gambar ke public/uploads/banners
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public/uploads/banners");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".png";
    const fileName = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 6)}${ext}`;
    await writeFile(path.join(uploadDir, fileName), buffer);

    await db.query(
      `INSERT INTO banners (title, subtitle, image, cta_label, cta_link, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        title,
        subtitle || "",
        fileName,
        ctaLabel || "",
        ctaLink || "",
        sortOrder,
      ],
    );

    return NextResponse.json({
      success: true,
      message: "Banner berhasil ditambahkan!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
