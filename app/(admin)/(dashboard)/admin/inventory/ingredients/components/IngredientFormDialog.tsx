import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, X, Scale, Truck } from "lucide-react";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/auth/client";

const UNIT_TYPES = [
  { value: "mass", label: "Massa (g, kg, ...)" },
  { value: "volume", label: "Volume (ml, l, ...)" },
  { value: "count", label: "Hitungan (pcs, lusin, ...)" },
  { value: "package", label: "Kemasan (tray, box, ...)" },
];

export function IngredientFormDialog({
  isOpen,
  onClose,
  units,
  suppliers,
  onSubmit,
  initialData,
  onDataRefreshed,
}: any) {
  const [form, setForm] = useState({ name: "", reorder: "", baseUnitId: "", supplierId: "" });
  
  // Inline Add states
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [unitForm, setUnitForm] = useState({ code: "", name: "", unitType: "mass" });
  const [isAddingUnit, setIsAddingUnit] = useState(false);

  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: "", contactName: "", phone: "" });
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);

  useEffect(() => {
    if (initialData) {
      const unitId = units.find((u: any) => u.code === initialData.baseUnitCode)?.id.toString() || (units.length > 0 ? units[0].id.toString() : "");
      const suppId = suppliers.find((s: any) => s.name === initialData.preferredSupplier)?.id.toString() || "";
      setForm({
        name: initialData.name || "",
        reorder: initialData.reorderLevelBaseQty?.toString() || "0",
        baseUnitId: unitId,
        supplierId: suppId,
      });
    } else {
      setForm({
        name: "",
        reorder: "",
        baseUnitId: units.length > 0 ? units[0].id.toString() : "",
        supplierId: "",
      });
    }
  }, [initialData, units, suppliers, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...form, reorderLevelBaseQty: Number(form.reorder) });
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUnit(true);
    try {
      const res = await authenticatedFetch("/api/admin/measurement-units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitForm),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message);
      toast.success("Unit ditambahkan");
      setShowNewUnit(false);
      setUnitForm({ code: "", name: "", unitType: "mass" });
      onDataRefreshed(); // trigger parent reload
      setForm((p) => ({ ...p, baseUnitId: payload.data.id.toString() }));
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan unit");
    } finally {
      setIsAddingUnit(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingSupplier(true);
    try {
      const res = await authenticatedFetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierForm),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message);
      toast.success("Supplier ditambahkan");
      setShowNewSupplier(false);
      setSupplierForm({ name: "", contactName: "", phone: "" });
      onDataRefreshed(); // trigger parent reload
      setForm((p) => ({ ...p, supplierId: payload.data.id.toString() }));
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan supplier");
    } finally {
      setIsAddingSupplier(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Ingredient" : "Tambah Ingredient"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Nama</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full h-10 bg-card border-border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Tepung Terigu"
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
              className="w-full h-10 bg-card border-border rounded-lg px-3 py-2 text-sm"
              placeholder="Jumlah minimal sebelum restock"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Satuan</label>
            <div className="flex gap-2 items-center">
              <select
                value={form.baseUnitId}
                onChange={(e) => setForm((p) => ({ ...p, baseUnitId: e.target.value }))}
                className="flex-1 h-10 bg-card border border-border rounded-lg px-3 py-2 text-sm"
                required
              >
                <option value="" disabled>Pilih satuan</option>
                {units.map((u: any) => (
                  <option key={u.id} value={u.id.toString()}>{u.code} — {u.name}</option>
                ))}
              </select>
              <Button type="button" variant="outline" size="icon" onClick={() => { setShowNewUnit(!showNewUnit); setShowNewSupplier(false); }}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Supplier</label>
            <div className="flex gap-2 items-center">
              <select
                value={form.supplierId}
                onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))}
                className="flex-1 h-10 bg-card border border-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Tanpa supplier</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id.toString()}>{s.name}</option>
                ))}
              </select>
              <Button type="button" variant="outline" size="icon" onClick={() => { setShowNewSupplier(!showNewSupplier); setShowNewUnit(false); }}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full gap-1">
            {initialData ? <><Check className="size-4" /> Simpan</> : <><Plus className="size-4" /> Tambah</>}
          </Button>
        </form>

        {showNewUnit && (
          <div className="mt-4 p-4 border rounded-md bg-muted/20 relative">
            <button onClick={() => setShowNewUnit(false)} className="absolute top-2 right-2 text-muted-foreground"><X className="size-4" /></button>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Scale className="size-4"/> Tambah Satuan</h4>
            <form onSubmit={handleAddUnit} className="space-y-3">
              <Input placeholder="Kode (cth: kg)" value={unitForm.code} onChange={(e) => setUnitForm((p) => ({ ...p, code: e.target.value }))} required />
              <Input placeholder="Nama (cth: Kilogram)" value={unitForm.name} onChange={(e) => setUnitForm((p) => ({ ...p, name: e.target.value }))} required />
              <select value={unitForm.unitType} onChange={(e) => setUnitForm((p) => ({ ...p, unitType: e.target.value }))} className="w-full h-10 rounded-md border bg-transparent px-3 py-2 text-sm" required>
                {UNIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <Button type="submit" size="sm" disabled={isAddingUnit} className="w-full">Simpan Satuan</Button>
            </form>
          </div>
        )}

        {showNewSupplier && (
          <div className="mt-4 p-4 border rounded-md bg-muted/20 relative">
            <button onClick={() => setShowNewSupplier(false)} className="absolute top-2 right-2 text-muted-foreground"><X className="size-4" /></button>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Truck className="size-4"/> Tambah Supplier</h4>
            <form onSubmit={handleAddSupplier} className="space-y-3">
              <Input
                placeholder="Nama Supplier"
                value={supplierForm.name}
                onChange={(e) => setSupplierForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-10 bg-card border-border rounded-lg px-3 py-2 text-sm"
                required />
              <Input
                placeholder="Kontak (Opsional)"
                value={supplierForm.contactName}
                onChange={(e) => setSupplierForm((p) => ({ ...p, contactName: e.target.value }))}
                className="w-full h-10 bg-card border-border rounded-lg px-3 py-2 text-sm"
              />
              <Input
                placeholder="Telepon (Opsional)"
                value={supplierForm.phone}
                onChange={(e) => setSupplierForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full h-10 bg-card border-border rounded-lg px-3 py-2 text-sm"
              />
              <Button type="submit" size="sm" disabled={isAddingSupplier} className="w-full">Simpan Supplier</Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
