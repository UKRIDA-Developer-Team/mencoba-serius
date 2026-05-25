import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ingredients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/auth/middleware";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify JWT token
  const adminToken = verifyAdminToken(request);
  if (!adminToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    const result = await db
      .delete(ingredients)
      .where(eq(ingredients.id, BigInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Ingredient tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ingredient berhasil dihapus",
        data: {
          id: result[0].id.toString(),
          sku: result[0].sku,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus ingredient" },
      { status: 500 }
    );
  }
}
