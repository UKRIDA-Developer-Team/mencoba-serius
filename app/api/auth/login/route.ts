import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admins } from "@/lib/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Validate request method
    if (request.method !== "POST") {
      return NextResponse.json(
        { success: false, message: "Method not allowed" },
        { status: 405 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (_err) {
      console.warn("Invalid JSON in login request");
      return NextResponse.json(
        { success: false, message: "Format request tidak valid" },
        { status: 400 }
      );
    }

    const { username, password } = body as Record<string, unknown>;

    // Validate required fields
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Sanitize input - prevent injection attacks
    const sanitizedUsername = username.trim().toLowerCase();
    if (sanitizedUsername.length === 0 || password.length === 0) {
      return NextResponse.json(
        { success: false, message: "Username dan password tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Query database for admin user
    let adminUser;
    try {
      const result = await db
        .select()
        .from(admins)
        .where(eq(admins.username, sanitizedUsername))
        .limit(1);
      adminUser = result[0] || null;
    } catch (dbError) {
      console.error("Database error during login query:", dbError);
      return NextResponse.json(
        { success: false, message: "Terjadi kesalahan pada server" },
        { status: 500 }
      );
    }

    // User not found - use generic message for security
    if (!adminUser) {
      console.warn(`Failed login attempt: user not found for username: ${sanitizedUsername}`);
      return NextResponse.json(
        { success: false, message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Check if admin account is active
    if (!adminUser.isActive) {
      console.warn(`Failed login attempt: inactive account for username: ${sanitizedUsername}`);
      return NextResponse.json(
        { success: false, message: "Akun admin tidak aktif" },
        { status: 403 }
      );
    }

    // Verify password using bcrypt
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, adminUser.password);
    } catch (bcryptError) {
      console.error("Error comparing passwords:", bcryptError);
      return NextResponse.json(
        { success: false, message: "Terjadi kesalahan pada server" },
        { status: 500 }
      );
    }

    // Invalid password - use generic message for security
    if (!passwordMatch) {
      console.warn(`Failed login attempt: invalid password for username: ${sanitizedUsername}`);
      return NextResponse.json(
        { success: false, message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Successful login
    console.info(`Successful login for admin: ${sanitizedUsername}`);
    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        admin: {
          id: adminUser.id.toString(),
          username: adminUser.username,
          email: adminUser.email,
          fullName: adminUser.fullName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in login endpoint:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
