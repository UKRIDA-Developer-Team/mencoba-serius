"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Toast from "@/features/admin/components/dashboard/toast";

type RecipeRow = {
  id: string;
  productId: string;
  ingredientId: string;
  unitId: string;
  quantityPerProduct: number;
  wastagePercent: number;
  notes: string | null;
  productName: string;
  ingredientName: string;
  unitCode: string;
};

type RecipeOptions = {
  products: Array<{ id: string; name: string }>;
  ingredients: Array<{ id: string; name: string; units: Array<{ unitId: string; unitCode: string }> }>;
};

export default function ProductRecipePage() {
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [options, setOptions] = useState<RecipeOptions>({ products: [], ingredients: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    productId: "",
    ingredientId: "",
    unitId: "",
    quantityPerProduct: "",
    wastagePercent: "0",
    notes: "",
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch("/api/admin/recipes");
      const payload = await response.json();
      if (response.ok && payload.success) {
        setRecipes(payload.data);
        setOptions(payload.options);
        setForm((prev) =>
          !prev.productId && payload.options.products.length > 0
            ? { ...prev, productId: payload.options.products[0].id }
            : prev
        );
      }
    } catch {
      showToast("Gagal memuat recipe");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedIngredientUnits = useMemo(() => {
    return options.ingredients.find((item) => item.id === form.ingredientId)?.units ?? [];
  }, [options.ingredients, form.ingredientId]);

  useEffect(() => {
    if (!form.ingredientId && options.ingredients.length > 0) {
      setForm((prev) => ({ ...prev, ingredientId: options.ingredients[0].id }));
      return;
    }

    if (selectedIngredientUnits.length > 0 && !selectedIngredientUnits.some((item) => item.unitId === form.unitId)) {
      setForm((prev) => ({ ...prev, unitId: selectedIngredientUnits[0].unitId }));
    }
  }, [form.ingredientId, form.unitId, options.ingredients, selectedIngredientUnits]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantityPerProduct = Number(form.quantityPerProduct);
    const wastagePercent = Number(form.wastagePercent || 0);

    if (!form.productId || !form.ingredientId || !form.unitId || quantityPerProduct <= 0) {
      showToast("Lengkapi form recipe");
      return;
    }

    try {
      const response = await authenticatedFetch("/api/admin/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.productId,
          ingredientId: form.ingredientId,
          unitId: form.unitId,
          quantityPerProduct,
          wastagePercent,
          notes: form.notes,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error();

      showToast("Recipe berhasil disimpan");
      setForm((prev) => ({ ...prev, quantityPerProduct: "", wastagePercent: "0", notes: "" }));
      await loadData();
    } catch {
      showToast("Gagal menyimpan recipe");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus recipe ini?")) return;

    try {
      const response = await authenticatedFetch("/api/admin/recipes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error();

      setRecipes((prev) => prev.filter((item) => item.id !== id));
      showToast("Recipe dihapus");
    } catch {
      showToast("Gagal menghapus recipe");
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 pb-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Manajemen Recipe Produk</h1>
        <p className="text-sm text-foreground/70 mt-1">Atur komposisi bahan untuk setiap produk.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah / Update Recipe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-6 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Produk</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                value={form.productId}
                onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
                required
              >
                {options.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Ingredient</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                value={form.ingredientId}
                onChange={(event) => setForm((prev) => ({ ...prev, ingredientId: event.target.value }))}
                required
              >
                {options.ingredients.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Unit</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                value={form.unitId}
                onChange={(event) => setForm((prev) => ({ ...prev, unitId: event.target.value }))}
                required
              >
                {selectedIngredientUnits.map((unit) => (
                  <option key={unit.unitId} value={unit.unitId}>
                    {unit.unitCode}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Qty / Produk</label>
              <Input
                type="number"
                min={0.0001}
                step="0.0001"
                value={form.quantityPerProduct}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, quantityPerProduct: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Wastage (%)</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.wastagePercent}
                onChange={(event) => setForm((prev) => ({ ...prev, wastagePercent: event.target.value }))}
              />
            </div>

            <Button type="submit">Simpan</Button>

            <div className="md:col-span-6 space-y-1">
              <label className="text-sm font-medium">Catatan</label>
              <Input
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Opsional"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Recipe</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : recipes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada recipe.</p>
          ) : (
            <div className="space-y-2">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="p-3 border rounded-lg flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{recipe.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {recipe.ingredientName} · {recipe.quantityPerProduct} {recipe.unitCode} · Wastage {recipe.wastagePercent}%
                    </p>
                    {recipe.notes ? <p className="text-xs text-muted-foreground mt-1">{recipe.notes}</p> : null}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(recipe.id)}>
                    Hapus
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Toast message={toast} />
    </section>
  );
}
