"use client";

import { useCallback, useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Toast from "@/features/admin/components/dashboard/toast";
import { Plus, ClipboardList } from "lucide-react";

type Movement = {
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
  units: { unitId: string; unitCode: string }[];
};

export default function StockOpnamePage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [ingredientOptions, setIngredientOptions] = useState<IngredientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    ingredientId: "",
    unitId: "",
    quantity: "",
    notes: "",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch("/api/admin/stock-opname");
      const payload = await response.json();
      if (response.ok && payload.success) {
        setMovements(payload.data);
        setIngredientOptions(payload.options.ingredients);
      }
    } catch {
      showToast("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedIngredient = ingredientOptions.find((i) => i.id === form.ingredientId);
  const availableUnits = selectedIngredient?.units ?? [];

  // Auto-select first unit when ingredient changes
  useEffect(() => {
    if (form.ingredientId && availableUnits.length > 0 && !availableUnits.find((u) => u.unitId === form.unitId)) {
      setForm((p) => ({ ...p, unitId: availableUnits[0].unitId }));
    }
  }, [form.ingredientId, availableUnits, form.unitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    if (!form.ingredientId || !form.unitId || qty === 0 || !Number.isFinite(qty)) {
      showToast("Lengkapi form — qty tidak boleh 0");
      return;
    }

    try {
      const response = await authenticatedFetch("/api/admin/stock-opname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId: form.ingredientId,
          unitId: form.unitId,
          quantity: qty,
          notes: form.notes || null,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error();

      // Refresh data to get updated info
      await loadData();
      setForm({ ingredientId: "", unitId: "", quantity: "", notes: "" });
      showToast("Stock opname berhasil dicatat");
    } catch {
      showToast("Gagal menyimpan stock opname");
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 pb-12 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary">Stock Opname</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Catat penyesuaian stok fisik (+/-) dari hasil pengecekan.
        </p>
      </div>

      {/* Add Adjustment Form */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <CardTitle className="text-base">Catat Penyesuaian</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Ingredient
                </label>
                <select
                  value={form.ingredientId}
                  onChange={(e) => setForm((p) => ({ ...p, ingredientId: e.target.value, unitId: "" }))}
                  className="bg-card border border-border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
                  required
                >
                  <option value="">Pilih ingredient...</option>
                  {ingredientOptions.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} — stok: {ing.stock} {ing.baseUnitCode}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Unit
                </label>
                <select
                  value={form.unitId}
                  onChange={(e) => setForm((p) => ({ ...p, unitId: e.target.value }))}
                  className="bg-card border border-border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
                  required
                  disabled={!form.ingredientId}
                >
                  <option value="">Pilih unit...</option>
                  {availableUnits.map((u) => (
                    <option key={u.unitId} value={u.unitId}>{u.unitCode}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Qty Penyesuaian
                  <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
                    (+ masuk, - keluar)
                  </span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.quantity}
                  onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  placeholder="e.g. 500 atau -200"
                  className="bg-card border-border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Catatan (opsional)
                </label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="e.g. Rusak, tumpah, transfer"
                  className="bg-card border-border rounded-lg"
                />
              </div>
            </div>

            <Button type="submit" className="gap-1">
              <Plus className="size-4" /> Simpan Penyesuaian
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <CardTitle className="text-base">
            Riwayat Penyesuaian
            <span className="ml-2 text-sm font-normal text-muted-foreground">{movements.length} record</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="size-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <ClipboardList className="size-10 opacity-30 mb-2" />
              <p className="text-sm">Belum ada penyesuaian tercatat.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Header */}
              <div className="grid grid-cols-[1fr_100px_80px_1fr] gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 rounded-lg">
                <span>Ingredient</span>
                <span>Qty</span>
                <span>Unit</span>
                <span>Tanggal & Catatan</span>
              </div>

              {movements.map((mv) => (
                <div
                  key={mv.id}
                  className="grid grid-cols-[1fr_100px_80px_1fr] gap-3 items-center px-4 py-2.5 rounded-lg border border-border bg-card"
                >
                  <p className="text-sm font-medium truncate">{mv.ingredientName}</p>
                  <p className={`text-sm font-semibold tabular-nums ${
                    mv.quantity > 0 ? "text-[#7BAE8F]" : "text-[#C0646C]"
                  }`}>
                    {mv.quantity > 0 ? "+" : ""}{mv.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">{mv.unitCode}</p>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(mv.movementAt).toLocaleDateString("id-ID", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    {mv.notes && <p className="text-xs text-muted-foreground/70 truncate">{mv.notes}</p>}
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
