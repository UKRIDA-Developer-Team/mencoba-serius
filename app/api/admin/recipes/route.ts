import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ingredientUnitMap,
  ingredients,
  measurementUnits,
  productRecipeIngredients,
  products,
} from "@/lib/schema";
import { and, desc, eq } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";

const getHandler = async () => {
  try {
    const [recipes, productOptions, ingredientOptions] = await Promise.all([
      db
        .select({
          id: productRecipeIngredients.id,
          productId: productRecipeIngredients.productId,
          ingredientId: productRecipeIngredients.ingredientId,
          unitId: productRecipeIngredients.unitId,
          quantityPerProduct: productRecipeIngredients.quantityPerProduct,
          wastagePercent: productRecipeIngredients.wastagePercent,
          notes: productRecipeIngredients.notes,
          productName: products.name,
          ingredientName: ingredients.name,
          unitCode: measurementUnits.code,
        })
        .from(productRecipeIngredients)
        .leftJoin(products, eq(productRecipeIngredients.productId, products.id))
        .leftJoin(ingredients, eq(productRecipeIngredients.ingredientId, ingredients.id))
        .leftJoin(measurementUnits, eq(productRecipeIngredients.unitId, measurementUnits.id))
        .orderBy(desc(productRecipeIngredients.id)),
      db
        .select({ id: products.id, name: products.name })
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(products.name),
      db
        .select({
          id: ingredients.id,
          name: ingredients.name,
          unitId: ingredientUnitMap.unitId,
          unitCode: measurementUnits.code,
        })
        .from(ingredients)
        .leftJoin(ingredientUnitMap, eq(ingredients.id, ingredientUnitMap.ingredientId))
        .leftJoin(measurementUnits, eq(ingredientUnitMap.unitId, measurementUnits.id))
        .where(eq(ingredients.isActive, true))
        .orderBy(ingredients.name),
    ]);

    const ingredientMap = new Map<
      string,
      { id: string; name: string; units: Array<{ unitId: string; unitCode: string }> }
    >();

    ingredientOptions.forEach((row) => {
      const key = row.id.toString();
      if (!ingredientMap.has(key)) {
        ingredientMap.set(key, { id: key, name: row.name, units: [] });
      }
      if (row.unitId && row.unitCode) {
        ingredientMap.get(key)?.units.push({
          unitId: row.unitId.toString(),
          unitCode: row.unitCode,
        });
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: recipes.map((recipe) => ({
          id: recipe.id.toString(),
          productId: recipe.productId.toString(),
          ingredientId: recipe.ingredientId.toString(),
          unitId: recipe.unitId.toString(),
          quantityPerProduct: Number(recipe.quantityPerProduct),
          wastagePercent: Number(recipe.wastagePercent),
          notes: recipe.notes,
          productName: recipe.productName ?? "Unknown product",
          ingredientName: recipe.ingredientName ?? "Unknown ingredient",
          unitCode: recipe.unitCode ?? "-",
        })),
        options: {
          products: productOptions.map((product) => ({
            id: product.id.toString(),
            name: product.name,
          })),
          ingredients: Array.from(ingredientMap.values()),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data recipe" },
      { status: 500 }
    );
  }
};

const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const productId = body.productId as string;
    const ingredientId = body.ingredientId as string;
    const unitId = body.unitId as string;
    const quantityPerProduct = Number(body.quantityPerProduct);
    const wastagePercent = Number(body.wastagePercent ?? 0);
    const notes = typeof body.notes === "string" ? body.notes : null;

    if (!productId || !ingredientId || !unitId || !Number.isFinite(quantityPerProduct) || quantityPerProduct <= 0) {
      return NextResponse.json(
        { success: false, message: "Field wajib: productId, ingredientId, unitId, quantityPerProduct > 0" },
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
      .insert(productRecipeIngredients)
      .values({
        productId: BigInt(productId),
        ingredientId: BigInt(ingredientId),
        unitId: BigInt(unitId),
        quantityPerProduct: quantityPerProduct.toString(),
        wastagePercent: wastagePercent.toString(),
        notes,
      })
      .onConflictDoUpdate({
        target: [productRecipeIngredients.productId, productRecipeIngredients.ingredientId],
        set: {
          unitId: BigInt(unitId),
          quantityPerProduct: quantityPerProduct.toString(),
          wastagePercent: wastagePercent.toString(),
          notes,
        },
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Recipe berhasil disimpan",
        data: {
          id: result[0].id.toString(),
          productId: result[0].productId.toString(),
          ingredientId: result[0].ingredientId.toString(),
          unitId: result[0].unitId.toString(),
          quantityPerProduct: Number(result[0].quantityPerProduct),
          wastagePercent: Number(result[0].wastagePercent),
          notes: result[0].notes,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving recipe:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan recipe" },
      { status: 500 }
    );
  }
};

const deleteHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const id = body.id as string;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Field id wajib diisi" },
        { status: 400 }
      );
    }

    const result = await db
      .delete(productRecipeIngredients)
      .where(eq(productRecipeIngredients.id, BigInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Recipe tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Recipe berhasil dihapus",
        data: { id: result[0].id.toString() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus recipe" },
      { status: 500 }
    );
  }
};

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
export const DELETE = withAdminAuth(deleteHandler);
