"use client";

import { type FormEvent, useMemo } from "react";
import { type AdminIngredient } from "@/lib/data/admin";
import { type IngredientForm } from "@/features/admin/types/forms";
import { StockBadge } from "@/features/admin/components/common/stock-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, Plus, Package } from "lucide-react";

const lowStockSeverity = (item: AdminIngredient): "critical" | "warning" | "ok" => {
    if (item.currentStockBaseQty === 0) return "critical";
    if (item.currentStockBaseQty < item.reorderLevelBaseQty) return "warning";
    return "ok";
};

type IngredientTableProps = {
    ingredients: AdminIngredient[];
    search: string;
    onSearchChange: (value: string) => void;
    form: IngredientForm;
    onFormChange: (field: keyof IngredientForm, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function IngredientTable({
    ingredients,
    search,
    onSearchChange,
    form,
    onFormChange,
    onSubmit,
}: IngredientTableProps) {
    const filtered = useMemo(() => {
        if (!search.trim()) return ingredients;
        const q = search.toLowerCase();
        return ingredients.filter(
            (i) =>
                i.name.toLowerCase().includes(q) ||
                i.sku.toLowerCase().includes(q)
        );
    }, [ingredients, search]);

    const lowCount = useMemo(
        () => ingredients.filter((i) => lowStockSeverity(i) !== "ok").length,
        [ingredients]
    );

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">
                        Ingredients
                    </h2>
                    <span className="text-sm text-muted-foreground">
                        {ingredients.length} total
                        {lowCount > 0 && (
                            <span className="text-amber-600 ml-1">
                                {lowCount} low
                            </span>
                        )}
                    </span>
                </div>
                <div className="relative w-full sm:w-auto sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search ingredients..."
                        className="pl-8 h-9 w-full"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-muted/50">
                            <TableHead className="w-[300px]">Ingredient</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-24 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Package className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">No ingredients found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((item) => {
                                const severity = lowStockSeverity(item);
                                return (
                                    <TableRow
                                        key={item.sku}
                                        className="cursor-pointer"
                                    >
                                        <TableCell className="font-medium">
                                            <div>{item.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">
                                                {item.sku}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="tabular-nums">
                                                {item.currentStockBaseQty} {item.baseUnitCode}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Min {item.reorderLevelBaseQty} {item.baseUnitCode}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {item.preferredSupplier || "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <StockBadge severity={severity} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Form */}
            <form
                onSubmit={onSubmit}
                className="flex items-end gap-3"
            >
                <div className="flex-1 space-y-1.5">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                        value={form.name}
                        onChange={(e) => onFormChange("name", e.target.value)}
                        placeholder="Ingredient name"
                        required
                    />
                </div>
                <div className="w-40 space-y-1.5">
                    <label className="text-sm font-medium">SKU</label>
                    <Input
                        value={form.sku}
                        onChange={(e) => onFormChange("sku", e.target.value)}
                        placeholder="SKU"
                        required
                    />
                </div>
                <div className="w-32 space-y-1.5">
                    <label className="text-sm font-medium">Reorder</label>
                    <Input
                        value={form.reorder}
                        onChange={(e) => onFormChange("reorder", e.target.value)}
                        placeholder="Level"
                        type="number"
                        min={0}
                        required
                    />
                </div>
                <Button type="submit" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add
                </Button>
            </form>
        </div>
    );
}