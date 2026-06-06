import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { products, productCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";
import { deleteFromCloudinary } from "@/lib/cloudinary";

const patchHandler = async (
  request: NextRequest,
  payload: any,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive, isRecommended } = body;

    if (isActive === undefined && isRecommended === undefined) {
      return NextResponse.json(
        { success: false, message: "Tidak ada field yang diupdate" },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (isRecommended !== undefined) updates.isRecommended = isRecommended;

    const result = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, BigInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    revalidateTag("products", "max");

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil diupdate",
        data: {
          id: result[0].id.toString(),
          slug: result[0].slug,
          isActive: result[0].isActive,
          isRecommended: result[0].isRecommended,
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
  payload: any,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, basePrice, description, imagePath, imagePublicId, isCustomizable, isPreorderOnly, isRecommended } = body;

    if (!name || !category || basePrice === undefined) {
      return NextResponse.json(
        { success: false, message: "Field wajib: name, category, basePrice" },
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

    const toSlug = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    
    const generatedSlug = toSlug(name);

    const result = await db
      .update(products)
      .set({
        slug: generatedSlug,
        name,
        description: description || null,
        imagePath: imagePath || null,
        imagePublicId: imagePublicId || null,
        categoryId: cat[0].id,
        basePrice: basePrice.toString(),
        isCustomizable: isCustomizable ?? false,
        isPreorderOnly: isPreorderOnly ?? false,
        isRecommended: isRecommended ?? false,
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

    revalidateTag("products", "max");

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
          description: result[0].description,
          imagePath: result[0].imagePath,
          imagePublicId: result[0].imagePublicId,
          sizeLabel: result[0].sizeLabel || "",
          isCustomizable: result[0].isCustomizable,
          isPreorderOnly: result[0].isPreorderOnly,
          isRecommended: result[0].isRecommended,
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
  payload: any,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    // Fetch the product to get its Cloudinary public_id before deleting
    const existing = await db
      .select({ imagePublicId: products.imagePublicId })
      .from(products)
      .where(eq(products.id, BigInt(id)))
      .limit(1);

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

    // Delete the product's image from Cloudinary (best-effort)
    if (existing.length > 0 && existing[0].imagePublicId) {
      try {
        await deleteFromCloudinary(existing[0].imagePublicId);
      } catch (err) {
        console.warn("Failed to delete Cloudinary image:", err);
      }
    }

    revalidateTag("products", "max");

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
