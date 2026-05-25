import { NextRequest, NextResponse } from "next/server";
import { getAdminProducts } from "@/lib/data/admin";

export async function GET(request: NextRequest) {
  try {
    const products = await getAdminProducts();
    return NextResponse.json(
      { success: true, data: products },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}
