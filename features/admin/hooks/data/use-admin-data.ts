import { useEffect, useState } from "react";
import { type AdminIngredient, type AdminProduct, type AdminCategory } from "@/lib/data/admin";
import { authenticatedFetch } from "@/lib/auth/client";

interface UseAdminDataReturn {
  ingredients: AdminIngredient[];
  products: AdminProduct[];
  categories: Array<{ id: string; name: string }>;
  isLoading: boolean;
  error: string | null;
}

export function useAdminData(): UseAdminDataReturn {
  const [ingredients, setIngredients] = useState<AdminIngredient[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [ingredRes, prodRes, catRes] = await Promise.all([
          authenticatedFetch("/api/admin/ingredients"),
          authenticatedFetch("/api/admin/products"),
          authenticatedFetch("/api/admin/categories"),
        ]);

        // Check each response and provide better error messages
        if (!ingredRes.ok) {
          throw new Error(`Ingredients endpoint returned ${ingredRes.status}`);
        }
        if (!prodRes.ok) {
          throw new Error(`Products endpoint returned ${prodRes.status}`);
        }
        if (!catRes.ok) {
          throw new Error(`Categories endpoint returned ${catRes.status}`);
        }

        const ingredData = await ingredRes.json();
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (ingredData.success) setIngredients(ingredData.data);
        if (prodData.success) setProducts(prodData.data);
        if (catData.success) setCategories(catData.data);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { ingredients, products, categories, isLoading, error };
}
