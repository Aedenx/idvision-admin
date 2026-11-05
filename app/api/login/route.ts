import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE email = ? AND role = 'admin' LIMIT 1",
      [email],
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email tidak ditemukan atau Anda bukan Admin!",
        },
        { status: 401 },
      );
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Password salah!" },
        { status: 401 },
      );
    }

    // Simpan data lengkap ke Cookie sesi
    const cookieStore = await cookies();
    cookieStore.set("admin_name", user.full_name, {
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    cookieStore.set("admin_email", user.email, {
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    cookieStore.set("admin_image", user.profile_image || "", {
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
