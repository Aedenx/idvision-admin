import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fullName = formData.get("full_name") as string;
    const password = formData.get("password") as string;
    const file = formData.get("profile_image") as File | null;

    const cookieStore = await cookies();
    const currentEmail = cookieStore.get("admin_email")?.value;

    if (!currentEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi tidak ditemukan. Silakan login kembali.",
        },
        { status: 401 },
      );
    }

    let imagePath = cookieStore.get("admin_image")?.value || "";

    // 1. Proses upload file gambar jika ada yang diunggah
    if (file && typeof file === "object" && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Buat direktori penyimpanan jika belum ada
      const uploadDir = path.join(process.cwd(), "public/uploads/profiles");
      await mkdir(uploadDir, { recursive: true });

      // Generate nama file unik
      const ext = path.extname(file.name) || ".png";
      const fileName = `admin_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      imagePath = `/uploads/profiles/${fileName}`;
    }

    // 2. Query Update ke Database
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        "UPDATE users SET full_name = ?, profile_image = ?, password_hash = ? WHERE email = ?",
        [fullName, imagePath, hashedPassword, currentEmail],
      );
    } else {
      await db.query(
        "UPDATE users SET full_name = ?, profile_image = ? WHERE email = ?",
        [fullName, imagePath, currentEmail],
      );
    }

    // 3. Perbarui Sesi Cookies
    cookieStore.set("admin_name", fullName, { path: "/", maxAge: 86400 });
    cookieStore.set("admin_image", imagePath, { path: "/", maxAge: 86400 });

    return NextResponse.json({
      success: true,
      message: "Profil dan foto berhasil diperbarui!",
      imagePath,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui profil: " + error.message },
      { status: 500 },
    );
  }
}
