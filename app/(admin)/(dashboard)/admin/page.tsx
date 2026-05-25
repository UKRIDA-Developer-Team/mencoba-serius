"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { type AdminIngredient, type AdminProduct } from "@/lib/data/admin";
import { type IngredientForm, type ProductForm } from "@/features/admin/types/forms";
import { authenticatedFetch } from "@/lib/auth/client";

import StatCards from "@/features/admin/components/dashboard/stat-cards";
import LowStockAlert from "@/features/admin/components/dashboard/low-stock-alert";
import IngredientTable from "@/features/admin/components/dashboard/ingredient-table";
import ProductList from "@/features/admin/components/dashboard/product-list";
import Toast from "@/features/admin/components/dashboard/toast";

const isLowStock = (item: AdminIngredient) => item.currentStockBaseQty < item.reorderLevelBaseQty;

export default function AdminPage() {
    // --- State ---
    const [ingredients, setIngredients] = useState<AdminIngredient[]>([]);
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [ingredientSearch, setIngredientSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");

    // Form state
    const [ingredientForm, setIngredientForm] = useState<IngredientForm>({
        name: "", sku: "", reorder: "",
    });
    const [productForm, setProductForm] = useState<ProductForm>({
        name: "", slug: "", price: "", category: "Special",
    });

    // Toast feedback state
    const [toast, setToast] = useState<string | null>(null);

    // Fetch data from APIs on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [ingredRes, prodRes, catRes] = await Promise.all([
                    authenticatedFetch("/api/admin/ingredients"),
                    authenticatedFetch("/api/admin/products"),
                    authenticatedFetch("/api/admin/categories"),
                ]);

                if (!ingredRes.ok || !prodRes.ok || !catRes.ok) {
                    throw new Error("Failed to fetch admin data");
                }

                const ingredData = await ingredRes.json();
                const prodData = await prodRes.json();
                const catData = await catRes.json();

                if (ingredData.success) setIngredients(ingredData.data);
                if (prodData.success) setProducts(prodData.data);
                if (catData.success) setCategories(catData.data);

                // Set default category from DB
                if (catData.success && catData.data.length > 0) {
                    setProductForm((prev) => ({ ...prev, category: catData.data[0].name }));
                }
            } catch (error) {
                console.error("Error fetching admin data:", error);
                setToast("Gagal memuat data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Auto-clear toast after 3s
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    // Filtered data via useMemo
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

    // Form handlers
    async function handleAddIngredient(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const reorderLevel = Number(ingredientForm.reorder || 0);
        if (!ingredientForm.name || !ingredientForm.sku || reorderLevel < 0) return;

        try {
            const response = await authenticatedFetch("/api/admin/ingredients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sku: ingredientForm.sku.toUpperCase(),
                    name: ingredientForm.name,
                    reorderLevelBaseQty: reorderLevel,
                }),
            });

            if (!response.ok) throw new Error("Failed to add ingredient");

            const data = await response.json();
            setIngredients((prev) => [...prev, data.data]);
            setIngredientForm({ name: "", sku: "", reorder: "" });
            setToast("Ingredient ditambahkan!");
        } catch (error) {
            console.error("Error adding ingredient:", error);
            setToast("Gagal menambahkan ingredient");
        }
    }

    async function handleAddProduct(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const basePrice = Number(productForm.price || 0);
        if (!productForm.name || !productForm.slug || basePrice <= 0) return;

        try {
            const response = await authenticatedFetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: productForm.slug.toLowerCase(),
                    name: productForm.name,
                    category: productForm.category,
                    basePrice,
                }),
            });

            if (!response.ok) throw new Error("Failed to add product");

            const data = await response.json();
            setProducts((prev) => [...prev, data.data]);
            setProductForm({ name: "", slug: "", price: "", category: productForm.category });
            setToast("Produk ditambahkan!");
        } catch (error) {
            console.error("Error adding product:", error);
            setToast("Gagal menambahkan produk");
        }
    }

    async function handleToggleProductActive(slug: string) {
        try {
            const product = products.find((p) => p.slug === slug);
            if (!product) return;

            const response = await authenticatedFetch(`/api/admin/products/${product.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !product.isActive }),
            });

            if (!response.ok) throw new Error("Failed to update product");

            setProducts((prev) =>
                prev.map((entry) =>
                    entry.slug === slug ? { ...entry, isActive: !entry.isActive } : entry
                )
            );
        } catch (error) {
            console.error("Error toggling product active state:", error);
            setToast("Gagal mengupdate produk");
        }
    }

    function handleIngredientFormChange(field: keyof IngredientForm, value: string) {
        setIngredientForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleProductFormChange(field: keyof ProductForm, value: string) {
        setProductForm((prev) => ({ ...prev, [field]: value }));
    }

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
                    categories={categories}
                />
            </section>

            {/* P7: Toast feedback */}
            <Toast message={toast} />
        </section>
    );
}
