"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Plus, Edit3, Trash2, Package, History, ShoppingCart } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { IngredientFormDialog } from "./components/IngredientFormDialog";
import { IngredientUsageDialog } from "./components/IngredientUsageDialog";
import { PurchaseIngredientDialog } from "./components/PurchaseIngredientDialog";

type Ingredient = {
  id: string;
  sku: string;
  name: string;
  baseUnitId: string;
  baseUnitCode: string;
  reorderLevelBaseQty: number;
  currentStockBaseQty: number;
  preferredSupplier: string;
  isActive: boolean;
};

type MeasurementUnit = { id: string; code: string; name: string; unitType: string; };
type Supplier = { id: string; name: string; contactName: string | null; phone: string | null; };

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

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editIngredient, setEditIngredient] = useState<Ingredient | null>(null);

  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [usageIngredient, setUsageIngredient] = useState<Ingredient | null>(null);

  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [purchaseIngredient, setPurchaseIngredient] = useState<Ingredient | null>(null);

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
      
      if (ingRes.ok && ingPayload.success) setIngredients(ingPayload.data);
      if (unitRes.ok && unitPayload.success) setUnits(unitPayload.data);
      if (supplierRes.ok && supplierPayload.success) setSuppliers(supplierPayload.data);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredIngredients = useMemo(() => {
    if (!search.trim()) return ingredients;
    const q = search.toLowerCase();
    return ingredients.filter(item => item.name.toLowerCase().includes(q));
  }, [ingredients, search]);

  const handleFormSubmit = async (data: any) => {
    if (editIngredient) {
      const res = await authenticatedFetch("/api/admin/ingredients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editIngredient.id, ...data }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error();
      toast.success("Ingredient diperbarui");
    } else {
      const res = await authenticatedFetch("/api/admin/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error();
      toast.success("Ingredient ditambahkan");
    }
    loadData();
    setIsFormOpen(false);
  };

  const toggleActive = async (ingredient: Ingredient) => {
    try {
      const res = await authenticatedFetch("/api/admin/ingredients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ingredient.id, isActive: !ingredient.isActive }),
      });
      if (!res.ok) throw new Error();
      setIngredients(prev => prev.map(item => item.id === ingredient.id ? { ...item, isActive: !item.isActive } : item));
      toast.success("Status diperbarui");
    } catch { toast.error("Gagal memperbarui status"); }
  };

  const removeIngredient = async (id: string) => {
    try {
      const res = await authenticatedFetch("/api/admin/ingredients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setIngredients(prev => prev.filter(item => item.id !== id));
      toast.success("Ingredient dihapus");
    } catch { toast.error("Gagal menghapus ingredient"); }
  };

  const lowCount = useMemo(() => ingredients.filter(i => i.currentStockBaseQty < i.reorderLevelBaseQty).length, [ingredients]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 pb-12 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary">Manajemen Bahan Baku</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola data bahan, lihat penggunaan, dan catat pembelian.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{ingredients.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aktif</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{ingredients.filter(i => i.isActive).length}</p>
        </div>
        <div className={`rounded-xl border p-4 ${lowCount > 0 ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stok Menipis</p>
          <p className={`text-2xl font-bold mt-1 tabular-nums ${lowCount > 0 ? "text-destructive" : ""}`}>{lowCount}</p>
        </div>
      </div>

      {/* List */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              Daftar Bahan Baku
              <Badge variant="secondary" className="text-xs font-normal">{filteredIngredients.length} item</Badge>
            </CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari bahan..." className="pl-9 bg-card border-border rounded-lg" />
              </div>
              <Button onClick={() => { setEditIngredient(null); setIsFormOpen(true); }} className="gap-1 flex-shrink-0">
                <Plus className="size-4" /> Tambah
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center h-32"><div className="size-6 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>
          ) : filteredIngredients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground"><Package className="size-10 opacity-30 mb-2" /><p className="text-sm">Belum ada bahan baku.</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients.map((ingredient) => (
                  <TableRow key={ingredient.id} className={!ingredient.isActive ? "bg-muted/20 opacity-75" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{ingredient.name}</p>
                        {!ingredient.isActive && <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Nonaktif</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm tabular-nums">{ingredient.currentStockBaseQty} {ingredient.baseUnitCode}</p>
                      <StockIndicator current={ingredient.currentStockBaseQty} reorder={ingredient.reorderLevelBaseQty} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs truncate max-w-[120px]">{ingredient.preferredSupplier || "—"}</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleActive(ingredient)}
                        className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-colors ${ingredient.isActive ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-600"}`}
                      >
                        <span className={`size-1.5 rounded-full ${ingredient.isActive ? "bg-green-500" : "bg-red-400"}`} />
                        {ingredient.isActive ? "Aktif" : "Nonaktif"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button size="sm" variant="outline" className="size-7 p-0" title="Catat Pembelian" onClick={() => { setPurchaseIngredient(ingredient); setIsPurchaseOpen(true); }}>
                          <ShoppingCart className="size-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="size-7 p-0" title="Lihat Penggunaan" onClick={() => { setUsageIngredient(ingredient); setIsUsageOpen(true); }}>
                          <History className="size-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="size-7 p-0" title="Edit" onClick={() => { setEditIngredient(ingredient); setIsFormOpen(true); }}>
                          <Edit3 className="size-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Hapus"><Trash2 className="size-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Hapus Ingredient?</AlertDialogTitle><AlertDialogDescription>Ingredient akan dihapus permanen.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeIngredient(ingredient.id)} className="bg-destructive text-destructive-foreground">Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <IngredientFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editIngredient}
        units={units}
        suppliers={suppliers}
        onSubmit={handleFormSubmit}
        onDataRefreshed={loadData}
      />

      <IngredientUsageDialog
        isOpen={isUsageOpen}
        onClose={() => setIsUsageOpen(false)}
        ingredient={usageIngredient}
      />

      <PurchaseIngredientDialog
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        ingredient={purchaseIngredient}
        suppliers={suppliers}
        onPurchased={loadData}
      />
    </section>
  );
}
