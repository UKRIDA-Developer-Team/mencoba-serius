import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { withAdminAuth } from "@/lib/auth/middleware";

const postHandler = async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const oldPublicId = formData.get("oldPublicId") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Cloudinary upload_stream
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary under the "products" folder
    // f_auto + q_auto are applied via the transformation in lib/cloudinary.ts
    const { publicId, secureUrl } = await uploadToCloudinary(
      buffer,
      file.name,
      "products"
    );

    // If replacing an old image, delete the previous one from Cloudinary
    if (oldPublicId) {
      try {
        await deleteFromCloudinary(oldPublicId);
      } catch (deleteError) {
        // Log but don't fail — the new upload succeeded
        console.warn("Failed to delete old Cloudinary image:", deleteError);
      }
    }

    console.log("Cloudinary upload success:", { publicId, secureUrl });

    return NextResponse.json(
      { success: true, url: secureUrl, publicId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengupload file: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
};

export const POST = withAdminAuth(postHandler);
