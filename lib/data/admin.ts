import { db } from "@/lib/db";
import { ingredients, products, productCategories, suppliers, measurementUnits, ingredientStockMovements } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

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
        eq(ingredientStockMovements.ingredientId, ingredientId) &&
        eq(ingredientStockMovements.unitId, baseUnitId)
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
 * Get all ingredients for admin dashboard
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
      })
      .from(ingredients)
      .orderBy(desc(ingredients.id));

    // Map to admin format with supplier names and unit codes
    const enriched: AdminIngredient[] = [];
    for (const item of result) {
      // Fetch supplier name
      let supplierName = "Unknown";
      if (item.preferredSupplierId) {
        const supplier = await db
          .select({ name: suppliers.name })
          .from(suppliers)
          .where(eq(suppliers.id, item.preferredSupplierId));
        if (supplier.length > 0) {
          supplierName = supplier[0].name;
        }
      }

      // Fetch unit code
      let unitCode = "g";
      const unit = await db
        .select({ code: measurementUnits.code })
        .from(measurementUnits)
        .where(eq(measurementUnits.id, item.baseUnitId));
      if (unit.length > 0) {
        unitCode = unit[0].code;
      }

      // Calculate stock from movements
      const currentStock = await calculateIngredientStock(item.id, item.baseUnitId);

      enriched.push({
        id: item.id.toString(),
        sku: item.sku,
        name: item.name,
        baseUnitCode: unitCode,
        reorderLevelBaseQty: Number(item.reorderLevelBaseQty),
        currentStockBaseQty: currentStock,
        preferredSupplier: supplierName,
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
 * Get all products for admin dashboard
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
      })
      .from(products)
      .orderBy(desc(products.id));

    // Map to admin format with category names
    const enriched: AdminProduct[] = [];
    for (const item of result) {
      // Fetch category name
      const category = await db
        .select({ name: productCategories.name })
        .from(productCategories)
        .where(eq(productCategories.id, item.categoryId));

      enriched.push({
        id: item.id.toString(),
        slug: item.slug,
        name: item.name,
        category: category.length > 0 ? category[0].name : "Unknown",
        basePrice: Number(item.basePrice),
        sizeLabel: item.sizeLabel || "",
        isCustomizable: item.isCustomizable,
        isPreorderOnly: item.isPreorderOnly,
        isActive: item.isActive,
      });
    }

    return enriched;
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
