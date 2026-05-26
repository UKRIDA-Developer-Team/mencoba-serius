import { NextRequest, NextResponse } from "next/server";
import { getAdminProducts } from "@/lib/data/admin";
import { db } from "@/lib/db";
import { products, productCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";

const getHandler = async (request: NextRequest) => {
  try {
    const productList = await getAdminProducts();
    return NextResponse.json(
      { success: true, data: productList },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
};

const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { slug, name, category, basePrice } = body;

    if (!slug || !name || !category || basePrice === undefined) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi" },
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
      .insert(products)
      .values({
        slug: slug.toLowerCase(),
        name,
        categoryId: cat[0].id,
        basePrice: basePrice.toString(),
        isActive: true,
        isCustomizable: false,
        isPreorderOnly: false,
        defaultLeadTimeDays: 0,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan",
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
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan produk" },
      { status: 500 }
    );
  }
};

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
