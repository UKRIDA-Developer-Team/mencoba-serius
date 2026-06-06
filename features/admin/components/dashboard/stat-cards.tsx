"use client";

import { ShoppingBag, Carrot, AlertTriangle, Clock } from "lucide-react";

type StatCardsProps = {
  totalProducts: number;
  totalIngredients: number;
  totalLowStock: number;
  totalPreorderOnly: number;
};

const cards = [
  {
    key: "totalProducts" as const,
    label: "Produk Aktif",
    sublabel: "Tersedia di menu",
    icon: ShoppingBag,
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    valueColor: "text-primary",
  },
  {
    key: "totalIngredients" as const,
    label: "Ingredients",
    sublabel: "Terlacak di inventori",
    icon: Carrot,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    valueColor: "text-primary",
  },
  {
    key: "totalLowStock" as const,
    label: "Low Stock",
    sublabel: "Perlu diisi ulang",
    icon: AlertTriangle,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    valueColor: "text-destructive",
    urgent: true,
  },
  {
    key: "totalPreorderOnly" as const,
    label: "Pre-order",
    sublabel: "Tidak tersedia instan",
    icon: Clock,
    iconBg: "bg-primary/10",
    iconColor: "text-primary/70",
    valueColor: "text-primary",
  },
];

export default function StatCards({
  totalProducts,
  totalIngredients,
  totalLowStock,
  totalPreorderOnly,
}: StatCardsProps) {
  const values = { totalProducts, totalIngredients, totalLowStock, totalPreorderOnly };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, sublabel, icon: Icon, iconBg, iconColor, valueColor, urgent }) => {
        const value = values[key];
        return (
          <div
            key={key}
            className={`relative rounded-xl border p-5 bg-card transition-shadow hover:shadow-md ${
              urgent && value > 0
                ? "border-destructive/30 bg-destructive/5"
                : "border-border"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className={`text-3xl font-bold mt-2 tabular-nums ${valueColor}`}>
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{sublabel}</p>
              </div>
              <div className={`size-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`size-5 ${iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}