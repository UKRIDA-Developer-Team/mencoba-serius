"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Toast from "@/features/admin/components/dashboard/toast";
import { Search, Plus, Edit3, Check, X, Trash2, Package } from "lucide-react";

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

function StockIndicator({ current, reorder }: { current: number; reorder: number }) {
  const ratio = reorder > 0 ? Math.min(current / reorder, 2) : (current > 0 ? 2 : 0);
  const pct = Math.min(ratio * 50, 100);
  const color = ratio < 0.5 ? "bg-destructive" : ratio < 1 ? "bg-[#D4935A]" : "bg-[#7BAE8F]";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

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

  const lowCount = useMemo(
    () => ingredients.filter((i) => i.currentStockBaseQty < i.reorderLevelBaseQty).length,
    [ingredients]
  );

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 pb-12 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary">Manajemen Ingredients</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola data bahan baku untuk inventory.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{ingredients.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aktif</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{ingredients.filter((i) => i.isActive).length}</p>
        </div>
        <div className={`rounded-xl border p-4 ${lowCount > 0 ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Low Stock</p>
          <p className={`text-2xl font-bold mt-1 tabular-nums ${lowCount > 0 ? "text-destructive" : ""}`}>{lowCount}</p>
        </div>
      </div>

      {/* Add Form */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <CardTitle className="text-base">Tambah Ingredient</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Nama</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="bg-card border-border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">SKU</label>
              <Input
                value={form.sku}
                onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                className="bg-card border-border rounded-lg font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Reorder Level</label>
              <Input
                type="number"
                min={0}
                value={form.reorder}
                onChange={(e) => setForm((p) => ({ ...p, reorder: e.target.value }))}
                className="bg-card border-border rounded-lg"
                required
              />
            </div>
            <Button type="submit" className="gap-1">
              <Plus className="size-4" /> Tambah
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Ingredients List */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">
              Daftar Ingredients
              <span className="ml-2 text-sm font-normal text-muted-foreground">{filteredIngredients.length} item</span>
            </CardTitle>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ingredient..."
                className="pl-9 bg-card border-border rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="size-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : filteredIngredients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Package className="size-10 opacity-30 mb-2" />
              <p className="text-sm">Belum ada ingredient.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_100px_120px_80px_auto] gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 rounded-lg">
                <span>Ingredient</span>
                <span>Stok</span>
                <span>Supplier</span>
                <span>Level</span>
                <span className="text-right">Aksi</span>
              </div>

              {filteredIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className={`grid grid-cols-[1fr_100px_120px_80px_auto] gap-3 items-center px-4 py-2.5 rounded-lg border transition-colors ${
                    ingredient.isActive ? "border-border bg-card" : "border-border/50 bg-muted/20"
                  }`}
                >
                  {/* Name / Edit */}
                  <div>
                    {editId === ingredient.id ? (
                      <div className="flex gap-2">
                        <input
                          className="bg-card border border-border rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-accent/40"
                          value={editForm.name}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        />
                        <input
                          className="bg-card border border-border rounded px-2 py-1 text-sm w-20 font-mono focus:outline-none focus:ring-1 focus:ring-accent/40"
                          value={editForm.sku}
                          onChange={(e) => setEditForm((p) => ({ ...p, sku: e.target.value }))}
                        />
                        <input
                          type="number"
                          min={0}
                          className="bg-card border border-border rounded px-2 py-1 text-sm w-16 focus:outline-none focus:ring-1 focus:ring-accent/40"
                          value={editForm.reorder}
                          onChange={(e) => setEditForm((p) => ({ ...p, reorder: e.target.value }))}
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium">{ingredient.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{ingredient.sku}</p>
                      </>
                    )}
                  </div>

                  {/* Stock */}
                  <div>
                    <p className="text-sm tabular-nums">
                      {ingredient.currentStockBaseQty} {ingredient.baseUnitCode}
                    </p>
                    <StockIndicator current={ingredient.currentStockBaseQty} reorder={ingredient.reorderLevelBaseQty} />
                  </div>

                  {/* Supplier */}
                  <p className="text-xs text-muted-foreground truncate">{ingredient.preferredSupplier || "—"}</p>

                  {/* Reorder */}
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {ingredient.reorderLevelBaseQty} {ingredient.baseUnitCode}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    {editId === ingredient.id ? (
                      <>
                        <button onClick={saveEdit} className="p-1 text-green-600 hover:text-green-700">
                          <Check className="size-3.5" />
                        </button>
                        <button onClick={cancelEdit} className="p-1 text-muted-foreground hover:text-foreground">
                          <X className="size-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(ingredient)} className="p-1 text-muted-foreground hover:text-accent">
                          <Edit3 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => toggleActive(ingredient)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            ingredient.isActive
                              ? "bg-[#7BAE8F]/15 text-[#7BAE8F]"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ingredient.isActive ? "Aktif" : "Nonaktif"}
                        </button>
                        <button onClick={() => removeIngredient(ingredient.id)} className="p-1 text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-3.5" />
                        </button>
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
