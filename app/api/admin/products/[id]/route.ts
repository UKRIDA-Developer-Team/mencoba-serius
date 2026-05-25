import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json(
        { success: false, message: "Field isActive wajib diisi" },
        { status: 400 }
      );
    }

    const result = await db
      .update(products)
      .set({ isActive })
      .where(eq(products.id, BigInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil diupdate",
        data: {
          id: result[0].id.toString(),
          slug: result[0].slug,
          isActive: result[0].isActive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate produk" },
      { status: 500 }
    );
  }
}
