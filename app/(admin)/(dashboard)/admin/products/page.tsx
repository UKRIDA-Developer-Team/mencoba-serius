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
  ScrollText, Package,
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { VariantPanel } from "./components/VariantPanel";
import { ProductFormDialog } from "./components/ProductFormDialog";

// Types
type AdminProduct = {
  id: string; slug: string; name: string; category: string;
  description?: string | null; imagePath?: string | null;
  basePrice: number; sizeLabel: string; isCustomizable: boolean;
  isPreorderOnly: boolean; isActive: boolean;
  isRecommended: boolean;
};

type Category = { id: string; name: string };

// Helpers
function formatIDR(value: number) {
  return `Rp\u00a0${value.toLocaleString("id-ID")}`;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [variantCounts, setVariantCounts] = useState<Record<string, number>>({});

  // Dialog states
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

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
      }
    } catch {
      toast.error("Gagal memuat data");
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Load variant counts asynchronously for each product to show in the list badge
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

  const handleFormSubmit = async (data: any) => {
    if (editingProduct) {
      // Edit
      try {
        const res = await authenticatedFetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error();
        const updatedData = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updatedData.data : p)));
        toast.success("Produk diperbarui!");
        setIsFormDialogOpen(false);
      } catch { toast.error("Gagal memperbarui produk"); }
    } else {
      // Add
      try {
        const res = await authenticatedFetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const resData = await res.json();
        if (!res.ok || !resData.success) throw new Error();
        setProducts((prev) => [resData.data, ...prev]);
        setIsFormDialogOpen(false);
        toast.success("Produk ditambahkan!");
      } catch { toast.error("Gagal menambahkan produk"); }
    }
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (product: AdminProduct) => {
    setEditingProduct(product);
    setIsFormDialogOpen(true);
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

      {/* Products List */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base">Daftar Produk</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari produk..."
                  className="pl-9 bg-card border-border rounded-lg"
                />
              </div>
              <Button onClick={openAddDialog} className="gap-1 w-full sm:w-auto">
                <Plus className="size-4" /> Tambah Produk
              </Button>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Info</TableHead>
                  <TableHead className="text-center">Rekomendasi</TableHead>
                  <TableHead className="text-center">Resep</TableHead>
                  <TableHead className="text-center"></TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <React.Fragment key={product.id}>
                    <TableRow className={!product.isActive ? "bg-muted/30" : ""}>
                      <TableCell>
                        <button
                          onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                          className="text-muted-foreground hover:text-accent transition-colors shrink-0"
                        >
                          {expandedId === product.id
                            ? <ChevronDown className="size-4" />
                            : <ChevronRight className="size-4" />
                          }
                        </button>
                      </TableCell>
                      
                      <TableCell className={`font-semibold ${!product.isActive ? "text-muted-foreground" : "text-primary"}`}>
                        <div className="flex items-center gap-2">
                          {product.name}
                          {!product.isActive && (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4">
                              Nonaktif
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {product.category}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatIDR(product.basePrice)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {product.isPreorderOnly && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-[10px]">
                              Pre-order
                            </Badge>
                          )}
                          {(variantCounts[product.id] ?? 0) >= 2 && (
                            <Badge variant="outline" className="text-[10px]">
                              {variantCounts[product.id]} varian
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center" title="Jadikan Rekomendasi">
                          <Switch
                            checked={product.isRecommended}
                            onCheckedChange={() => toggleRecommended(product)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link
                          href={`/admin/products/recipe/${product.slug}`}
                          className="inline-flex items-center justify-center size-7 rounded-md border border-transparent hover:border-border text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                          title="Kelola resep"
                        >
                          <ScrollText className="size-3.5" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant={product.isActive ? "outline" : "ghost"}
                          onClick={() => toggleActive(product)}
                          className={`h-7 px-2.5 text-[10px] uppercase font-bold tracking-wider gap-1 ${product.isActive ? "border-green-200 text-green-700 bg-green-50 hover:bg-green-100" : "border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50"}`}
                          title={product.isActive ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <span className={`size-1.5 rounded-full ${product.isActive ? "bg-green-500" : "bg-red-400"}`} />
                          {product.isActive ? "Aktif" : "Nonaktif"}
                        </Button>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center gap-1.5 justify-end shrink-0">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(product)} className="size-7 p-0 text-muted-foreground" title="Edit Produk">
                            <Edit3 className="size-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Hapus">
                                <Trash2 className="size-3.5" />
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
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Variant Panel */}
                    {expandedId === product.id && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-muted/10 p-0 border-b">
                          <div className="p-4 pl-12 border-l-2 border-primary/20">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                              Varian Produk
                            </p>
                            <VariantPanel productId={product.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Form Dialog */}
      <ProductFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        categories={categories}
        initialData={editingProduct}
        onSubmit={handleFormSubmit}
      />
    </section>
  );
}
