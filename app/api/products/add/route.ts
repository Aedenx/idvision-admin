import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const skuBase = formData.get("sku_base") as string;
    const categoryId = formData.get("category_id") as string;
    const genderTarget = (formData.get("gender_target") as string) || "unisex";
    const description = formData.get("description") as string;

    const basePrice = parseFloat(formData.get("base_price") as string) || 0;
    const discountPercent =
      parseInt(formData.get("discount_percent") as string) || 0;
    const isFeatured = formData.get("is_featured") === "true" ? 1 : 0;

    const colorName = (formData.get("color_name") as string) || "Standard";
    const initialStock = parseInt(formData.get("initial_stock") as string) || 0;

    const file = formData.get("product_image") as File | null;

    if (!name || !skuBase || !basePrice) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama produk, SKU, dan harga dasar wajib diisi!",
        },
        { status: 400 },
      );
    }

    // Hitung Harga Diskon/Promo jika ada diskon
    let discountPrice = null;
    if (discountPercent > 0) {
      discountPrice = basePrice - basePrice * (discountPercent / 100);
    }

    // Generate slug dari nama
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // 1. Insert ke tabel products
    const [productResult]: any = await db.query(
      `INSERT INTO products 
        (name, slug, sku_base, description, category_id, gender_target, base_price, discount_percent, discount_price, is_active, is_featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        name,
        slug,
        skuBase,
        description,
        categoryId ? parseInt(categoryId) : null,
        genderTarget,
        basePrice,
        discountPercent,
        discountPrice,
        isFeatured,
      ],
    );

    const productId = productResult.insertId;

    // 2. Insert ke tabel product_variants (Varian stok awal)
    const skuVariant = `${skuBase}-VAR1`;
    await db.query(
      `INSERT INTO product_variants (product_id, sku_variant, color_name, price, stock_quantity, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        productId,
        skuVariant,
        colorName,
        discountPrice || basePrice,
        initialStock,
      ],
    );

    // 3. Proses Upload Gambar ke public/uploads/products jika ada file
    if (file && typeof file === "object" && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/uploads/products");
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || ".webp";
      const fileName = `idv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      // Simpan record ke product_images (is_primary = 1)
      await db.query(
        `INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, 1)`,
        [productId, fileName],
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produk baru dan promo berhasil ditambahkan!",
      product_id: productId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Gagal menambah produk: " + error.message },
      { status: 500 },
    );
  }
}
