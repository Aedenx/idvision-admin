import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// 1. PUT / UPDATE KATEGORI
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi!" },
        { status: 400 },
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    await db.query(
      "UPDATE categories SET name = ?, slug = ?, description = ? WHERE category_id = ?",
      [name, slug, description || "", id],
    );

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diperbarui!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// 2. DELETE KATEGORI
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Cek apakah ada produk yang masih memakai kategori ini
    const [products]: any = await db.query(
      "SELECT COUNT(*) as count FROM products WHERE category_id = ?",
      [id],
    );

    if (products[0]?.count > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Kategori tidak bisa dihapus karena masih digunakan oleh ${products[0].count} produk!`,
        },
        { status: 400 },
      );
    }

    await db.query("DELETE FROM categories WHERE category_id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
