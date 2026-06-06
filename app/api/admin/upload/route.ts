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

    // Sanitize filename - keep only safe characters
    const originalName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-")
      .replace(/-+/g, "-");
    
    const timestamp = Date.now();
    const newFilename = `${timestamp}-${originalName}`;

    // Ensure the upload directory exists
    const uploadDir = join(process.cwd(), "public", "product");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      console.error("Error creating directory:", e);
    }

    const filePath = join(uploadDir, newFilename);
    await writeFile(filePath, buffer);

    const url = `/product/${newFilename}`;
    console.log("File uploaded successfully:", { filePath, url, size: buffer.length });

    return NextResponse.json(
      { success: true, url },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupload file: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
};

export const POST = withAdminAuth(postHandler);
