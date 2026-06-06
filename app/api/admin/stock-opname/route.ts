import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ingredientStockMovements,
  ingredientUnitMap,
  ingredients,
  measurementUnits,
} from "@/lib/schema";
import { and, desc, eq } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";
import { getAdminIngredients } from "@/lib/data/admin";

const getHandler = async () => {
  try {
    const [movements, ingredientStocks, ingredientUnits] = await Promise.all([
      db
        .select({
          id: ingredientStockMovements.id,
          ingredientId: ingredientStockMovements.ingredientId,
          unitId: ingredientStockMovements.unitId,
          quantity: ingredientStockMovements.quantity,
          movementAt: ingredientStockMovements.movementAt,
          notes: ingredientStockMovements.notes,
          ingredientName: ingredients.name,
          unitCode: measurementUnits.code,
        })
        .from(ingredientStockMovements)
        .leftJoin(ingredients, eq(ingredientStockMovements.ingredientId, ingredients.id))
        .leftJoin(measurementUnits, eq(ingredientStockMovements.unitId, measurementUnits.id))
        .where(eq(ingredientStockMovements.movementType, "ADJUSTMENT"))
        .orderBy(desc(ingredientStockMovements.movementAt)),
      getAdminIngredients(),
      db
        .select({
          ingredientId: ingredientUnitMap.ingredientId,
          unitId: ingredientUnitMap.unitId,
          unitCode: measurementUnits.code,
        })
        .from(ingredientUnitMap)
        .leftJoin(measurementUnits, eq(ingredientUnitMap.unitId, measurementUnits.id))
        .orderBy(ingredientUnitMap.ingredientId),
    ]);

    const unitsByIngredientId = new Map<string, Array<{ unitId: string; unitCode: string }>>();
    ingredientUnits.forEach((unit) => {
      const key = unit.ingredientId.toString();
      if (!unitsByIngredientId.has(key)) {
        unitsByIngredientId.set(key, []);
      }
      if (unit.unitCode) {
        unitsByIngredientId.get(key)?.push({
          unitId: unit.unitId.toString(),
          unitCode: unit.unitCode,
        });
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: movements.map((item) => ({
          id: item.id.toString(),
          ingredientId: item.ingredientId.toString(),
          unitId: item.unitId.toString(),
          quantity: Number(item.quantity),
          movementAt: item.movementAt,
          notes: item.notes,
          ingredientName: item.ingredientName ?? "Unknown ingredient",
          unitCode: item.unitCode ?? "-",
        })),
        options: {
          ingredients: ingredientStocks.map((ingredient) => ({
            id: ingredient.id,
            name: ingredient.name,
            stock: ingredient.currentStockBaseQty,
            baseUnitCode: ingredient.baseUnitCode,
            units: unitsByIngredientId.get(ingredient.id) ?? [],
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching stock opname:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data stock opname" },
      { status: 500 }
    );
  }
};

const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const ingredientId = body.ingredientId as string;
    const unitId = body.unitId as string;
    const quantity = Number(body.quantity);
    const notes = typeof body.notes === "string" ? body.notes : null;

    if (!ingredientId || !unitId || !Number.isFinite(quantity) || quantity === 0) {
      return NextResponse.json(
        { success: false, message: "Field wajib: ingredientId, unitId, quantity (bukan 0)" },
        { status: 400 }
      );
    }

    const mapping = await db
      .select({ ingredientId: ingredientUnitMap.ingredientId })
      .from(ingredientUnitMap)
      .where(
        and(
          eq(ingredientUnitMap.ingredientId, BigInt(ingredientId)),
          eq(ingredientUnitMap.unitId, BigInt(unitId))
        )
      )
      .limit(1);

    if (mapping.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kombinasi ingredient dan unit tidak valid" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(ingredientStockMovements)
      .values({
        ingredientId: BigInt(ingredientId),
        unitId: BigInt(unitId),
        movementType: "ADJUSTMENT",
        quantity: quantity.toString(),
        notes,
        referenceType: "stock_opname",
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Stock opname berhasil dicatat",
        data: {
          id: result[0].id.toString(),
          ingredientId: result[0].ingredientId.toString(),
          unitId: result[0].unitId.toString(),
          quantity: Number(result[0].quantity),
          movementAt: result[0].movementAt,
          notes: result[0].notes,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating stock opname:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan stock opname" },
      { status: 500 }
    );
  }
};

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
