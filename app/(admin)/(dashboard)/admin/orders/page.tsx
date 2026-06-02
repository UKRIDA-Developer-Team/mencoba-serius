"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import Toast from "@/features/admin/components/dashboard/toast";

type OrderStatus = "DRAFT" | "CONFIRMED" | "IN_PRODUCTION" | "READY" | "COMPLETED" | "CANCELLED";

type OrderItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: string;
  status: OrderStatus;
  totalAmount: number;
  orderedAt: string;
};

const ORDER_STATUSES: OrderStatus[] = ["DRAFT", "CONFIRMED", "IN_PRODUCTION", "READY", "COMPLETED", "CANCELLED"];

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Dikonfirmasi",
  IN_PRODUCTION: "Produksi",
  READY: "Siap",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const TYPE_LABELS: Record<string, string> = {
  WALK_IN: "Walk In",
  PRE_ORDER: "Pre-Order",
  CUSTOM_CAKE: "Custom",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-[#B0A499]/15 text-[#B0A499]",
  CONFIRMED: "bg-[#8899C4]/15 text-[#8899C4]",
  IN_PRODUCTION: "bg-[#D4935A]/15 text-[#D4935A]",
  READY: "bg-[#7BAE8F]/15 text-[#7BAE8F]",
  COMPLETED: "bg-primary/10 text-primary",
  CANCELLED: "bg-destructive/10 text-destructive",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status] || "bg-muted text-muted-foreground"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function formatIDR(value: number) {
  return `Rp\u00a0${value.toLocaleString("id-ID")}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch("/api/admin/orders");
      const payload = await response.json();
      if (response.ok && payload.success) {
        setOrders(payload.data);
      }
    } catch {
      showToast("Gagal memuat order");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (item) =>
        item.orderNumber.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      const response = await authenticatedFetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error();

      setOrders((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
      showToast("Status order diperbarui");
    } catch {
      showToast("Gagal memperbarui status");
    }
  };

  // Stats
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [orders]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 pb-12 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary">Manajemen Order</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola pesanan masuk dan update status produksi.
        </p>
      </div>

      {/* Quick Status Chips */}
      <div className="flex flex-wrap gap-2">
        {ORDER_STATUSES.map((s) => (
          <div key={s} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_STYLES[s]}`}>
            <span className="tabular-nums">{statusCounts[s] || 0}</span>
            <span>{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>

      {/* Order List */}
      <Card className="border-border rounded-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Daftar Order</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor / customer..."
                className="pl-9 bg-card border-border rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="size-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <p className="text-sm">Memuat...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ShoppingCart className="size-10 opacity-30 mb-2" />
              <p className="text-sm">Belum ada order.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <div key={order.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-primary font-mono">{order.orderNumber}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{order.customerName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-muted text-xs">
                          {TYPE_LABELS[order.orderType] || order.orderType}
                        </span>
                      </div>
                    </div>

                    {/* Amount + Date */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{formatIDR(order.totalAmount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.orderedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>

                      {/* Status Changer */}
                      <select
                        className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors min-w-[120px]"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Toast message={toast} />
    </section>
  );
}
