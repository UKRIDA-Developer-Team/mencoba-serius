import { NextRequest, NextResponse } from "next/server";
import { getAdminCategories } from "@/lib/data/admin";
import { verifyAdminToken } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  // Verify JWT token
  const adminToken = verifyAdminToken(request);
  if (!adminToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const categories = await getAdminCategories();
    return NextResponse.json(
      { success: true, data: categories },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
}
