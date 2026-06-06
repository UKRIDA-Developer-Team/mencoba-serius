"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, ChevronDown, ChevronRight, PackageOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type OrderStatus = "DRAFT" | "CONFIRMED" | "IN_PRODUCTION" | "READY" | "COMPLETED" | "CANCELLED";

type OrderItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: string;
  status: OrderStatus;
  totalAmount: number;
  orderedAt: string;
  items: {
    id: string;
    itemNameSnapshot: string;
    quantity: number;
    unitPrice: number;
    notes: string | null;
    customCake: {
      occasion: string | null;
      cakeSizeLabel: string | null;
      flavor: string | null;
      designNotes: string | null;
      inscriptionText: string | null;
    } | null;
  }[];
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch("/api/admin/orders");
      const payload = await response.json();
      if (response.ok && payload.success) {
        setOrders(payload.data);
      }
    } catch {
      toast.error("Gagal memuat order");
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
      toast.success("Status order diperbarui");
    } catch {
      toast.error("Gagal memperbarui status");
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
                <div key={order.id} className="rounded-xl border border-border/50 bg-card mb-3 last:mb-0 overflow-hidden transition-colors hover:border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3">
                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="text-muted-foreground hover:text-accent transition-colors shrink-0"
                    >
                      {expandedId === order.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </button>

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
                        <span className="flex items-center gap-1">
                          <PackageOpen className="size-3" />
                          {order.items?.length || 0} items
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
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                      >
                        <SelectTrigger className="bg-card border-border rounded-lg px-2 text-xs focus:ring-accent/40 focus:border-accent transition-colors min-w-[120px] h-8">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {expandedId === order.id && (
                    <div className="px-4 pb-4 pt-1 border-t border-border/50 bg-muted/10">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 mt-2">
                        Detail Item
                      </p>
                      
                      {(!order.items || order.items.length === 0) ? (
                        <p className="text-xs text-muted-foreground">Tidak ada detail item.</p>
                      ) : (
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg border border-border/50 bg-card">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {(() => {
                                    const dashIdx = item.itemNameSnapshot.indexOf(" \u2014 ");
                                    const nameWithSize = dashIdx >= 0 ? item.itemNameSnapshot.slice(0, dashIdx) : item.itemNameSnapshot;
                                    const variant = dashIdx >= 0 ? item.itemNameSnapshot.slice(dashIdx + 3) : null;
                                    const sizeMatch = nameWithSize.match(/\(([^)]+)\)\s*$/);
                                    const productName = sizeMatch ? nameWithSize.slice(0, sizeMatch.index).trim() : nameWithSize;
                                    const size = sizeMatch ? sizeMatch[1] : null;

                                    return (
                                      <>
                                        <p className="text-sm font-medium">{productName.replace(/ \(\)$/, "")}</p>
                                        {size && !variant && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium">
                                            {size}
                                          </span>
                                        )}
                                        {variant && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium">
                                            {variant}
                                          </span>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                                
                                {/* Custom Cake Details */}
                                {item.customCake && (
                                  <div className="mt-2 space-y-1 bg-accent/5 p-2 rounded text-xs border border-accent/10">
                                    <p className="font-medium text-accent-foreground mb-1">Customization</p>
                                    {item.customCake.occasion && <p><span className="text-muted-foreground">Acara:</span> {item.customCake.occasion}</p>}
                                    {item.customCake.cakeSizeLabel && <p><span className="text-muted-foreground">Ukuran:</span> {item.customCake.cakeSizeLabel}</p>}
                                    {item.customCake.flavor && <p><span className="text-muted-foreground">Rasa:</span> {item.customCake.flavor}</p>}
                                    {item.customCake.designNotes && <p><span className="text-muted-foreground">Desain:</span> {item.customCake.designNotes}</p>}
                                    {item.customCake.inscriptionText && <p><span className="text-muted-foreground">Tulisan:</span> {item.customCake.inscriptionText}</p>}
                                  </div>
                                )}
                                
                                {/* Notes */}
                                {item.notes && (
                                  <p className="text-xs mt-1.5 text-muted-foreground bg-muted p-1.5 rounded inline-block">
                                    <span className="font-medium text-foreground">Catatan:</span> {item.notes}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-start gap-4 sm:gap-6 shrink-0 text-right">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">Harga</p>
                                  <p className="text-sm tabular-nums">{formatIDR(item.unitPrice)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">Qty</p>
                                  <p className="text-sm font-medium tabular-nums">{item.quantity}x</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">Subtotal</p>
                                  <p className="text-sm font-semibold tabular-nums">{formatIDR(item.unitPrice * item.quantity)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </section>
  );
}
