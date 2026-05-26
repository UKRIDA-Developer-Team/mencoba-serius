"use client";

import React, { useMemo, useState } from "react";
import { type AdminProduct } from "@/lib/data/admin";
import { useAdminData, useAdminState, useAdminFilters, useToast, useAdminForms } from "@/features/admin/hooks";
import { authenticatedFetch } from "@/lib/auth/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Toast from "@/features/admin/components/dashboard/toast";

export default function ProductsPage() {
  // Data hooks
  const { ingredients: _, products: apiProducts, categories, isLoading } = useAdminData();
  const { products, setProducts, productSearch, setProductSearch } = useAdminState([], apiProducts);
  const { filteredProducts, stats } = useAdminFilters([], products, "", productSearch);
  const { toast, showToast } = useToast();
  const { productForm, handleProductFormChange, handleAddProduct, handleToggleProductActive } = useAdminForms(categories.length > 0 ? categories[0].name : "Special");

  // Local state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AdminProduct | null>(null);

  // Event handlers
  const onAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await handleAddProduct(e, (data) => {
        setProducts((prev: AdminProduct[]) => [...prev, data]);
        showToast("Produk ditambahkan!");
      });
    } catch {
      showToast("Gagal menambahkan produk");
    }
  };

  const onToggleActive = async (id: string) => {
    try {
      const product = products.find((p) => p.id === id);
      if (!product) return;

      const response = await authenticatedFetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      if (!response.ok) throw new Error("Failed to update product");

      setProducts((prev: AdminProduct[]) =>
        prev.map((p) =>
          p.id === id ? { ...p, isActive: !p.isActive } : p
        )
      );
      showToast(product.isActive ? "Produk dinonaktifkan" : "Produk diaktifkan");
    } catch {
      showToast("Gagal mengupdate produk");
    }
  };

  const onDeleteProduct = async (id: string) => {
    if (!confirm("Yakin hapus produk ini?")) return;

    try {
      const response = await authenticatedFetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts((prev: AdminProduct[]) => prev.filter((p) => p.id !== id));
      showToast("Produk dihapus!");
    } catch {
      showToast("Gagal menghapus produk");
    }
  };

  const onEditProduct = (product: AdminProduct) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const onSaveEdit = async () => {
    if (!editForm || !editingId) return;

    try {
      const response = await authenticatedFetch(`/api/admin/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: editForm.slug,
          name: editForm.name,
          category: editForm.category,
          basePrice: editForm.basePrice,
          isCustomizable: editForm.isCustomizable,
          isPreorderOnly: editForm.isPreorderOnly,
        }),
      });

      if (!response.ok) throw new Error("Failed to update product");

      const updatedData = await response.json();
      setProducts((prev: AdminProduct[]) =>
        prev.map((p) => (p.id === editingId ? updatedData.data : p))
      );
      showToast("Produk diperbarui!");
      onCancelEdit();
    } catch {
      showToast("Gagal memperbarui produk");
    }
  };

  if (isLoading) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 pb-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 pb-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-primary">Manajemen Produk</h1>
        <p className="text-sm text-foreground/70 mt-1">
          Kelola katalog produk, harga, dan status ketersediaan
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pre-order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalPreorderOnly}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Add Product Form */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Tambah Produk Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAddProduct} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nama Produk</label>
                <Input
                  placeholder="e.g. Kue Coklat"
                  value={productForm.name}
                  onChange={(e) => handleProductFormChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  placeholder="e.g. kue-coklat"
                  value={productForm.slug}
                  onChange={(e) => handleProductFormChange("slug", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kategori</label>
                <select
                  value={productForm.category}
                  onChange={(e) => handleProductFormChange("category", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Harga Dasar (Rp)</label>
                <Input
                  placeholder="0"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => handleProductFormChange("price", e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Tambah Produk
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar Produk</CardTitle>
              <Input
                placeholder="Cari produk..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-48"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Tidak ada produk</p>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 border rounded-lg flex items-start justify-between ${
                      product.isActive ? "bg-white" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      {editingId === product.id && editForm ? (
                        <div className="space-y-2">
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Nama produk"
                            className="text-sm"
                          />
                          <Input
                            value={editForm.basePrice}
                            onChange={(e) => setEditForm({ ...editForm, basePrice: Number(e.target.value) })}
                            placeholder="Harga"
                            type="number"
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <>
                          <p className={`font-medium text-sm ${!product.isActive ? "text-muted-foreground" : ""}`}>
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.category} • Rp {product.basePrice.toLocaleString("id-ID")}
                          </p>
                          {product.isPreorderOnly && (
                            <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1">
                              Pre-order
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 ml-2">
                      {editingId === product.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={onSaveEdit}
                          >
                            Simpan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={onCancelEdit}
                          >
                            Batal
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditProduct(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={product.isActive ? "secondary" : "default"}
                            onClick={() => onToggleActive(product.id)}
                          >
                            {product.isActive ? "Nonaktif" : "Aktif"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDeleteProduct(product.id)}
                          >
                            Hapus
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Toast message={toast} />
    </section>
  );
}
