import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/auth/client";

export function PurchaseIngredientDialog({ isOpen, onClose, ingredient, suppliers, onPurchased }: any) {
  const [form, setForm] = useState({ supplierId: "", quantity: "", unitCost: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && ingredient) {
      // Find the supplier ID that matches the ingredient's preferredSupplier name
      const defaultSupplier = suppliers.find((s: any) => s.name === ingredient.preferredSupplier);
      setForm({
        supplierId: defaultSupplier ? defaultSupplier.id.toString() : (suppliers[0]?.id.toString() || ""),
        quantity: "",
        unitCost: "",
        notes: "",
      });
    }
  }, [isOpen, ingredient, suppliers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // First, get the correct unit ID for the ingredient (assume we purchase in base unit for simplicity in this quick UI)
      // Ideally we'd look up the ingredient's purchase unit, but we only have base unit easily available.
      // In a real robust system we'd let them pick the unit and use the multiplier.
      // We will assume quantity entered is in base units for now.
      
      // Let's fetch the ingredient's baseUnitId from the ingredients API or we could have passed it.
      // Wait, `ingredient` from the page has `baseUnitCode` but not `baseUnitId`.
      // We need `unitId`. Let's assume the user selects the unit they are purchasing in?
      // For this simple UI, we'll fetch the ingredient details to get the exact baseUnitId.
      
      const ingRes = await authenticatedFetch(`/api/admin/ingredients`);
      const ingData = await ingRes.json();
      const detailedIng = ingData.data.find((i: any) => i.id === ingredient.id);

      const res = await authenticatedFetch("/api/admin/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: form.supplierId,
          notes: form.notes,
          items: [
            {
              ingredientId: ingredient.id,
              unitId: detailedIng?.baseUnitId, // we need this from somewhere. If missing, it will fail.
              quantity: Number(form.quantity),
              unitCost: Number(form.unitCost),
              notes: "",
            }
          ]
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message);
      
      toast.success("Pembelian berhasil, stok bertambah.");
      onPurchased();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Gagal memproses pembelian");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Beli Bahan: {ingredient?.name}</DialogTitle>
          <DialogDescription>Catat pembelian untuk langsung menambah stok.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Supplier</label>
            <select
              value={form.supplierId}
              onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))}
              className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-accent"
              required
            >
              <option value="" disabled>Pilih Supplier</option>
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id.toString()}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Jumlah ({ingredient?.baseUnitCode})</label>
              <Input
                type="number"
                min={1}
                step="any"
                value={form.quantity}
                onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                className="w-full h-10 bg-card border-border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Harga Satuan (Rp)</label>
              <Input
                type="number"
                min={0}
                value={form.unitCost}
                onChange={(e) => setForm((p) => ({ ...p, unitCost: e.target.value }))}
                className="w-full h-10 bg-card border-border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Catatan</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full h-10 bg-card border-border rounded-lg px-3 py-2 text-sm"
              placeholder="Nomor nota, keterangan..."
            />
          </div>

          <Button type="submit" className="w-full gap-1 mt-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="size-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
            ) : (
              <><Check className="size-4" /> Proses Pembelian</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
