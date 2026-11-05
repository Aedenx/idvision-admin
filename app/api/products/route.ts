import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// 1. GET SEMUA PRODUK (Katalog Admin)
export async function GET() {
  try {
    const [products]: any = await db.query(`
      SELECT 
        p.product_id,
        p.name,
        p.base_price AS price,
        p.discount_percent,
        p.category_id
      FROM products p
      ORDER BY p.product_id DESC
    `);

    const formattedProducts = await Promise.all(
      products.map(async (p: any) => {
        let categoryName = "Umum";
        if (p.category_id) {
          const [catRows]: any = await db.query(
            "SELECT name FROM categories WHERE category_id = ? LIMIT 1",
            [p.category_id],
          );
          if (catRows.length > 0) categoryName = catRows[0].name;
        }

        let imageUrl = "";
        const [imgRows]: any = await db.query(
          "SELECT image_path FROM product_images WHERE product_id = ? AND is_primary = 1 LIMIT 1",
          [p.product_id],
        );
        if (imgRows.length > 0) {
          imageUrl = imgRows[0].image_path;
        }

        const [stockRows]: any = await db.query(
          "SELECT SUM(stock_quantity) as total_stock FROM product_variants WHERE product_id = ?",
          [p.product_id],
        );
        const totalStock = stockRows[0]?.total_stock || 0;

        let totalSold = 0;
        try {
          const [soldRows]: any = await db.query(
            "SELECT SUM(quantity) as total_sold FROM order_items WHERE product_id = ?",
            [p.product_id],
          );
          totalSold = soldRows[0]?.total_sold || 0;
        } catch (err) {
          totalSold = 0;
        }

        let finalImageUrl = "";
        if (imageUrl) {
          finalImageUrl = imageUrl.startsWith("http")
            ? imageUrl
            : `/uploads/products/${imageUrl}`;
        }

        return {
          product_id: p.product_id,
          name: p.name,
          price: Number(p.price),
          discount_percent: Number(p.discount_percent) || 0,
          category_name: categoryName,
          image_url: finalImageUrl,
          total_stock: Number(totalStock),
          total_sold: Number(totalSold),
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: formattedProducts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data produk: " + error.message,
      },
      { status: 500 },
    );
  }
}

// 2. POST TAMBAH PRODUK BARU
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const skuBase = formData.get("sku_base") as string;
    const rawCategory = formData.get("category_id") as string;
    const categoryId =
      rawCategory && rawCategory !== "" ? parseInt(rawCategory) : null;

    // Mapping gender_target agar sesuai dengan ENUM('men', 'women', 'unisex') di database
    const rawGender = ((formData.get("gender_target") as string) || "unisex")
      .toLowerCase()
      .trim();
    let genderTarget = "unisex";
    if (rawGender === "pria" || rawGender === "men") {
      genderTarget = "men";
    } else if (rawGender === "wanita" || rawGender === "women") {
      genderTarget = "women";
    }

    // Generate slug otomatis yang unik untuk menghindari error NOT NULL & UNIQUE key
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    if (!baseSlug) baseSlug = "product";
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const description = formData.get("description") as string;
    const basePrice = parseFloat(formData.get("base_price") as string) || 0;
    const discountPercent =
      parseInt(formData.get("discount_percent") as string) || 0;
    const isFeatured = formData.get("is_featured") === "true" ? 1 : 0;

    const colorName = (formData.get("color_name") as string) || "Standard";
    const stockQuantity =
      parseInt(formData.get("stock_quantity") as string) || 0;
    const file = formData.get("product_image") as File | null;

    let discountPrice =
      discountPercent > 0
        ? basePrice - basePrice * (discountPercent / 100)
        : null;

    // A. Insert ke tabel products (menyertakan slug dan gender_target yang sudah dimapping)[cite: 1]
    const [productResult]: any = await db.query(
      `INSERT INTO products (name, slug, sku_base, description, category_id, gender_target, base_price, discount_percent, discount_price, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        skuBase,
        description || "",
        categoryId,
        genderTarget,
        basePrice,
        discountPercent,
        discountPrice,
        isFeatured,
      ],
    );

    const productId = productResult.insertId;

    // B. Insert stok awal ke tabel product_variants[cite: 1]
    const skuVariant = `${skuBase}-VAR1`;
    await db.query(
      `INSERT INTO product_variants (product_id, sku_variant, color_name, price, stock_quantity, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [
        productId,
        skuVariant,
        colorName,
        discountPrice || basePrice,
        stockQuantity,
      ],
    );

    // C. Upload dan simpan gambar utama (Jika ada)[cite: 1]
    if (file && typeof file === "object" && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads/products");
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || ".webp";
      const fileName = `idv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      await writeFile(path.join(uploadDir, fileName), buffer);

      await db.query(
        "INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, 1)",
        [productId, fileName],
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil ditambahkan!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan produk: " + error.message },
      { status: 500 },
    );
  }
}
