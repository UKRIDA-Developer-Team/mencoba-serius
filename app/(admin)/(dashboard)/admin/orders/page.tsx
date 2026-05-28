"use client";

import { useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Toast from "@/features/admin/components/dashboard/toast";

type OrderType = "WALK_IN" | "PRE_ORDER" | "CUSTOM_CAKE";
type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

type OrderItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: OrderType;
  status: OrderStatus;
  totalAmount: number;
  orderedAt: string;
};

const ORDER_TYPES: OrderType[] = ["WALK_IN", "PRE_ORDER", "CUSTOM_CAKE"];
const ORDER_STATUSES: OrderStatus[] = [
  "DRAFT",
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    orderType: "WALK_IN" as OrderType,
    totalAmount: "",
  });

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch("/api/admin/orders");
      const payload = await response.json();
      if (response.ok && payload.success) {
        setOrders(payload.data);
      }
    } catch {
      setToast("Gagal memuat order");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (item) =>
        item.orderNumber.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const handleCreateOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const totalAmount = Number(form.totalAmount || 0);
    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      showToast("Total order tidak valid");
      return;
    }

    try {
      const response = await authenticatedFetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          orderType: form.orderType,
          totalAmount,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error();

      setOrders((prev) => [payload.data, ...prev]);
      setForm({ customerName: "", orderType: "WALK_IN", totalAmount: "" });
      showToast("Order berhasil dibuat");
    } catch {
      showToast("Gagal membuat order");
    }
  };

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

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 pb-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Manajemen Order</h1>
        <p className="text-sm text-foreground/70 mt-1">Kelola pesanan masuk dan update status produksi.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOrder} className="grid md:grid-cols-4 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nama Customer</label>
              <Input
                value={form.customerName}
                onChange={(event) => setForm((prev) => ({ ...prev, customerName: event.target.value }))}
                placeholder="Guest / Nama customer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipe Order</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                value={form.orderType}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, orderType: event.target.value as OrderType }))
                }
              >
                {ORDER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Total (Rp)</label>
              <Input
                type="number"
                min={0}
                value={form.totalAmount}
                onChange={(event) => setForm((prev) => ({ ...prev, totalAmount: event.target.value }))}
                required
              />
            </div>
            <Button type="submit">Simpan Order</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Daftar Order</CardTitle>
            <Input
              className="w-52"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nomor/customer"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada order.</p>
          ) : (
            <div className="space-y-2">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-3 border rounded-lg grid md:grid-cols-5 gap-3 items-center">
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                  </div>
                  <p className="text-sm">{order.orderType}</p>
                  <p className="text-sm">Rp {order.totalAmount.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.orderedAt).toLocaleString("id-ID")}
                  </p>
                  <select
                    className="w-full px-2 py-1 border rounded-md text-sm bg-white"
                    value={order.status}
                    onChange={(event) => handleStatusChange(order.id, event.target.value as OrderStatus)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
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
