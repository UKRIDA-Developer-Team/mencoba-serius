"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Toast from "@/features/admin/components/dashboard/toast";

type Ingredient = {
  id: string;
  sku: string;
  name: string;
  baseUnitCode: string;
  reorderLevelBaseQty: number;
  currentStockBaseQty: number;
  preferredSupplier: string;
  isActive: boolean;
};

export default function InventoryIngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ name: "", sku: "", reorder: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", sku: "", reorder: "" });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const loadIngredients = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch("/api/admin/ingredients");
      const payload = await response.json();
      if (response.ok && payload.success) {
        setIngredients(payload.data);
      }
    } catch {
      showToast("Gagal memuat ingredients");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  const filteredIngredients = useMemo(() => {
    if (!search.trim()) return ingredients;
    const q = search.toLowerCase();
    return ingredients.filter(
      (item) => item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)
    );
  }, [ingredients, search]);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reorder = Number(form.reorder || 0);
    if (!form.name || !form.sku || reorder < 0) {
      showToast("Data ingredient tidak valid");
      return;
    }

    try {
      const response = await authenticatedFetch("/api/admin/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          reorderLevelBaseQty: reorder,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error();

      setIngredients((prev) => [payload.data, ...prev]);
      setForm({ name: "", sku: "", reorder: "" });
      showToast("Ingredient ditambahkan");
    } catch {
      showToast("Gagal menambahkan ingredient");
    }
  };

  const startEdit = (ingredient: Ingredient) => {
    setEditId(ingredient.id);
    setEditForm({
      name: ingredient.name,
      sku: ingredient.sku,
      reorder: ingredient.reorderLevelBaseQty.toString(),
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: "", sku: "", reorder: "" });
  };

  const saveEdit = async () => {
    if (!editId) return;
    const reorder = Number(editForm.reorder || 0);

    try {
      const response = await authenticatedFetch("/api/admin/ingredients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          name: editForm.name,
          sku: editForm.sku,
          reorderLevelBaseQty: reorder,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success || !payload.data) throw new Error();

      setIngredients((prev) => prev.map((item) => (item.id === editId ? payload.data : item)));
      cancelEdit();
      showToast("Ingredient diperbarui");
    } catch {
      showToast("Gagal memperbarui ingredient");
    }
  };

  const toggleActive = async (ingredient: Ingredient) => {
    try {
      const response = await authenticatedFetch("/api/admin/ingredients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ingredient.id, isActive: !ingredient.isActive }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error();

      setIngredients((prev) =>
        prev.map((item) =>
          item.id === ingredient.id ? { ...item, isActive: !item.isActive } : item
        )
      );
      showToast("Status ingredient diperbarui");
    } catch {
      showToast("Gagal memperbarui status");
    }
  };

  const removeIngredient = async (id: string) => {
    if (!confirm("Hapus ingredient ini?")) return;

    try {
      const response = await authenticatedFetch("/api/admin/ingredients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error();

      setIngredients((prev) => prev.filter((item) => item.id !== id));
      showToast("Ingredient dihapus");
    } catch {
      showToast("Gagal menghapus ingredient");
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 pb-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Manajemen Ingredients</h1>
        <p className="text-sm text-foreground/70 mt-1">Kelola data bahan baku untuk inventory.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Ingredient</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid md:grid-cols-4 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nama</label>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">SKU</label>
              <Input
                value={form.sku}
                onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Reorder Level</label>
              <Input
                type="number"
                min={0}
                value={form.reorder}
                onChange={(event) => setForm((prev) => ({ ...prev, reorder: event.target.value }))}
                required
              />
            </div>
            <Button type="submit">Tambah</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Daftar Ingredients</CardTitle>
            <Input
              className="w-56"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari ingredient"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filteredIngredients.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada ingredient.</p>
          ) : (
            <div className="space-y-2">
              {filteredIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className={`p-3 border rounded-lg flex items-start justify-between gap-3 ${
                    ingredient.isActive ? "bg-white" : "bg-muted/40"
                  }`}
                >
                  <div className="flex-1">
                    {editId === ingredient.id ? (
                      <div className="grid md:grid-cols-3 gap-2">
                        <Input
                          value={editForm.name}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, name: event.target.value }))
                          }
                        />
                        <Input
                          value={editForm.sku}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, sku: event.target.value }))
                          }
                        />
                        <Input
                          type="number"
                          min={0}
                          value={editForm.reorder}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, reorder: event.target.value }))
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium">{ingredient.name}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU {ingredient.sku}, Stock {ingredient.currentStockBaseQty} {ingredient.baseUnitCode}, Reorder {ingredient.reorderLevelBaseQty} {ingredient.baseUnitCode}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {editId === ingredient.id ? (
                      <>
                        <Button size="sm" onClick={saveEdit}>Simpan</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          Batal
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEdit(ingredient)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={ingredient.isActive ? "secondary" : "default"}
                          onClick={() => toggleActive(ingredient)}
                        >
                          {ingredient.isActive ? "Nonaktif" : "Aktif"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeIngredient(ingredient.id)}
                        >
                          Hapus
                        </Button>
                      </>
                    )}
                  </div>
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
