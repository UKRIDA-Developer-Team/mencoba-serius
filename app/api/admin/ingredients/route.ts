import { NextRequest, NextResponse } from "next/server";
import { getAdminIngredients } from "@/lib/data/admin";
import { db } from "@/lib/db";
import { ingredients, ingredientUnitMap, measurementUnits, suppliers } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";

const getHandler = async () => {
  try {
    const ingredientList = await getAdminIngredients();
    return NextResponse.json({ success: true, data: ingredientList }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin ingredients:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data bahan" },
      { status: 500 }
    );
  }
};

const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, reorderLevelBaseQty, baseUnitId, supplierId } = body;
    const reorderValue = Number(reorderLevelBaseQty);

    if (
      typeof name !== "string" ||
      !baseUnitId ||
      !Number.isFinite(reorderValue) ||
      reorderValue < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Name, unit, dan reorder level valid wajib diisi" },
        { status: 400 }
      );
    }

    const parsedBaseUnitId = BigInt(baseUnitId);
    const parsedSupplierId = supplierId ? BigInt(supplierId) : undefined;

    // Auto-generate SKU
    const prefix = name.substring(0, 3).toUpperCase().padEnd(3, 'X');
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 900 + 100);
    const generatedSku = `ING-${prefix}-${timestamp}-${random}`;

    const result = await db
      .insert(ingredients)
      .values({
        sku: generatedSku,
        name,
        baseUnitId: parsedBaseUnitId,
        preferredSupplierId: parsedSupplierId,
        reorderLevelBaseQty: reorderValue.toString(),
        isActive: true,
      })
      .returning();

    // Auto-create ingredient_unit_map entry for the base unit
    // This is required for stock opname to find available units
    try {
      await db.insert(ingredientUnitMap).values({
        ingredientId: result[0].id,
        unitId: parsedBaseUnitId,
        toBaseMultiplier: "1",
        isPurchaseUnit: false,
        isRecipeUnit: true,
      });
    } catch (mapError) {
      // Non-fatal: log but don't fail the ingredient creation
      console.warn("Could not create ingredient_unit_map entry:", mapError);
    }

    // Look up the actual unit code for the response
    const unitRow = await db
      .select({ code: measurementUnits.code })
      .from(measurementUnits)
      .where(eq(measurementUnits.id, parsedBaseUnitId))
      .limit(1);

    const unitCode = unitRow.length > 0 ? unitRow[0].code : "g";

    // Look up supplier name if provided
    let supplierName = "—";
    if (parsedSupplierId) {
      const supplierRow = await db
        .select({ name: suppliers.name })
        .from(suppliers)
        .where(eq(suppliers.id, parsedSupplierId))
        .limit(1);
      supplierName = supplierRow.length > 0 ? supplierRow[0].name : "—";
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ingredient berhasil ditambahkan",
        data: {
          id: result[0].id.toString(),
          sku: result[0].sku,
          name: result[0].name,
          baseUnitCode: unitCode,
          reorderLevelBaseQty: Number(result[0].reorderLevelBaseQty),
          currentStockBaseQty: 0,
          preferredSupplier: supplierName,
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
};

const putHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, name, reorderLevelBaseQty, baseUnitId, supplierId } = body;
    const reorderValue = Number(reorderLevelBaseQty);

    if (
      !id ||
      typeof name !== "string" ||
      !baseUnitId ||
      !Number.isFinite(reorderValue) ||
      reorderValue < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Field wajib: id, name, baseUnitId, reorderLevelBaseQty" },
        { status: 400 }
      );
    }

    const result = await db
      .update(ingredients)
      .set({
        name,
        baseUnitId: BigInt(baseUnitId),
        preferredSupplierId: supplierId ? BigInt(supplierId) : undefined,
        reorderLevelBaseQty: reorderValue.toString(),
        updatedAt: new Date(),
      })
      .where(eq(ingredients.id, BigInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Ingredient tidak ditemukan" },
        { status: 404 }
      );
    }

    const latest = await getAdminIngredients();
    const updated = latest.find((item) => item.id === String(id));

    return NextResponse.json(
      {
        success: true,
        message: "Ingredient berhasil diperbarui",
        data: updated ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui ingredient" },
      { status: 500 }
    );
  }
};

const patchHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Field wajib: id, isActive" },
        { status: 400 }
      );
    }

    const result = await db
      .update(ingredients)
      .set({ isActive, updatedAt: new Date() })
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
        message: "Status ingredient berhasil diperbarui",
        data: { id: result[0].id.toString(), isActive: result[0].isActive },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling ingredient status:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status ingredient" },
      { status: 500 }
    );
  }
};

const deleteHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Field id wajib diisi" },
        { status: 400 }
      );
    }

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
};

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
export const PUT = withAdminAuth(putHandler);
export const PATCH = withAdminAuth(patchHandler);
export const DELETE = withAdminAuth(deleteHandler);
