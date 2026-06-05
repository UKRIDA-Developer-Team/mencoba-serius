import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { withAdminAuth } from "@/lib/auth/middleware";

const postHandler = async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const timestamp = Date.now();
    const newFilename = `${timestamp}-${originalName}`;

    // Ensure the upload directory exists
    const uploadDir = join(process.cwd(), "public", "product");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if directory already exists
    }

    const path = join(uploadDir, newFilename);
    await writeFile(path, buffer);

    return NextResponse.json(
      { success: true, url: `/product/${newFilename}` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupload file" },
      { status: 500 }
    );
  }
};

export const POST = withAdminAuth(postHandler);
