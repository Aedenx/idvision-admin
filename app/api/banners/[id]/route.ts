import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// 1. PUT / UPDATE BANNER ATAU TOGGLE STATUS
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const ctaLabel = formData.get("cta_label") as string;
    const ctaLink = formData.get("cta_link") as string;
    const sortOrder = parseInt(formData.get("sort_order") as string) || 0;
    const isActive =
      formData.get("is_active") !== null
        ? parseInt(formData.get("is_active") as string)
        : 1;
    const file = formData.get("image") as File | null;

    // Jika ada file gambar baru yang diunggah
    let imageQueryPart = "";
    let queryParams: any = [
      title,
      subtitle,
      ctaLabel,
      ctaLink,
      sortOrder,
      isActive,
    ];

    if (file && typeof file === "object" && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads/banners");
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || ".png";
      const fileName = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 6)}${ext}`;
      await writeFile(path.join(uploadDir, fileName), buffer);

      imageQueryPart = ", image = ?";
      queryParams.push(fileName);
    }

    queryParams.push(id);

    await db.query(
      `UPDATE banners SET title = ?, subtitle = ?, cta_label = ?, cta_link = ?, sort_order = ?, is_active = ?${imageQueryPart} WHERE id = ?`,
      queryParams,
    );

    return NextResponse.json({
      success: true,
      message: "Banner berhasil diperbarui!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// 2. DELETE BANNER
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db.query("DELETE FROM banners WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Banner berhasil dihapus!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
