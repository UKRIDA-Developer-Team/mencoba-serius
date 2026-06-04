"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Toast from "@/features/admin/components/dashboard/toast";
import { Search, Plus, Edit3, Check, X, Trash2, Package, Scale, Truck } from "lucide-react";

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

type MeasurementUnit = {
  id: string;
  code: string;
  name: string;
  unitType: string;
};

type Supplier = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
};

const UNIT_TYPES = [
  { value: "mass", label: "Massa (g, kg, ...)" },
  { value: "volume", label: "Volume (ml, l, ...)" },
  { value: "count", label: "Hitungan (pcs, lusin, ...)" },
  { value: "package", label: "Kemasan (tray, box, ...)" },
];

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
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ name: "", reorder: "", baseUnitId: "", supplierId: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", reorder: "", baseUnitId: "", supplierId: "" });

  // New unit form state
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [unitForm, setUnitForm] = useState({ code: "", name: "", unitType: "mass" });
  const [isAddingUnit, setIsAddingUnit] = useState(false);

  // New supplier form state
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: "", contactName: "", phone: "" });
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ingRes, unitRes, supplierRes] = await Promise.all([
        authenticatedFetch("/api/admin/ingredients"),
        authenticatedFetch("/api/admin/measurement-units"),
        authenticatedFetch("/api/admin/suppliers"),
      ]);
      
      const ingPayload = await ingRes.json();
      const unitPayload = await unitRes.json();
      const supplierPayload = await supplierRes.json();
      
      if (ingRes.ok && ingPayload.success) {
        setIngredients(ingPayload.data);
      }
      if (unitRes.ok && unitPayload.success) {
        setUnits(unitPayload.data);
        if (unitPayload.data.length > 0) {
          setForm(prev => ({ ...prev, baseUnitId: unitPayload.data[0].id.toString() }));
        }
      }
      if (supplierRes.ok && supplierPayload.success) {
        setSuppliers(supplierPayload.data);
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

  const filteredIngredients = useMemo(() => {
    if (!search.trim()) return ingredients;
    const q = search.toLowerCase();
    return ingredients.filter(
      (item) => item.name.toLowerCase().includes(q)
    );
  }, [ingredients, search]);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reorder = Number(form.reorder || 0);
    if (!form.name || !form.baseUnitId || reorder < 0) {
      showToast("Data ingredient tidak valid");
      return;
    }

    try {
      const response = await authenticatedFetch("/api/admin/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          baseUnitId: form.baseUnitId,
          reorderLevelBaseQty: reorder,
          supplierId: form.supplierId || undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error();

      setIngredients((prev) => [payload.data, ...prev]);
      setForm({ name: "", reorder: "", baseUnitId: units.length > 0 ? units[0].id.toString() : "", supplierId: "" });
      showToast("Ingredient ditambahkan");
    } catch {
      showToast("Gagal menambahkan ingredient");
    }
  };

  const handleAddUnit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!unitForm.code.trim() || !unitForm.name.trim()) {
      showToast("Kode dan nama unit wajib diisi");
      return;
    }

    setIsAddingUnit(true);
    try {
      const response = await authenticatedFetch("/api/admin/measurement-units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: unitForm.code,
          name: unitForm.name,
          unitType: unitForm.unitType,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        showToast(payload.message || "Gagal menambahkan unit");
        return;
      }

      const newUnit = payload.data;
      setUnits((prev) => [...prev, newUnit]);
      setForm((prev) => ({ ...prev, baseUnitId: newUnit.id }));
      setUnitForm({ code: "", name: "", unitType: "mass" });
      setShowNewUnit(false);
      showToast(`Unit "${newUnit.code}" berhasil ditambahkan`);
    } catch {
      showToast("Gagal menambahkan unit");
    } finally {
      setIsAddingUnit(false);
    }
  };

  const handleAddSupplier = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supplierForm.name.trim()) {
      showToast("Nama supplier wajib diisi");
      return;
    }

    setIsAddingSupplier(true);
    try {
      const response = await authenticatedFetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: supplierForm.name,
          contactName: supplierForm.contactName || undefined,
          phone: supplierForm.phone || undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        showToast(payload.message || "Gagal menambahkan supplier");
        return;
      }

      const newSupplier = payload.data;
      setSuppliers((prev) => [...prev, newSupplier]);
      setForm((prev) => ({ ...prev, supplierId: newSupplier.id }));
      setSupplierForm({ name: "", contactName: "", phone: "" });
      setShowNewSupplier(false);
      showToast(`Supplier "${newSupplier.name}" berhasil ditambahkan`);
    } catch {
      showToast("Gagal menambahkan supplier");
    } finally {
      setIsAddingSupplier(false);
    }
  };

  const startEdit = (ingredient: Ingredient) => {
    setEditId(ingredient.id);
    const unitId = units.find(u => u.code === ingredient.baseUnitCode)?.id.toString() || (units.length > 0 ? units[0].id.toString() : "");
    const suppId = suppliers.find(s => s.name === ingredient.preferredSupplier)?.id.toString() || "";
    setEditForm({
      name: ingredient.name,
      baseUnitId: unitId,
      reorder: ingredient.reorderLevelBaseQty.toString(),
      supplierId: suppId,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: "", reorder: "", baseUnitId: "", supplierId: "" });
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
          baseUnitId: editForm.baseUnitId,
          reorderLevelBaseQty: reorder,
          supplierId: editForm.supplierId || undefined,
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
        <CardContent className="space-y-4">
          <form onSubmit={handleAdd} className="grid sm:grid-cols-5 gap-3 items-end">
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
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Satuan</label>
              <div className="flex gap-1.5">
                <select
                  value={form.baseUnitId}
                  onChange={(e) => setForm((p) => ({ ...p, baseUnitId: e.target.value }))}
                  className="h-7 w-full rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
                  required
                >
                  <option value="" disabled>Pilih satuan</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id.toString()}>{u.code} — {u.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => { setShowNewUnit(!showNewUnit); setShowNewSupplier(false); }}
                  className={`flex-shrink-0 size-7 rounded-md border flex items-center justify-center transition-all ${
                    showNewUnit
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-input text-muted-foreground hover:text-accent hover:border-accent/50"
                  }`}
                  title="Tambah satuan baru"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Supplier</label>
              <div className="flex gap-1.5">
                <select
                  value={form.supplierId}
                  onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))}
                  className="h-7 w-full rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
                >
                  <option value="">Tanpa supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => { setShowNewSupplier(!showNewSupplier); setShowNewUnit(false); }}
                  className={`flex-shrink-0 size-7 rounded-md border flex items-center justify-center transition-all ${
                    showNewSupplier
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-input text-muted-foreground hover:text-accent hover:border-accent/50"
                  }`}
                  title="Tambah supplier baru"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
            <Button type="submit" className="gap-1">
              <Plus className="size-4" /> Tambah
            </Button>
          </form>

          {/* New Unit Inline Form */}
          {showNewUnit && (
            <div className="relative">
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="size-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">Tambah Satuan Baru</span>
                  <button
                    type="button"
                    onClick={() => { setShowNewUnit(false); setUnitForm({ code: "", name: "", unitType: "mass" }); }}
                    className="ml-auto p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <form onSubmit={handleAddUnit} className="grid sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Kode</label>
                    <Input
                      value={unitForm.code}
                      onChange={(e) => setUnitForm((p) => ({ ...p, code: e.target.value }))}
                      placeholder="cth: tbsp"
                      className="bg-card border-border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Nama</label>
                    <Input
                      value={unitForm.name}
                      onChange={(e) => setUnitForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="cth: Tablespoon"
                      className="bg-card border-border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tipe</label>
                    <select
                      value={unitForm.unitType}
                      onChange={(e) => setUnitForm((p) => ({ ...p, unitType: e.target.value }))}
                      className="h-7 w-full rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
                      required
                    >
                      {UNIT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" disabled={isAddingUnit} className="gap-1" variant="outline">
                    {isAddingUnit ? (
                      <>
                        <div className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check className="size-4" /> Simpan Unit
                      </>
                    )}
                  </Button>
                </form>
                <p className="text-[11px] text-muted-foreground">
                  Unit yang ditambahkan akan langsung tersedia di dropdown satuan.
                </p>
              </div>
            </div>
          )}

          {/* New Supplier Inline Form */}
          {showNewSupplier && (
            <div className="relative">
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="size-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">Tambah Supplier Baru</span>
                  <button
                    type="button"
                    onClick={() => { setShowNewSupplier(false); setSupplierForm({ name: "", contactName: "", phone: "" }); }}
                    className="ml-auto p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <form onSubmit={handleAddSupplier} className="grid sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Nama Supplier</label>
                    <Input
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="cth: Fresh Dairy Co"
                      className="bg-card border-border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Kontak</label>
                    <Input
                      value={supplierForm.contactName}
                      onChange={(e) => setSupplierForm((p) => ({ ...p, contactName: e.target.value }))}
                      placeholder="cth: Budi Santoso"
                      className="bg-card border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Telepon</label>
                    <Input
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="cth: +62-812-xxxx"
                      className="bg-card border-border rounded-lg"
                    />
                  </div>
                  <Button type="submit" disabled={isAddingSupplier} className="gap-1" variant="outline">
                    {isAddingSupplier ? (
                      <>
                        <div className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check className="size-4" /> Simpan Supplier
                      </>
                    )}
                  </Button>
                </form>
                <p className="text-[11px] text-muted-foreground">
                  Supplier yang ditambahkan akan langsung tersedia di dropdown.
                </p>
              </div>
            </div>
          )}
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
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            className="bg-card border border-border rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-accent/40"
                            value={editForm.name}
                            onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              className="bg-card border border-border rounded px-2 py-1 text-sm w-16 focus:outline-none focus:ring-1 focus:ring-accent/40"
                              value={editForm.reorder}
                              onChange={(e) => setEditForm((p) => ({ ...p, reorder: e.target.value }))}
                            />
                            <select
                              value={editForm.baseUnitId}
                              onChange={(e) => setEditForm((p) => ({ ...p, baseUnitId: e.target.value }))}
                              className="bg-card border border-input rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-accent/40 dark:bg-input/30"
                            >
                              {units.map(u => (
                                <option key={u.id} value={u.id.toString()}>{u.code}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <select
                          value={editForm.supplierId}
                          onChange={(e) => setEditForm((p) => ({ ...p, supplierId: e.target.value }))}
                          className="bg-card border border-input rounded px-1 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-accent/40 dark:bg-input/30"
                        >
                          <option value="">Tanpa supplier</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium">{ingredient.name}</p>
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
