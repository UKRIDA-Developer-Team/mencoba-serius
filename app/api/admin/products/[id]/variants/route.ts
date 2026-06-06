import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { productVariants, products } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";

function getProductIdFromUrl(request: NextRequest): bigint | null {
  // URL: /api/admin/products/[id]/variants
  const parts = request.nextUrl.pathname.split("/");
  const idIndex = parts.indexOf("products") + 1;
  const idStr = parts[idIndex];
  try {
    return BigInt(idStr);
  } catch {
    return null;
  }
}

const getHandler = async (request: NextRequest) => {
  const productId = getProductIdFromUrl(request);
  if (!productId) {
    return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(asc(productVariants.sortOrder), asc(productVariants.createdAt));

    return NextResponse.json({
      success: true,
      data: variants.map((v) => ({
        id: v.id.toString(),
        productId: v.productId.toString(),
        label: v.label,
        priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
        isActive: v.isActive,
        sortOrder: v.sortOrder,
        createdAt: v.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch variants" }, { status: 500 });
  }
};

const postHandler = async (request: NextRequest) => {
  const productId = getProductIdFromUrl(request);
  if (!productId) {
    return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { label, priceOverride, sortOrder } = body;

    if (!label?.trim()) {
      return NextResponse.json({ success: false, error: "Label is required" }, { status: 400 });
    }

    const product = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product.length) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const [inserted] = await db
      .insert(productVariants)
      .values({
        productId,
        label: label.trim(),
        priceOverride: priceOverride != null ? String(priceOverride) : null,
        isActive: true,
        sortOrder: sortOrder ?? 0,
      })
      .returning();

    revalidateTag("products", "max");
    revalidateTag("variants", "max");

    return NextResponse.json({
      success: true,
      data: {
        id: inserted.id.toString(),
        productId: inserted.productId.toString(),
        label: inserted.label,
        priceOverride: inserted.priceOverride ? Number(inserted.priceOverride) : null,
        isActive: inserted.isActive,
        sortOrder: inserted.sortOrder,
        createdAt: inserted.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create variant" }, { status: 500 });
  }
};

const putHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { variantId, label, priceOverride, isActive, sortOrder } = body;

    if (!variantId) {
      return NextResponse.json({ success: false, error: "variantId is required" }, { status: 400 });
    }

    const [updated] = await db
      .update(productVariants)
      .set({
        ...(label !== undefined && { label: label.trim() }),
        ...(priceOverride !== undefined && {
          priceOverride: priceOverride != null ? String(priceOverride) : null,
        }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      })
      .where(eq(productVariants.id, BigInt(variantId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Variant not found" }, { status: 404 });
    }

    revalidateTag("products", "max");
    revalidateTag("variants", "max");

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id.toString(),
        productId: updated.productId.toString(),
        label: updated.label,
        priceOverride: updated.priceOverride ? Number(updated.priceOverride) : null,
        isActive: updated.isActive,
        sortOrder: updated.sortOrder,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update variant" }, { status: 500 });
  }
};

const deleteHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { variantId } = body;

    if (!variantId) {
      return NextResponse.json({ success: false, error: "variantId is required" }, { status: 400 });
    }

    await db.delete(productVariants).where(eq(productVariants.id, BigInt(variantId)));

    revalidateTag("products", "max");
    revalidateTag("variants", "max");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete variant" }, { status: 500 });
  }
};

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
export const PUT = withAdminAuth(putHandler);
export const DELETE = withAdminAuth(deleteHandler);
