import { NextRequest, NextResponse } from "next/server";
import { getAdminIngredients } from "@/lib/data/admin";
import { db } from "@/lib/db";
import { ingredients, measurementUnits } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  // Verify JWT token
  const adminToken = verifyAdminToken(request);
  if (!adminToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const ingredientList = await getAdminIngredients();
    return NextResponse.json(
      { success: true, data: ingredientList },
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

export async function POST(request: NextRequest) {
  // Verify JWT token
  const adminToken = verifyAdminToken(request);
  if (!adminToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { sku, name, reorderLevelBaseQty } = body;

    if (!sku || !name || reorderLevelBaseQty === undefined) {
      return NextResponse.json(
        { success: false, message: "SKU, name, dan reorder level wajib diisi" },
        { status: 400 }
      );
    }

    // Get base unit (g) for default
    const baseUnit = await db
      .select({ id: measurementUnits.id })
      .from(measurementUnits)
      .where(eq(measurementUnits.code, "g"))
      .limit(1);

    const baseUnitId = baseUnit.length > 0 ? baseUnit[0].id : BigInt(1);

    const result = await db
      .insert(ingredients)
      .values({
        sku: sku.toUpperCase(),
        name,
        baseUnitId,
        reorderLevelBaseQty: reorderLevelBaseQty.toString(),
        isActive: true,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Ingredient berhasil ditambahkan",
        data: {
          id: result[0].id.toString(),
          sku: result[0].sku,
          name: result[0].name,
          baseUnitCode: "g",
          reorderLevelBaseQty: Number(result[0].reorderLevelBaseQty),
          currentStockBaseQty: 0,
          preferredSupplier: "Unknown",
          isActive: result[0].isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan ingredient" },
      { status: 500 }
    );
  }
}
