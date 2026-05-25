/**
 * Format number to IDR currency
 */
export function formatIDR(value: number): string {
    return value.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    });
}

/**
 * Get Tailwind classes for stock badge based on severity
 */
export function getStockBadgeClass(severity: "critical" | "warning" | "ok"): string {
    const variants = {
        critical: "bg-destructive/15 text-destructive border-destructive/40",
        warning: "bg-amber-100 text-amber-800 border-amber-300",
        ok: "bg-green-100 text-green-800 border-green-300",
    } as const;
    return variants[severity];
}

/**
 * Get label text for stock badge
 */
export function getStockBadgeLabel(severity: "critical" | "warning" | "ok"): string {
    const labels = {
        critical: "Out of stock",
        warning: "Low stock",
        ok: "Healthy",
    } as const;
    return labels[severity];
}
