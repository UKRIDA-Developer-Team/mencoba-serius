"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
    isLowStock,
    seededIngredientStocks,
    seededProductManagementItems,
    type IngredientStock,
    type ProductManagementItem,
} from "@/lib/data/inventory";
import { type IngredientForm, type ProductForm } from "@/features/admin/types/forms";

import StatCards from "@/features/admin/components/dashboard/stat-cards";
import LowStockAlert from "@/features/admin/components/dashboard/low-stock-alert";
import IngredientTable from "@/features/admin/components/dashboard/ingredient-table";
import ProductList from "@/features/admin/components/dashboard/product-list";
import Toast from "@/features/admin/components/dashboard/toast";

export default function AdminPage() {
    // --- State ---
    const [ingredients, setIngredients] = useState<IngredientStock[]>(seededIngredientStocks);
    const [products, setProducts] = useState<ProductManagementItem[]>(seededProductManagementItems);

    const [ingredientSearch, setIngredientSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");

    // P1: Consolidated form state — one object per form, not one useState per field
    const [ingredientForm, setIngredientForm] = useState<IngredientForm>({
        name: "", sku: "", reorder: "",
    });
    const [productForm, setProductForm] = useState<ProductForm>({
        name: "", slug: "", price: "", category: "Special",
    });

    // P7: Toast feedback state
    const [toast, setToast] = useState<string | null>(null);

    // P4: useRef counter — safe unique IDs, keeps id: number (matches DB BIGSERIAL)
    const ingredientIdRef = useRef(Math.max(...seededIngredientStocks.map((i) => i.id)) + 1);
    const productIdRef = useRef(Math.max(...seededProductManagementItems.map((p) => p.id)) + 1);

    // P7: Auto-clear toast after 3 s
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    // P3: All derived values via useMemo — consistent, no recalc on unrelated renders
    const filteredIngredients = useMemo(() => {
        if (!ingredientSearch) return ingredients;
        const q = ingredientSearch.toLowerCase();
        return ingredients.filter(
            (item) => item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)
        );
    }, [ingredients, ingredientSearch]);

    const filteredProducts = useMemo(() => {
        if (!productSearch) return products;
        const q = productSearch.toLowerCase();
        return products.filter(
            (item) => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)
        );
    }, [products, productSearch]);

    const lowStockItems = useMemo(
        () =>
            ingredients
                .filter(isLowStock)
                .sort((a, b) => a.currentStockBaseQty - b.currentStockBaseQty),
        [ingredients]
    );

    const stats = useMemo(
        () => ({
            totalProducts: products.filter((p) => p.isActive).length,
            totalIngredients: ingredients.length,
            totalLowStock: lowStockItems.length,
            totalPreorderOnly: products.filter((p) => p.isPreorderOnly && p.isActive).length,
        }),
        [products, ingredients, lowStockItems]
    );

    // P6: Named handler functions defined outside return — not inline in JSX

    function handleAddIngredient(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const reorderLevel = Number(ingredientForm.reorder || 0);
        if (!ingredientForm.name || !ingredientForm.sku || reorderLevel < 0) return;

        setIngredients((prev) => [
            ...prev,
            {
                id: ingredientIdRef.current++, // P4: ref counter, no ID collision
                sku: ingredientForm.sku.toUpperCase(),
                name: ingredientForm.name,
                baseUnitCode: "g",
                reorderLevelBaseQty: reorderLevel,
                currentStockBaseQty: 0,
                preferredSupplier: "Nusantara Baking Supply",
                isActive: true,
            },
        ]);
        setIngredientForm({ name: "", sku: "", reorder: "" }); // P1: reset whole object
        setToast("Ingredient added successfully!"); // P7
    }

    function handleAddProduct(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const basePrice = Number(productForm.price || 0);
        if (!productForm.name || !productForm.slug || basePrice <= 0) return;

        setProducts((prev) => [
            ...prev,
            {
                id: productIdRef.current++, // P4: ref counter, no ID collision
                slug: productForm.slug.toLowerCase(),
                name: productForm.name,
                category: productForm.category,
                basePrice,
                sizeLabel: "20 cm",
                isCustomizable: true,
                isPreorderOnly: false,
                isActive: true,
            },
        ]);
        setProductForm({ name: "", slug: "", price: "", category: "Special" }); // P1: reset whole object
        setToast("Product added successfully!"); // P7
    }

    function handleToggleProductActive(slug: string) {
        setProducts((prev) =>
            prev.map((entry) =>
                entry.slug === slug ? { ...entry, isActive: !entry.isActive } : entry
            )
        );
    }

    function handleIngredientFormChange(field: keyof IngredientForm, value: string) {
        setIngredientForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleProductFormChange(field: keyof ProductForm, value: string) {
        setProductForm((prev) => ({ ...prev, [field]: value }));
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

            {/* P5: Extracted sub-components */}
            <StatCards {...stats} />

            <LowStockAlert items={lowStockItems} />

            <section className="grid xl:grid-cols-2 gap-4 items-start">
                <IngredientTable
                    ingredients={filteredIngredients}
                    search={ingredientSearch}
                    onSearchChange={setIngredientSearch}
                    form={ingredientForm}
                    onFormChange={handleIngredientFormChange}
                    onSubmit={handleAddIngredient}
                />
                <ProductList
                    products={filteredProducts}
                    search={productSearch}
                    onSearchChange={setProductSearch}
                    form={productForm}
                    onFormChange={handleProductFormChange}
                    onSubmit={handleAddProduct}
                    onToggleActive={handleToggleProductActive}
                />
            </section>

            {/* P7: Toast feedback */}
            <Toast message={toast} />
        </section>
    );
}
