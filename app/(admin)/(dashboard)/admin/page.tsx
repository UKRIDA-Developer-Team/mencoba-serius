"use client";

import React from "react";
import { type AdminIngredient, type AdminProduct } from "@/lib/data/admin";
import { useAdminData } from "@/features/admin/hooks/use-admin-data";
import { useAdminState } from "@/features/admin/hooks/use-admin-state";
import { useAdminFilters } from "@/features/admin/hooks/use-admin-filters";
import { useToast } from "@/features/admin/hooks/use-toast";
import { useAdminForms } from "@/features/admin/hooks/use-admin-forms";

import StatCards from "@/features/admin/components/dashboard/stat-cards";
import LowStockAlert from "@/features/admin/components/dashboard/low-stock-alert";
import IngredientTable from "@/features/admin/components/dashboard/ingredient-table";
import ProductList from "@/features/admin/components/dashboard/product-list";
import Toast from "@/features/admin/components/dashboard/toast";

export default function AdminPage() {
  // Data hooks
  const { ingredients: apiIngredients, products: apiProducts, categories, isLoading } = useAdminData();
  const { ingredients, setIngredients, products, setProducts, ingredientSearch, setIngredientSearch, productSearch, setProductSearch } = useAdminState(apiIngredients, apiProducts);
  const { filteredIngredients, filteredProducts, lowStockItems, stats } = useAdminFilters(ingredients, products, ingredientSearch, productSearch);
  const { toast, showToast } = useToast();
  const { ingredientForm, productForm, handleIngredientFormChange, handleProductFormChange, handleAddIngredient, handleAddProduct, handleToggleProductActive } = useAdminForms(categories.length > 0 ? categories[0].name : "Special");

  // Event handlers
  const onAddIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      await handleAddIngredient(e, (data) => {
        setIngredients((prev: AdminIngredient[]) => [...prev, data]);
        showToast("Ingredient ditambahkan!");
      });
    } catch {
      showToast("Gagal menambahkan ingredient");
    }
  };

  const onAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      await handleAddProduct(e, (data) => {
        setProducts((prev: AdminProduct[]) => [...prev, data]);
        showToast("Produk ditambahkan!");
      });
    } catch {
      showToast("Gagal menambahkan produk");
    }
  };

  const onToggleProductActive = async (slug: string) => {
    try {
      const product = products.find((p) => p.slug === slug);
      if (!product) return;

      await handleToggleProductActive(product.id, product.isActive, () => {
        setProducts((prev: AdminProduct[]) =>
          prev.map((entry) =>
            entry.slug === slug ? { ...entry, isActive: !entry.isActive } : entry
          )
        );
        showToast(product.isActive ? "Produk dinonaktifkan" : "Produk diaktifkan");
      });
    } catch {
      showToast("Gagal mengupdate produk");
    }
  };

  // Render
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary">
          Admin Control Center
        </h1>
        <p className="text-sm text-foreground/70 mt-1">
          Designed for quick daily use: monitor stock, update products, and catch
          low-stock risks early.
        </p>
      </div>

      <StatCards {...stats} />
      <LowStockAlert items={lowStockItems} />

      <section className="grid xl:grid-cols-2 gap-4 items-start">
        <IngredientTable
          ingredients={filteredIngredients}
          search={ingredientSearch}
          onSearchChange={setIngredientSearch}
          form={ingredientForm}
          onFormChange={handleIngredientFormChange}
          onSubmit={onAddIngredient}
        />
        <ProductList
          products={filteredProducts}
          search={productSearch}
          onSearchChange={setProductSearch}
          form={productForm}
          onFormChange={handleProductFormChange}
          onSubmit={onAddProduct}
          onToggleActive={onToggleProductActive}
          categories={categories}
        />
      </section>

      <Toast message={toast} />
    </section>
  );
}
