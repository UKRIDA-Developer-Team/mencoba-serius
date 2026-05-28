"use client";

import { useState } from "react";
import { createOrder, updateOrderStatus, deleteOrder } from "./actions";
import type { Item, Order, OrderItem } from "@/app/generated/prisma/client";
import { Plus, X, Trash2, ChevronDown, Eye } from "lucide-react";

type FullOrder = Order & {
  items: (OrderItem & { item: Item })[];
};

type Props = {
  orders: FullOrder[];
  items: Item[];
};

type OrderRow = { itemId: string; quantity: string };

const ORDER_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersClient({ orders, items }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [viewOrder, setViewOrder] = useState<FullOrder | null>(null);
  const [rows, setRows] = useState<OrderRow[]>([{ itemId: "", quantity: "1" }]);

  function closeForm() {
    setShowForm(false);
    setRows([{ itemId: "", quantity: "1" }]);
  }

  function addRow() {
    setRows((r) => [...r, { itemId: "", quantity: "1" }]);
  }

  function removeRow(idx: number) {
    setRows((r) => r.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, field: keyof OrderRow, value: string) {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  async function handleCreate(formData: FormData) {
    await createOrder(formData);
    closeForm();
  }

  async function handleStatusChange(formData: FormData) {
    await updateOrderStatus(formData);
  }

  async function handleDelete(formData: FormData) {
    await deleteOrder(formData);
  }

  const orderTotal = rows.reduce((sum, row) => {
    const item = items.find((i) => String(i.id) === row.itemId);
    return sum + (item ? item.price * (parseInt(row.quantity) || 0) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer orders</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Create Order Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 my-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">New Order</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form action={handleCreate} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Order Items <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addRow}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add item
                  </button>
                </div>
                <div className="space-y-2">
                  {rows.map((row, idx) => {
                    const selectedItem = items.find(
                      (i) => String(i.id) === row.itemId
                    );
                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <select
                            name="itemId[]"
                            value={row.itemId}
                            onChange={(e) =>
                              updateRow(idx, "itemId", e.target.value)
                            }
                            required
                            className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-6"
                          >
                            <option value="">Select item…</option>
                            {items.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} — Rp{" "}
                                {item.price.toLocaleString("id-ID")}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2 top-2.5 text-gray-400 pointer-events-none"
                          />
                        </div>
                        <input
                          name="quantity[]"
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) =>
                            updateRow(idx, "quantity", e.target.value)
                          }
                          required
                          placeholder="Qty"
                          className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {selectedItem && (
                          <span className="text-xs text-gray-500 w-24 text-right">
                            Rp{" "}
                            {(
                              selectedItem.price * (parseInt(row.quantity) || 0)
                            ).toLocaleString("id-ID")}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          disabled={rows.length === 1}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {orderTotal > 0 && (
                  <div className="mt-2 text-right text-sm font-semibold text-gray-900">
                    Total: Rp {orderTotal.toLocaleString("id-ID")}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Special requests or notes…"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Create Order
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">{viewOrder.orderNumber}</h2>
              <button
                onClick={() => setViewOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[viewOrder.status]}`}
                >
                  {viewOrder.status}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span>
                  {new Date(viewOrder.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {viewOrder.notes && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Notes</span>
                  <span className="text-right max-w-48">{viewOrder.notes}</span>
                </div>
              )}
              <hr />
              <div className="space-y-2">
                {viewOrder.items.map((oi) => (
                  <div key={oi.id} className="flex justify-between text-sm">
                    <span>
                      {oi.item.name} × {oi.quantity}
                    </span>
                    <span>
                      Rp {(oi.price * oi.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>Rp {viewOrder.total.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">
            No orders yet. Click &quot;New Order&quot; to get started.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Order #</th>
                <th className="px-6 py-3 text-left">Items</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {order.items.map((oi) => oi.item.name).join(", ")}
                  </td>
                  <td className="px-6 py-3">
                    Rp {order.total.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-3">
                    <form action={handleStatusChange} className="inline">
                      <input type="hidden" name="id" value={order.id} />
                      <div className="relative">
                        <select
                          name="status"
                          defaultValue={order.status}
                          onChange={(e) => e.currentTarget.form?.requestSubmit()}
                          className={`appearance-none text-xs font-medium px-2 py-1 pr-6 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${statusColors[order.status]}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={10}
                          className="absolute right-1.5 top-2 pointer-events-none"
                        />
                      </div>
                    </form>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewOrder(order)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={order.id} />
                        <button
                          type="submit"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          onClick={(e) => {
                            if (!confirm(`Delete order ${order.orderNumber}?`))
                              e.preventDefault();
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
