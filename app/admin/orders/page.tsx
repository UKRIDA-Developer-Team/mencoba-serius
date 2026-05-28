import { prisma } from "@/lib/prisma";
import OrdersClient from "./OrdersClient";

export default async function OrdersPage() {
  const [orders, items] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: { include: { item: true } } },
    }),
    prisma.item.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <OrdersClient orders={orders} items={items} />;
}
