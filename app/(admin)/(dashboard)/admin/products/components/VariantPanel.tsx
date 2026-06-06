import React, { useCallback, useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X, Edit3, Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ProductVariant = {
  id: string; productId: string; label: string;
  priceOverride: number | null; isActive: boolean; sortOrder: number;
};

function formatIDR(value: number) {
  return `Rp\u00a0${value.toLocaleString("id-ID")}`;
}

export function VariantPanel({ productId }: { productId: string }) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ label: "", price: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: "", price: "" });

  const load = useCallback(async () => {
    try {
      const res = await authenticatedFetch(`/api/admin/products/${productId}/variants`);
      const data = await res.json();
      if (data.success) setVariants(data.data);
    } catch { /* */ } finally { setIsLoading(false); }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  const addVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || isAdding) return;
    setIsAdding(true);
    try {
      const res = await authenticatedFetch(`/api/admin/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label.trim(),
          priceOverride: form.price ? Number(form.price) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVariants((prev) => [...prev, data.data]);
        setForm({ label: "", price: "" });
        toast.success("Varian ditambahkan");
      } else {
        toast.error(data.error || "Gagal menambah varian");
      }
    } catch { toast.error("Gagal menambah varian"); }
    finally { setIsAdding(false); }
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      const res = await authenticatedFetch(`/api/admin/products/${productId}/variants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: editId,
          label: editForm.label.trim(),
          priceOverride: editForm.price ? Number(editForm.price) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVariants((prev) => prev.map((v) => (v.id === editId ? { ...v, ...data.data } : v)));
        setEditId(null);
        toast.success("Varian diperbarui");
      }
    } catch { toast.error("Gagal memperbarui varian"); }
  };

  const deleteVariant = async (variantId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/products/${productId}/variants`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });
      const data = await res.json();
      if (data.success) {
        setVariants((prev) => prev.filter((v) => v.id !== variantId));
        toast.success("Varian dihapus");
      }
    } catch { toast.error("Gagal menghapus varian"); }
  };

  if (isLoading) return <p className="text-xs text-muted-foreground py-2">Memuat varian...</p>;

  return (
    <div className="space-y-3">
      {/* Variant List */}
      {variants.length > 0 && (
        <div className="space-y-1.5">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-background border border-border/60">
              {editId === v.id ? (
                <>
                  <input
                    className="bg-card border border-border rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-accent/40"
                    value={editForm.label}
                    onChange={(e) => setEditForm((p) => ({ ...p, label: e.target.value }))}
                  />
                  <input
                    className="bg-card border border-border rounded px-2 py-1 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-accent/40"
                    value={editForm.price}
                    onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="Harga"
                    type="number"
                  />
                  <button onClick={saveEdit} className="text-green-600 hover:text-green-700"><Check className="size-3.5" /></button>
                  <button onClick={() => setEditId(null)} className="text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium text-xs">{v.label}</span>
                  {v.priceOverride != null && (
                    <span className="text-xs tabular-nums text-muted-foreground">{formatIDR(v.priceOverride)}</span>
                  )}
                  <button
                    onClick={() => { setEditId(v.id); setEditForm({ label: v.label, price: v.priceOverride?.toString() || "" }); }}
                    className="text-muted-foreground hover:text-accent"
                  >
                    <Edit3 className="size-3" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Varian?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Varian ini akan dihapus permanen. Aksi ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteVariant(v.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Variant Form */}
      <form onSubmit={addVariant} className="flex items-center gap-2">
        <input
          className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          value={form.label}
          onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
          placeholder="Label varian (e.g. 16cm, Coklat)"
          required
        />
        <input
          className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs w-28 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          value={form.price}
          onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
          placeholder="Harga (opsional)"
          type="number"
          min={0}
        />
        <Button type="submit" size="sm" className="h-7 text-xs gap-1" disabled={isAdding || !form.label.trim()}>
          {isAdding ? (
            <span className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <Plus className="size-3" />
          )} Tambah
        </Button>
      </form>
    </div>
  );
}
