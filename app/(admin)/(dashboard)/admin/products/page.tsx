"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { authenticatedFetch } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Toast from "@/features/admin/components/dashboard/toast";
import {
  Search, Plus, ChevronDown, ChevronRight, Trash2, Edit3,
  Check, X, ScrollText, Package,
} from "lucide-react";

// Types
type AdminProduct = {
  id: string; slug: string; name: string; category: string;
  basePrice: number; sizeLabel: string; isCustomizable: boolean;
  isPreorderOnly: boolean; isActive: boolean;
};

type ProductVariant = {
  id: string; productId: string; label: string;
  priceOverride: number | null; isActive: boolean; sortOrder: number;
};

type Category = { id: string; name: string };

// Helpers
const toSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

function formatIDR(value: number) {
  return `Rp\u00a0${value.toLocaleString("id-ID")}`;
}

// ─── Variant Panel ────────────────────────────────────────
function VariantPanel({ productId, toast }: { productId: string; toast: (msg: string) => void }) {
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
        toast("Varian ditambahkan");
      }
    } catch { toast("Gagal menambah varian"); }
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
        toast("Varian diperbarui");
      }
    } catch { toast("Gagal memperbarui varian"); }
  };

  const deleteVariant = async (variantId: string) => {
    if (!confirm("Hapus varian ini?")) return;
    try {
      const res = await authenticatedFetch(`/api/admin/products/${productId}/variants`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });
      const data = await res.json();
      if (data.success) {
        setVariants((prev) => prev.filter((v) => v.id !== variantId));
        toast("Varian dihapus");
      }
    } catch { toast("Gagal menghapus varian"); }
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
                  <button onClick={() => deleteVariant(v.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3" />
                  </button>
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

// ─── Main Products Page ───────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [variantCounts, setVariantCounts] = useState<Record<string, number>>({});

  // Add form
  const [addForm, setAddForm] = useState({ name: "", slug: "", category: "", price: "" });
  const [slugManual, setSlugManual] = useState(false);

  // Edit form
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AdminProduct | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Auto-slug
  useEffect(() => {
    if (!slugManual && addForm.name) {
      setAddForm((p) => ({ ...p, slug: toSlug(p.name) }));
    }
  }, [addForm.name, slugManual]);

  // Load data
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
      showToast("Gagal memuat data");
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Load variant counts
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
      (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [products, search]);

  // Add product
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(addForm.price);
    if (!addForm.name || !addForm.slug || !addForm.category || price <= 0) {
      showToast("Lengkapi semua field");
      return;
    }
    try {
      const res = await authenticatedFetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          slug: addForm.slug,
          category: addForm.category,
          basePrice: price,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setProducts((prev) => [data.data, ...prev]);
      setAddForm({ name: "", slug: "", category: categories[0]?.name || "", price: "" });
      setSlugManual(false);
      showToast("Produk ditambahkan!");
    } catch { showToast("Gagal menambahkan produk"); }
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
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p)));
      showToast(product.isActive ? "Produk dinonaktifkan" : "Produk diaktifkan");
    } catch { showToast("Gagal mengupdate produk"); }
  };

  // Delete
  const deleteProduct = async (id: string) => {
    if (!confirm("Yakin hapus produk ini?")) return;
    try {
      const res = await authenticatedFetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Produk dihapus!");
    } catch { showToast("Gagal menghapus produk"); }
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
          slug: editForm.slug,
          name: editForm.name,
          category: editForm.category,
          basePrice: editForm.basePrice,
        }),
      });
      if (!res.ok) throw new Error();
      const updatedData = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === editId ? updatedData.data : p)));
      showToast("Produk diperbarui!");
      cancelEdit();
    } catch { showToast("Gagal memperbarui produk"); }
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Slug
                  <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-accent">
                    {slugManual ? "(manual)" : "(otomatis)"}
                  </span>
                </label>
                <Input
                  value={addForm.slug}
                  onChange={(e) => { setSlugManual(true); setAddForm((p) => ({ ...p, slug: e.target.value })); }}
                  onBlur={() => { if (!addForm.slug.trim()) setSlugManual(false); }}
                  placeholder="kue-coklat"
                  className="bg-card border-border rounded-lg font-mono text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Kategori</label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm((p) => ({ ...p, category: e.target.value }))}
                  className="bg-card border border-border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
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
                          <div className="grid sm:grid-cols-2 gap-2">
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="text-sm bg-card border-border rounded-lg"
                            />
                            <Input
                              value={editForm.basePrice}
                              onChange={(e) => setEditForm({ ...editForm, basePrice: Number(e.target.value) })}
                              type="number"
                              className="text-sm bg-card border-border rounded-lg"
                            />
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
                            <Button size="sm" variant="ghost" onClick={() => deleteProduct(product.id)} className="h-7 text-xs text-muted-foreground hover:text-destructive">
                              <Trash2 className="size-3" />
                            </Button>
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
                        <VariantPanel productId={product.id} toast={showToast} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Toast message={toast} />
    </section>
  );
}
