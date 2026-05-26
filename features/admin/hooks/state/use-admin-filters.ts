import { useMemo } from "react";
import { type AdminIngredient, type AdminProduct } from "@/lib/data/admin";

interface UseAdminFiltersReturn {
  filteredIngredients: AdminIngredient[];
  filteredProducts: AdminProduct[];
  lowStockItems: AdminIngredient[];
  stats: {
    totalProducts: number;
    totalIngredients: number;
    totalLowStock: number;
    totalPreorderOnly: number;
  };
}

const isLowStock = (item: AdminIngredient) =>
  item.currentStockBaseQty < item.reorderLevelBaseQty;

export function useAdminFilters(
  ingredients: AdminIngredient[],
  products: AdminProduct[],
  ingredientSearch: string,
  productSearch: string
): UseAdminFiltersReturn {
  const filteredIngredients = useMemo(() => {
    if (!ingredientSearch) return ingredients;
    const q = ingredientSearch.toLowerCase();
    return ingredients.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)
    );
  }, [ingredients, ingredientSearch]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const lowStockItems = useMemo(
    () =>
      ingredients
        .filter(isLowStock)
        .sort((a, b) => a.currentStockBaseQty - b.currentStockBaseQty),
    [ingredients]
  );

  const stats = useMemo(
    () => ({
      totalProducts: products.filter((p) => p.isActive).length,
      totalIngredients: ingredients.length,
      totalLowStock: lowStockItems.length,
      totalPreorderOnly: products.filter((p) => p.isPreorderOnly && p.isActive)
        .length,
    }),
    [products, ingredients, lowStockItems]
  );

  return {
    filteredIngredients,
    filteredProducts,
    lowStockItems,
    stats,
  };
}
