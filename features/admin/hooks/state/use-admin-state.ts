import { useState, useEffect, useCallback } from "react";
import { type AdminIngredient, type AdminProduct } from "@/lib/data/admin";

interface UseAdminStateReturn {
  ingredients: AdminIngredient[];
  setIngredients: (items: AdminIngredient[] | ((prev: AdminIngredient[]) => AdminIngredient[])) => void;
  products: AdminProduct[];
  setProducts: (items: AdminProduct[] | ((prev: AdminProduct[]) => AdminProduct[])) => void;
  ingredientSearch: string;
  setIngredientSearch: (search: string) => void;
  productSearch: string;
  setProductSearch: (search: string) => void;
}

export function useAdminState(
  initialIngredients: AdminIngredient[],
  initialProducts: AdminProduct[]
): UseAdminStateReturn {
  const [ingredients, setIngredientsState] = useState<AdminIngredient[]>([]);
  const [products, setProductsState] = useState<AdminProduct[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Sync with API data changes - only update when data actually changes
  useEffect(() => {
    setIngredientsState(initialIngredients);
  }, [initialIngredients.length]);

  useEffect(() => {
    setProductsState(initialProducts);
  }, [initialProducts.length]);

  // Wrapper to accept both values and updater functions
  const setIngredients = useCallback((items: AdminIngredient[] | ((prev: AdminIngredient[]) => AdminIngredient[])) => {
    if (typeof items === "function") {
      setIngredientsState(items);
    } else {
      setIngredientsState(items);
    }
  }, []);

  const setProducts = useCallback((items: AdminProduct[] | ((prev: AdminProduct[]) => AdminProduct[])) => {
    if (typeof items === "function") {
      setProductsState(items);
    } else {
      setProductsState(items);
    }
  }, []);

  return {
    ingredients,
    setIngredients,
    products,
    setProducts,
    ingredientSearch,
    setIngredientSearch,
    productSearch,
    setProductSearch,
  };
}
