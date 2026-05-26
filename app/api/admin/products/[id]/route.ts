import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";

const patchHandler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
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
};

const putHandler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { slug, name, category, basePrice, isCustomizable, isPreorderOnly } = body;

    if (!slug || !name || !category || basePrice === undefined) {
      return NextResponse.json(
        { success: false, message: "Field wajib: slug, name, category, basePrice" },
        { status: 400 }
      );
    }

    // Get category ID from name
    const cat = await db
      .select({ id: productCategories.id })
      .from(productCategories)
      .where(eq(productCategories.name, category))
      .limit(1);

    if (cat.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 400 }
      );
    }

    const result = await db
      .update(products)
      .set({
        slug: slug.toLowerCase(),
        name,
        categoryId: cat[0].id,
        basePrice: basePrice.toString(),
        isCustomizable: isCustomizable ?? false,
        isPreorderOnly: isPreorderOnly ?? false,
        updatedAt: new Date(),
      })
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
        message: "Produk berhasil diperbarui",
        data: {
          id: result[0].id.toString(),
          slug: result[0].slug,
          name: result[0].name,
          category,
          basePrice: Number(result[0].basePrice),
          sizeLabel: result[0].sizeLabel || "",
          isCustomizable: result[0].isCustomizable,
          isPreorderOnly: result[0].isPreorderOnly,
          isActive: result[0].isActive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui produk" },
      { status: 500 }
    );
  }
};

const deleteHandler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;

    const result = await db
      .delete(products)
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
        message: "Produk berhasil dihapus",
        data: {
          id: result[0].id.toString(),
          slug: result[0].slug,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
};

export const PATCH = withAdminAuth(patchHandler);
export const PUT = withAdminAuth(putHandler);
export const DELETE = withAdminAuth(deleteHandler);
