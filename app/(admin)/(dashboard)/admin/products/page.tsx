"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { authenticatedFetch } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Search, Plus, ChevronDown, ChevronRight, Trash2, Edit3,
  Check, X, ScrollText, Package,
} from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Switch } from "@/components/ui/switch";

// Types
type AdminProduct = {
  id: string; slug: string; name: string; category: string;
  description?: string | null; imagePath?: string | null;
  basePrice: number; sizeLabel: string; isCustomizable: boolean;
  isPreorderOnly: boolean; isActive: boolean;
  isRecommended: boolean;
};

type ProductVariant = {
  id: string; productId: string; label: string;
  priceOverride: number | null; isActive: boolean; sortOrder: number;
};

type Category = { id: string; name: string };

// Helpers
function formatIDR(value: number) {
  return `Rp\u00a0${value.toLocaleString("id-ID")}`;
}

// ============================================================================
// Variant Panel Component
// Handles listing, adding, editing, and deleting product variants.
// ============================================================================
function VariantPanel({ productId }: { productId: string }) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    if (!form.label.trim()) return;
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
      }
    } catch { toast.error("Gagal menambah varian"); }
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
        <Button type="submit" size="sm" className="h-7 text-xs gap-1">
          <Plus className="size-3" /> Tambah
        </Button>
      </form>
    </div>
  );
}

// ============================================================================
// Main Products Page Component
// Displays product list, handles creation, deletion, and status toggle.
// ============================================================================
export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [variantCounts, setVariantCounts] = useState<Record<string, number>>({});

  // Add form
  const [addForm, setAddForm] = useState({ name: "", category: "", price: "", description: "", imagePath: "", isRecommended: false });

  // Edit form
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AdminProduct | null>(null);

  // Edit form
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        authenticatedFetch("/api/admin/products"),
        authenticatedFetch("/api/admin/categories"),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (prodData.success) setProducts(prodData.data);
      if (catData.success) {
        setCategories(catData.data);
        setAddForm((p) => p.category ? p : { ...p, category: catData.data[0]?.name || "" });
      }
    } catch {
      toast.error("Gagal memuat data");
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Load variant counts asynchronously for each product to show in the list badge
  // It fetches the variants per product and stores the length in a dictionary
  useEffect(() => {
    products.forEach(async (p) => {
      try {
        const res = await authenticatedFetch(`/api/admin/products/${p.id}/variants`);
        const data = await res.json();
        if (data.success) {
          setVariantCounts((prev) => ({ ...prev, [p.id]: data.data.length }));
        }
      } catch { /* */ }
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q)
    );
  }, [products, search]);

  // Add product
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(addForm.price);
    if (!addForm.name || !addForm.category || price <= 0) {
      toast.error("Lengkapi semua field");
      return;
    }
    try {
      const res = await authenticatedFetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          category: addForm.category,
          basePrice: price,
          description: addForm.description || null,
          imagePath: addForm.imagePath || null,
          isRecommended: addForm.isRecommended,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setProducts((prev) => [data.data, ...prev]);
      setAddForm({ name: "", category: categories[0]?.name || "", price: "", description: "", imagePath: "", isRecommended: false });
      toast.success("Produk ditambahkan!");
    } catch { toast.error("Gagal menambahkan produk"); }
  };

  // Toggle active
  const toggleActive = async (product: AdminProduct) => {
    try {
      const res = await authenticatedFetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive: !product.isActive } : p)));
      toast.success(product.isActive ? "Produk dinonaktifkan" : "Produk diaktifkan");
    } catch { toast.error("Gagal mengupdate produk"); }
  };

  // Toggle recommended
  const toggleRecommended = async (product: AdminProduct) => {
    try {
      const res = await authenticatedFetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRecommended: !product.isRecommended }),
      });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isRecommended: !product.isRecommended } : p)));
      toast.success(product.isRecommended ? "Dihapus dari rekomendasi" : "Ditambahkan ke rekomendasi");
    } catch { toast.error("Gagal mengupdate produk"); }
  };

  // Delete
  const deleteProduct = async (id: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produk dihapus!");
    } catch { toast.error("Gagal menghapus produk"); }
  };

  // Edit
  const startEdit = (p: AdminProduct) => { setEditId(p.id); setEditForm({ ...p }); };
  const cancelEdit = () => { setEditId(null); setEditForm(null); };

  const saveEdit = async () => {
    if (!editForm || !editId) return;
    try {
      const res = await authenticatedFetch(`/api/admin/products/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          basePrice: editForm.basePrice,
          description: editForm.description || null,
          imagePath: editForm.imagePath || null,
          isRecommended: editForm.isRecommended,
        }),
      });
      if (!res.ok) throw new Error();
      const updatedData = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === editId ? updatedData.data : p)));
      toast.success("Produk diperbarui!");
      cancelEdit();
    } catch { toast.error("Gagal memperbarui produk"); }
  };

  if (isLoading) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="size-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-sm">Memuat produk...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 pb-12 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary">Manajemen Produk</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola katalog produk, harga, varian, dan resep.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{products.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aktif</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{products.filter((p) => p.isActive).length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pre-order</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{products.filter((p) => p.isPreorderOnly).length}</p>
        </div>
      </div>

      {/* Layout: Form + List */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Add Form */}
        <Card className="xl:col-span-1 rounded-xl border-border">
          <CardHeader>
            <CardTitle className="text-base">Tambah Produk Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Nama Produk
                </label>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Kue Coklat"
                  className="bg-card border-border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Kategori</label>
                <Select
                  value={addForm.category}
                  onValueChange={(value) => setAddForm((p) => ({ ...p, category: value }))}
                  required
                >
                  <SelectTrigger className="w-full bg-card border-border rounded-lg px-3 text-sm focus:ring-accent/40 focus:border-accent transition-colors">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Harga Dasar (Rp)</label>
                <Input
                  type="number"
                  value={addForm.price}
                  onChange={(e) => setAddForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="0"
                  min={1}
                  className="bg-card border-border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Deskripsi</label>
                <Textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Deskripsi produk..."
                  className="bg-card border-border rounded-lg resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Gambar Produk</label>
                <ImageUpload
                  value={addForm.imagePath}
                  onChange={(url) => setAddForm((p) => ({ ...p, imagePath: url || "" }))}
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Jadikan Rekomendasi?</label>
                <Switch
                  checked={addForm.isRecommended}
                  onCheckedChange={(checked) => setAddForm((p) => ({ ...p, isRecommended: checked }))}
                />
              </div>
              <Button type="submit" className="w-full gap-1">
                <Plus className="size-4" /> Tambah Produk
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card className="xl:col-span-2 rounded-xl border-border">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Daftar Produk</CardTitle>
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari produk..."
                  className="pl-9 bg-card border-border rounded-lg"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Package className="size-10 opacity-30 mb-2" />
                <p className="text-sm">Tidak ada produk</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div key={product.id} className={`rounded-xl border transition-colors ${product.isActive ? "border-border bg-card" : "border-border/50 bg-muted/30"}`}>
                    {/* Product Row */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                        className="text-muted-foreground hover:text-accent transition-colors shrink-0"
                      >
                        {expandedId === product.id
                          ? <ChevronDown className="size-4" />
                          : <ChevronRight className="size-4" />
                        }
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {editId === product.id && editForm ? (
                          <div className="flex flex-col gap-3">
                            <div className="grid sm:grid-cols-2 gap-2">
                              <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="text-sm bg-card border-border rounded-lg"
                                placeholder="Nama produk"
                              />
                              <Input
                                value={editForm.basePrice}
                                onChange={(e) => setEditForm({ ...editForm, basePrice: Number(e.target.value) })}
                                type="number"
                                className="text-sm bg-card border-border rounded-lg"
                                placeholder="Harga dasar"
                              />
                            </div>
                            <Textarea
                              value={editForm.description || ""}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              placeholder="Deskripsi produk..."
                              className="bg-card border-border rounded-lg resize-none text-sm"
                              rows={2}
                            />
                            <div className="w-full sm:w-1/2">
                              <ImageUpload
                                value={editForm.imagePath || null}
                                onChange={(url) => setEditForm({ ...editForm, imagePath: url })}
                              />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Switch
                                checked={editForm.isRecommended}
                                onCheckedChange={(checked) => setEditForm({ ...editForm, isRecommended: checked })}
                              />
                              <label className="text-sm font-medium text-foreground">Jadikan Rekomendasi</label>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className={`text-sm font-semibold ${!product.isActive ? "text-muted-foreground" : "text-primary"}`}>
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                {product.category} · {formatIDR(product.basePrice)}
                              </span>
                              {product.isPreorderOnly && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-medium">Pre-order</span>
                              )}
                              {(variantCounts[product.id] ?? 0) > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                  {variantCounts[product.id]} varian
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {editId === product.id ? (
                          <>
                            <Button size="sm" onClick={saveEdit} className="h-7 text-xs"><Check className="size-3 mr-1" />Simpan</Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 text-xs"><X className="size-3" /></Button>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 mr-2">
                              <Switch
                                checked={product.isRecommended}
                                onCheckedChange={() => toggleRecommended(product)}
                                className="scale-75 data-[state=checked]:bg-amber-500"
                              />
                              <span className="text-[10px] font-semibold text-muted-foreground hidden sm:inline">Rekomendasi</span>
                            </div>
                            <Link
                              href={`/admin/products/recipe/${product.slug}`}
                              className="flex items-center gap-1 h-7 px-2 rounded-md text-xs text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                              title="Kelola resep"
                            >
                              <ScrollText className="size-3" />
                              <span className="hidden sm:inline">Resep</span>
                            </Link>
                            <Button size="sm" variant="outline" onClick={() => startEdit(product)} className="h-7 text-xs">
                              <Edit3 className="size-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={product.isActive ? "outline" : "ghost"}
                              onClick={() => toggleActive(product)}
                              className={`h-7 text-xs ${product.isActive ? "border-green-200 text-green-700" : "text-muted-foreground"}`}
                            >
                              {product.isActive ? "Aktif" : "Nonaktif"}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-destructive">
                                  <Trash2 className="size-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Produk ini akan dihapus permanen beserta seluruh varian dan resepnya. Aksi ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Variant Panel */}
                    {expandedId === product.id && (
                      <div className="px-4 pb-4 pt-1 border-t border-border/50">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Varian Produk
                        </p>
                        <VariantPanel productId={product.id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
