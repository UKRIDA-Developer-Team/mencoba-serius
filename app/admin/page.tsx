import { prisma } from "@/lib/prisma";
import { ShoppingCart, Package, Warehouse, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const [itemCount, orderCount, ingredientCount, pendingOrders] =
    await Promise.all([
      prisma.item.count(),
      prisma.order.count(),
      prisma.ingredient.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { items: { include: { item: true } } },
  });

  const stats = [
    {
      label: "Total Orders",
      value: orderCount,
      icon: <ShoppingCart size={24} className="text-indigo-500" />,
      bg: "bg-indigo-50",
    },
    {
      label: "Total Items",
      value: itemCount,
      icon: <Package size={24} className="text-emerald-500" />,
      bg: "bg-emerald-50",
    },
    {
      label: "Ingredients",
      value: ingredientCount,
      icon: <Warehouse size={24} className="text-amber-500" />,
      bg: "bg-amber-50",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: <TrendingUp size={24} className="text-rose-500" />,
      bg: "bg-rose-50",
    },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`p-3 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">
            No orders yet
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {order.items.length} item(s)
                  </td>
                  <td className="px-6 py-3">
                    Rp {order.total.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
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
