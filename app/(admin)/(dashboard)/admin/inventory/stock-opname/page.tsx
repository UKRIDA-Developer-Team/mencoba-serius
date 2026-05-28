"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Toast from "@/features/admin/components/dashboard/toast";

type StockOpnameRow = {
  id: string;
  ingredientId: string;
  unitId: string;
  quantity: number;
  movementAt: string;
  notes: string | null;
  ingredientName: string;
  unitCode: string;
};

type IngredientOption = {
  id: string;
  name: string;
  stock: number;
  baseUnitCode: string;
  units: Array<{ unitId: string; unitCode: string }>;
};

export default function StockOpnamePage() {
  const [records, setRecords] = useState<StockOpnameRow[]>([]);
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ ingredientId: "", unitId: "", quantity: "", notes: "" });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch("/api/admin/stock-opname");
      const payload = await response.json();
      if (response.ok && payload.success) {
        setRecords(payload.data);
        setIngredients(payload.options.ingredients);
        setForm((prev) => {
          if (prev.ingredientId || payload.options.ingredients.length === 0) {
            return prev;
          }
          const firstIngredient = payload.options.ingredients[0] as IngredientOption;
          return {
            ...prev,
            ingredientId: firstIngredient.id,
            unitId: firstIngredient.units[0]?.unitId ?? "",
          };
        });
      }
    } catch {
      showToast("Gagal memuat data stock opname");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedIngredient = useMemo(
    () => ingredients.find((item) => item.id === form.ingredientId),
    [ingredients, form.ingredientId]
  );

  useEffect(() => {
    if (!selectedIngredient) return;
    if (!selectedIngredient.units.some((unit) => unit.unitId === form.unitId)) {
      setForm((prev) => ({ ...prev, unitId: selectedIngredient.units[0]?.unitId ?? "" }));
    }
  }, [form.unitId, selectedIngredient]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = Number(form.quantity);

    if (!form.ingredientId || !form.unitId || !Number.isFinite(quantity) || quantity === 0) {
      showToast("Isi ingredient, unit, dan quantity (tidak boleh 0)");
      return;
    }

    try {
      const response = await authenticatedFetch("/api/admin/stock-opname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId: form.ingredientId,
          unitId: form.unitId,
          quantity,
          notes: form.notes,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error();

      showToast("Stock opname disimpan");
      setForm((prev) => ({ ...prev, quantity: "", notes: "" }));
      await loadData();
    } catch {
      showToast("Gagal menyimpan stock opname");
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 pb-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Stock Opname</h1>
        <p className="text-sm text-foreground/70 mt-1">Catat penyesuaian stok bahan dari hasil pengecekan fisik.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Penyesuaian</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Ingredient</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                value={form.ingredientId}
                onChange={(event) => setForm((prev) => ({ ...prev, ingredientId: event.target.value }))}
                required
              >
                {ingredients.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </option>
                ))}
              </select>
              {selectedIngredient ? (
                <p className="text-xs text-muted-foreground">
                  Stok saat ini: {selectedIngredient.stock} {selectedIngredient.baseUnitCode}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Unit</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                value={form.unitId}
                onChange={(event) => setForm((prev) => ({ ...prev, unitId: event.target.value }))}
                required
              >
                {selectedIngredient?.units.map((unit) => (
                  <option key={unit.unitId} value={unit.unitId}>
                    {unit.unitCode}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Quantity (+/-)</label>
              <Input
                type="number"
                step="0.0001"
                value={form.quantity}
                onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                placeholder="contoh: -150"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Catatan</label>
              <Input
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Opsional"
              />
            </div>

            <Button type="submit">Simpan</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Stock Opname</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada catatan stock opname.</p>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div key={record.id} className="p-3 border rounded-lg grid md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-sm font-medium">{record.ingredientName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(record.movementAt).toLocaleString("id-ID")}</p>
                  </div>
                  <p className="text-sm">
                    {record.quantity > 0 ? "+" : ""}
                    {record.quantity} {record.unitCode}
                  </p>
                  <p className="text-sm text-muted-foreground">{record.notes || "-"}</p>
                  <p className="text-xs text-muted-foreground">Ref: stock_opname</p>
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
