import { db } from "@/lib/db";
import { ingredients, products, productCategories, suppliers, measurementUnits, ingredientStockMovements } from "@/lib/schema";
import { and, desc, eq } from "drizzle-orm";

export type AdminIngredient = {
  id: string;
  sku: string;
  name: string;
  baseUnitCode: string;
  reorderLevelBaseQty: number;
  currentStockBaseQty: number;
  preferredSupplier: string;
  isActive: boolean;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  basePrice: number;
  sizeLabel: string;
  isCustomizable: boolean;
  isPreorderOnly: boolean;
  isActive: boolean;
};

export type AdminCategory = {
  id: string;
  name: string;
  description: string | null;
};

/**
 * Calculate current stock for an ingredient from stock movements
 * Stock = IN - OUT - ADJUSTMENT (where ADJUSTMENT can be positive or negative)
 */
async function calculateIngredientStock(ingredientId: bigint, baseUnitId: bigint): Promise<number> {
  try {
    const movements = await db
      .select({
        movementType: ingredientStockMovements.movementType,
        quantity: ingredientStockMovements.quantity,
      })
      .from(ingredientStockMovements)
      .where(
        and(
          eq(ingredientStockMovements.ingredientId, ingredientId),
          eq(ingredientStockMovements.unitId, baseUnitId)
        )
      );

    let stock = 0;
    for (const movement of movements) {
      const qty = Number(movement.quantity);
      if (movement.movementType === "IN") {
        stock += qty;
      } else if (movement.movementType === "OUT") {
        stock -= qty;
      } else if (movement.movementType === "ADJUSTMENT") {
        // ADJUSTMENT can be positive or negative, it's already signed
        stock += qty;
      }
    }

    return Math.max(0, stock); // Ensure stock doesn't go negative
  } catch (error) {
    console.error("Error calculating ingredient stock:", error);
    return 0;
  }
}

/**
 * Get all ingredients for admin dashboard with JOINs (optimized - no N+1)
 */
export async function getAdminIngredients(): Promise<AdminIngredient[]> {
  try {
    const result = await db
      .select({
        id: ingredients.id,
        sku: ingredients.sku,
        name: ingredients.name,
        baseUnitId: ingredients.baseUnitId,
        reorderLevelBaseQty: ingredients.reorderLevelBaseQty,
        preferredSupplierId: ingredients.preferredSupplierId,
        isActive: ingredients.isActive,
        supplierName: suppliers.name,
        unitCode: measurementUnits.code,
      })
      .from(ingredients)
      .leftJoin(suppliers, eq(ingredients.preferredSupplierId, suppliers.id))
      .leftJoin(measurementUnits, eq(ingredients.baseUnitId, measurementUnits.id))
      .orderBy(desc(ingredients.id));

    // Map to admin format - calculate stock for each ingredient
    const enriched: AdminIngredient[] = [];
    for (const item of result) {
      // Calculate stock from movements
      const currentStock = await calculateIngredientStock(item.id, item.baseUnitId);

      enriched.push({
        id: item.id.toString(),
        sku: item.sku,
        name: item.name,
        baseUnitCode: item.unitCode || "g",
        reorderLevelBaseQty: Number(item.reorderLevelBaseQty),
        currentStockBaseQty: currentStock,
        preferredSupplier: item.supplierName || "Unknown",
        isActive: item.isActive,
      });
    }

    return enriched;
  } catch (error) {
    console.error("Error fetching admin ingredients:", error);
    return [];
  }
}

/**
 * Get all products for admin dashboard with JOINs (optimized - no N+1)
 */
export async function getAdminProducts(): Promise<AdminProduct[]> {
  try {
    const result = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        categoryId: products.categoryId,
        basePrice: products.basePrice,
        sizeLabel: products.sizeLabel,
        isCustomizable: products.isCustomizable,
        isPreorderOnly: products.isPreorderOnly,
        isActive: products.isActive,
        categoryName: productCategories.name,
      })
      .from(products)
      .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
      .orderBy(desc(products.id));

    return result.map((item) => ({
      id: item.id.toString(),
      slug: item.slug,
      name: item.name,
      category: item.categoryName || "Unknown",
      basePrice: Number(item.basePrice),
      sizeLabel: item.sizeLabel || "",
      isCustomizable: item.isCustomizable,
      isPreorderOnly: item.isPreorderOnly,
      isActive: item.isActive,
    }));
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return [];
  }
}

/**
 * Get all product categories for dropdown/forms
 */
export async function getAdminCategories(): Promise<AdminCategory[]> {
  try {
    const result = await db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        description: productCategories.description,
      })
      .from(productCategories)
      .orderBy(desc(productCategories.name));

    return result.map((cat) => ({
      id: cat.id.toString(),
      name: cat.name,
      description: cat.description,
    }));
  } catch (error) {
    console.error("Error fetching admin categories:", error);
    return [];
  }
}
