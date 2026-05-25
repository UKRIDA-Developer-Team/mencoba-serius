"use client";

import { type AdminIngredient } from "@/lib/data/admin";

type LowStockAlertProps = {
    items: AdminIngredient[];
};

export default function LowStockAlert({ items }: LowStockAlertProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="rounded-lg border">
            <div className="px-4 py-3 border-b bg-muted/50">
                <h3 className="text-sm font-semibold tracking-tight">
                    Low Stock Alerts
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                    {items.length} item{items.length > 1 ? "s" : ""} need attention
                </p>
            </div>
            <div className="divide-y">
                {items.slice(0, 5).map((item) => (
                    <div
                        key={item.sku}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-2.5 text-sm gap-2"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                                {item.sku}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="tabular-nums font-medium">
                                {item.currentStockBaseQty} {item.baseUnitCode}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                min {item.reorderLevelBaseQty} {item.baseUnitCode}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {items.length > 5 && (
                <div className="px-4 py-2 border-t text-xs text-muted-foreground text-center">
                    +{items.length - 5} more items
                </div>
            )}
        </div>
    );
}