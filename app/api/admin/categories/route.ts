import { NextRequest, NextResponse } from "next/server";
import { getAdminCategories } from "@/lib/data/admin";

export async function GET(request: NextRequest) {
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
