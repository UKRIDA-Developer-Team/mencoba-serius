import { NextRequest, NextResponse } from "next/server";
import { getAdminIngredients } from "@/lib/data/admin";

export async function GET(request: NextRequest) {
  try {
    const ingredients = await getAdminIngredients();
    return NextResponse.json(
      { success: true, data: ingredients },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin ingredients:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data bahan" },
      { status: 500 }
    );
  }
}
