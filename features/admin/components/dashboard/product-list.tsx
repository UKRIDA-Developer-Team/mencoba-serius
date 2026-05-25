"use client";

import { type FormEvent, useMemo } from "react";
import { type ProductManagementItem } from "@/lib/data/inventory";
import { type ProductForm } from "@/features/admin/types/forms";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Package } from "lucide-react";

function formatIDR(value: number) {
    return value.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    });
}

const CATEGORIES = ["Birthday", "Wedding", "Anniversary", "Special"] as const;

type ProductListProps = {
    products: ProductManagementItem[];
    search: string;
    onSearchChange: (value: string) => void;
    form: ProductForm;
    onFormChange: (field: keyof ProductForm, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onToggleActive: (slug: string) => void;
};

export default function ProductList({
    products,
    search,
    onSearchChange,
    form,
    onFormChange,
    onSubmit,
    onToggleActive,
}: ProductListProps) {
    const filtered = useMemo(() => {
        if (!search.trim()) return products;
        const q = search.toLowerCase();
        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q)
        );
    }, [products, search]);

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">Products</h2>
                    <span className="text-sm text-muted-foreground">
                        {products.length} total
                    </span>
                </div>
                <div className="relative w-full sm:w-auto sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search products..."
                        className="pl-8 h-9 w-full"
                    />
                </div>
            </div>

            {/* List */}
            <div className="rounded-lg border min-h-40">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                        <Package className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No products found</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filtered.map((item) => (
                            <div
                                key={item.slug}
                                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {item.category} · {item.sizeLabel} · {formatIDR(item.basePrice)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {item.isPreorderOnly && (
                                        <Badge variant="outline" className="text-xs font-normal">
                                            Pre-order
                                        </Badge>
                                    )}
                                    <Button
                                        variant={item.isActive ? "outline" : "ghost"}
                                        size="sm"
                                        className={
                                            item.isActive
                                                ? "h-7 text-xs border-emerald-200 text-emerald-700 hover:text-emerald-800"
                                                : "h-7 text-xs text-muted-foreground hover:text-foreground"
                                        }
                                        onClick={() => onToggleActive(item.slug)}
                                    >
                                        {item.isActive ? "Active" : "Inactive"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Form */}
            <div className="rounded-lg border">
                <div className="px-4 py-3 border-b bg-muted/50">
                    <h3 className="text-sm font-semibold tracking-tight">Add Product</h3>
                </div>
                <div className="p-4">
                    <form
                        onSubmit={onSubmit}
                        className="flex flex-col sm:flex-row gap-3 items-end"
                    >
                        <div className="flex-1 space-y-1.5">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={form.name}
                                onChange={(e) => onFormChange("name", e.target.value)}
                                placeholder="Product name"
                                required
                            />
                        </div>
                        <div className="w-full sm:w-40 space-y-1.5">
                            <label className="text-sm font-medium">Slug</label>
                            <Input
                                value={form.slug}
                                onChange={(e) => onFormChange("slug", e.target.value)}
                                placeholder="product-slug"
                                required
                            />
                        </div>
                        <div className="w-full sm:w-36 space-y-1.5">
                            <label className="text-sm font-medium">Price</label>
                            <Input
                                value={form.price}
                                onChange={(e) => onFormChange("price", e.target.value)}
                                placeholder="IDR"
                                type="number"
                                min={1}
                                required
                            />
                        </div>
                        <div className="w-full sm:w-40 space-y-1.5">
                            <label className="text-sm font-medium">Category</label>
                            <Select
                                value={form.category}
                                onValueChange={(value) => onFormChange("category", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="gap-1 h-9">
                            <Plus className="h-4 w-4" />
                            Add
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}