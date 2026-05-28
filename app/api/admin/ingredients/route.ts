import { NextRequest, NextResponse } from "next/server";
import { getAdminIngredients } from "@/lib/data/admin";
import { db } from "@/lib/db";
import { ingredients, measurementUnits } from "@/lib/schema";
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
    const { sku, name, reorderLevelBaseQty } = body;
    const reorderValue = Number(reorderLevelBaseQty);

    if (
      typeof sku !== "string" ||
      typeof name !== "string" ||
      !Number.isFinite(reorderValue) ||
      reorderValue < 0
    ) {
      return NextResponse.json(
        { success: false, message: "SKU, name, dan reorder level valid wajib diisi" },
        { status: 400 }
      );
    }

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
        preferredSupplierId: BigInt(1),
        reorderLevelBaseQty: reorderValue.toString(),
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
};

const putHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, sku, name, reorderLevelBaseQty } = body;
    const reorderValue = Number(reorderLevelBaseQty);

    if (
      !id ||
      typeof sku !== "string" ||
      typeof name !== "string" ||
      !Number.isFinite(reorderValue) ||
      reorderValue < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Field wajib: id, sku, name, reorderLevelBaseQty" },
        { status: 400 }
      );
    }

    const result = await db
      .update(ingredients)
      .set({
        sku: sku.toUpperCase(),
        name,
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
