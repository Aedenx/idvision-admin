import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

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

// 2. PUT / UPDATE PRODUK (DIOPTIMALKAN DENGAN VERCEL BLOB)
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
      await db.query(
        `UPDATE product_variants SET stock_quantity = ?, price = ? WHERE product_id = ?`,
        [stockQuantity, discountPrice || basePrice, id],
      );
    } else {
      const skuVariant = `${skuBase}-${Date.now().toString().slice(-4)}`;
      await db.query(
        `INSERT INTO product_variants (product_id, sku_variant, color_name, price, stock_quantity, is_active) VALUES (?, ?, 'Standard', ?, ?, 1)`,
        [id, skuVariant, discountPrice || basePrice, stockQuantity],
      );
    }

    // C. Proses Upload Gambar Baru ke Vercel Blob Storage (Jika ada)
    if (file && typeof file === "object" && file.name) {
      const ext = file.name.substring(file.name.lastIndexOf(".")) || ".webp";
      const fileName = `products/idv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

      // Upload langsung ke Vercel Blob
      const blob = await put(fileName, file, {
        access: "public",
      });

      const [existingImg]: any = await db.query(
        "SELECT * FROM product_images WHERE product_id = ? AND is_primary = 1",
        [id],
      );
      if (existingImg.length > 0) {
        await db.query(
          "UPDATE product_images SET image_path = ? WHERE product_id = ? AND is_primary = 1",
          [blob.url, id],
        );
      } else {
        await db.query(
          "INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, 1)",
          [id, blob.url],
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
