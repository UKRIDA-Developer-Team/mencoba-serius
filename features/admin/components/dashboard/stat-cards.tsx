"use client";

import { Card, CardContent } from "@/components/ui/card";

type StatCardsProps = {
    totalProducts: number;
    totalIngredients: number;
    totalLowStock: number;
    totalPreorderOnly: number;
};

export default function StatCards({
    totalProducts,
    totalIngredients,
    totalLowStock,
    totalPreorderOnly,
}: StatCardsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-0 shadow-none bg-muted/40">
                <CardContent className="p-5">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Active Products</p>
                        <p className="text-2xl font-semibold tabular-nums">{totalProducts}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Currently on menu</p>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-muted/40">
                <CardContent className="p-5">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Ingredients</p>
                        <p className="text-2xl font-semibold tabular-nums">{totalIngredients}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Tracked in inventory</p>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-destructive/5">
                <CardContent className="p-5">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Low Stock</p>
                        <p className="text-2xl font-semibold tabular-nums text-destructive">{totalLowStock}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Need reordering</p>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-muted/40">
                <CardContent className="p-5">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Pre-order</p>
                        <p className="text-2xl font-semibold tabular-nums">{totalPreorderOnly}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Unavailable for immediate sale</p>
                </CardContent>
            </Card>
        </div>
    );
}