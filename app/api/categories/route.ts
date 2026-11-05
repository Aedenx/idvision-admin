import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// 1. GET SEMUA KATEGORI BESERTA JUMLAH PRODUKNYA
export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT c.*, COUNT(p.product_id) as total_products 
      FROM categories c 
      LEFT JOIN products p ON c.category_id = p.category_id 
      GROUP BY c.category_id
      ORDER BY c.category_id DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// 2. POST TAMBAH KATEGORI BARU
export async function POST(request: Request) {
  try {
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
      "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
      [name, slug, description || ""],
    );

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil ditambahkan!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
