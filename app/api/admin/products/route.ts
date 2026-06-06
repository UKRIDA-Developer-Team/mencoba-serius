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
    console.log("POST /api/admin/products - Received data:", body);
    
    const { name, category, basePrice, description, imagePath, isRecommended, isPreorderOnly } = body;

    if (!name || !category || basePrice === undefined) {
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

    const toSlug = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    
    // Add random suffix to ensure uniqueness just in case
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
    const generatedSlug = `${toSlug(name)}-${randomSuffix}`;

    console.log("Creating product with data:", {
      slug: generatedSlug,
      name,
      categoryId: cat[0].id,
      basePrice: basePrice.toString(),
      imagePath: imagePath || null,
      description,
      isPreorderOnly,
      isRecommended,
    });

    const result = await db
      .insert(products)
      .values({
        slug: generatedSlug,
        name,
        categoryId: cat[0].id,
        basePrice: basePrice.toString(),
        description: description || null,
        imagePath: imagePath || null,
        isActive: true,
        isCustomizable: false,
        isPreorderOnly: isPreorderOnly ?? false,
        isRecommended: isRecommended ?? false,
        defaultLeadTimeDays: 0,
      })
      .returning();

    console.log("Product created successfully:", result[0]);

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
          description: result[0].description,
          imagePath: result[0].imagePath,
          sizeLabel: result[0].sizeLabel || "",
          isCustomizable: result[0].isCustomizable,
          isPreorderOnly: result[0].isPreorderOnly,
          isRecommended: result[0].isRecommended,
          isActive: result[0].isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan produk: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
};

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
