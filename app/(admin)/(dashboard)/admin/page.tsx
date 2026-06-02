"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authenticatedFetch } from "@/lib/auth/client";
import { useAdminData, useAdminFilters, useAdminState } from "@/features/admin/hooks";
import StatCards from "@/features/admin/components/dashboard/stat-cards";
import RevenueChart, { type DashboardRange } from "@/features/admin/components/dashboard/revenue-chart";
import OrdersDonut from "@/features/admin/components/dashboard/orders-donut";
import RecentOrders from "@/features/admin/components/dashboard/recent-orders";
import { AlertTriangle, ArrowRight, Package, ShoppingBag } from "lucide-react";

type DashboardStats = {
  range: DashboardRange;
  revenue: { date: string; label?: string; revenue: number; orderCount: number }[];
  ordersByStatus: { status: string; count: number }[];
};

type RecentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: string;
  status: string;
  totalAmount: number;
  orderedAt: string;
};

export default function AdminPage() {
  const { ingredients: apiIngredients, products: apiProducts, isLoading } = useAdminData();
  const { ingredients, products } = useAdminState(apiIngredients, apiProducts);
  const { lowStockItems, stats } = useAdminFilters(ingredients, products, "", "");

  const [chartStats, setChartStats] = useState<DashboardStats | null>(null);
  const [chartRange, setChartRange] = useState<DashboardRange>("this_week");
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);

  const loadDashboardStats = useCallback(async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        authenticatedFetch(`/api/admin/dashboard?range=${chartRange}`),
        authenticatedFetch("/api/admin/orders"),
      ]);
      const statsPayload = await statsRes.json();
      const ordersPayload = await ordersRes.json();

      if (statsPayload.success) setChartStats(statsPayload.data);
      if (ordersPayload.success) setRecentOrders(ordersPayload.data.slice(0, 8));
    } catch {
      // silently fail charts
    } finally {
      setIsChartLoading(false);
    }
  }, [chartRange]);

  useEffect(() => {
    setIsChartLoading(true);
    loadDashboardStats();
  }, [loadDashboardStats]);

  if (isLoading) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="size-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-sm">Memuat dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 pb-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary">
          Admin Control Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pantau stok, pendapatan, dan status produksi secara real-time.
        </p>
      </div>

      {/* Stat Cards */}
      <StatCards {...stats} />

      {/* Charts Row */}
      {!isChartLoading && chartStats && (
        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RevenueChart
              data={chartStats.revenue}
              range={chartRange}
              onRangeChange={setChartRange}
            />
          </div>
          <div>
            <OrdersDonut data={chartStats.ordersByStatus} />
          </div>
        </div>
      )}
      {isChartLoading && (
        <div className="grid xl:grid-cols-3 gap-6">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`rounded-xl border border-border bg-card h-56 animate-pulse ${i === 0 ? "xl:col-span-2" : ""}`}
            />
          ))}
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60">
          <div className="flex items-center justify-between px-5 py-3 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-800">
                Low Stock Alert — {lowStockItems.length} item
              </h3>
            </div>
            <Link
              href="/admin/inventory/ingredients"
              className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors"
            >
              Kelola Stok <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-amber-100">
            {lowStockItems.slice(0, 4).map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between px-5 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-amber-900">{item.name}</p>
                  <p className="text-xs text-amber-600 font-mono">{item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium tabular-nums text-amber-800">
                    {item.currentStockBaseQty} {item.baseUnitCode}
                  </p>
                  <p className="text-xs text-amber-600">
                    min {item.reorderLevelBaseQty} {item.baseUnitCode}
                  </p>
                </div>
              </div>
            ))}
            {lowStockItems.length > 4 && (
              <div className="px-5 py-2 text-xs text-amber-600 text-center">
                +{lowStockItems.length - 4} item lainnya
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Row: Recent Orders + Quick Links */}
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentOrders orders={recentOrders} />
        </div>

        {/* Quick Nav */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Akses Cepat
          </h2>
          {[
            {
              href: "/admin/inventory/ingredients",
              icon: Package,
              title: "Kelola Ingredients",
              desc: "Tambah, edit, dan atur stok bahan baku",
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              href: "/admin/products",
              icon: ShoppingBag,
              title: "Kelola Produk",
              desc: "Katalog produk, harga, dan varian",
              color: "text-accent",
              bg: "bg-accent/10",
            },
            {
              href: "/admin/inventory/stock-opname",
              icon: Package,
              title: "Stock Opname",
              desc: "Catat penyesuaian stok fisik",
              color: "text-primary",
              bg: "bg-primary/10",
            },
          ].map(({ href, icon: Icon, title, desc, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className={`size-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`size-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform ml-auto shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
