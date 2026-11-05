import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// 1. GET DETAIL PRODUK (Untuk Preview & Edit)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [productRows]: any = await db.query(
      "SELECT * FROM products WHERE product_id = ? LIMIT 1",
      [id],
    );

    if (!productRows || productRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    const product = productRows[0];

    // Ambil gambar utama
    const [imgRows]: any = await db.query(
      "SELECT image_path FROM product_images WHERE product_id = ? AND is_primary = 1 LIMIT 1",
      [id],
    );
    const imagePath = imgRows.length > 0 ? imgRows[0].image_path : "";

    // Ambil varian stok
    const [varRows]: any = await db.query(
      "SELECT * FROM product_variants WHERE product_id = ? LIMIT 1",
      [id],
    );
    const variant =
      varRows.length > 0
        ? varRows[0]
        : { color_name: "Standard", stock_quantity: 0 };

    let finalImageUrl = "";
    if (imagePath) {
      finalImageUrl = imagePath.startsWith("http")
        ? imagePath
        : `/uploads/products/${imagePath}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        image_url: finalImageUrl,
        color_name: variant.color_name,
        stock_quantity: variant.stock_quantity,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// 2. PUT / UPDATE PRODUK (DIOPTIMALKAN AGAR BISA DI-EDIT BERKALI-KALI)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const skuBase = formData.get("sku_base") as string;
    const rawCategory = formData.get("category_id") as string;
    const categoryId =
      rawCategory && rawCategory !== "" ? parseInt(rawCategory) : null;

    const genderTarget = (formData.get("gender_target") as string) || "unisex";
    const description = formData.get("description") as string;
    const basePrice = parseFloat(formData.get("base_price") as string) || 0;
    const discountPercent =
      parseInt(formData.get("discount_percent") as string) || 0;
    const isFeatured = formData.get("is_featured") === "true" ? 1 : 0;
    const stockQuantity =
      parseInt(formData.get("stock_quantity") as string) || 0;
    const file = formData.get("product_image") as File | null;

    let discountPrice =
      discountPercent > 0
        ? basePrice - basePrice * (discountPercent / 100)
        : null;

    // A. Update tabel products utama
    await db.query(
      `UPDATE products SET name = ?, sku_base = ?, description = ?, category_id = ?, gender_target = ?, base_price = ?, discount_percent = ?, discount_price = ?, is_featured = ? WHERE product_id = ?`,
      [
        name,
        skuBase,
        description,
        categoryId,
        genderTarget,
        basePrice,
        discountPercent,
        discountPrice,
        isFeatured,
        id,
      ],
    );

    // B. Cek varian di tabel product_variants secara aman
    const [existingVariant]: any = await db.query(
      "SELECT variant_id FROM product_variants WHERE product_id = ? LIMIT 1",
      [id],
    );

    if (existingVariant.length > 0) {
      // Jika varian sudah ada, update stok dan harganya tanpa mengubah SKU dasar yang sudah unik
      await db.query(
        `UPDATE product_variants SET stock_quantity = ?, price = ? WHERE product_id = ?`,
        [stockQuantity, discountPrice || basePrice, id],
      );
    } else {
      // Jika belum ada, buatkan baru dengan SKU unik berbasis timestamp/rand agar tidak duplikat
      const skuVariant = `${skuBase}-${Date.now().toString().slice(-4)}`;
      await db.query(
        `INSERT INTO product_variants (product_id, sku_variant, color_name, price, stock_quantity, is_active) VALUES (?, ?, 'Standard', ?, ?, 1)`,
        [id, skuVariant, discountPrice || basePrice, stockQuantity],
      );
    }

    // C. Proses Upload Gambar Baru (Jika ada)
    if (file && typeof file === "object" && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads/products");
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || ".webp";
      const fileName = `idv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      await writeFile(path.join(uploadDir, fileName), buffer);

      const [existingImg]: any = await db.query(
        "SELECT * FROM product_images WHERE product_id = ? AND is_primary = 1",
        [id],
      );
      if (existingImg.length > 0) {
        await db.query(
          "UPDATE product_images SET image_path = ? WHERE product_id = ? AND is_primary = 1",
          [fileName, id],
        );
      } else {
        await db.query(
          "INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, 1)",
          [id, fileName],
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diperbarui!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// 3. DELETE PRODUK
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await db.query("DELETE FROM product_images WHERE product_id = ?", [id]);
    await db.query("DELETE FROM product_variants WHERE product_id = ?", [id]);
    await db.query("DELETE FROM products WHERE product_id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
