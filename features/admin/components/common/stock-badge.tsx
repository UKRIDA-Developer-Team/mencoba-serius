"use client";

import { Badge } from "@/components/ui/badge";
import { getStockBadgeLabel } from "@/features/admin/utils/formatting";

type StockBadgeProps = {
    severity: "critical" | "warning" | "ok";
};

const variantMap = {
    critical: "destructive",
    warning: "secondary",
    ok: "default",
} as const;

export function StockBadge({ severity }: StockBadgeProps) {
    return (
        <Badge variant={variantMap[severity]}>
            {getStockBadgeLabel(severity)}
        </Badge>
    );
}
