"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${rand}`;
}

export async function createOrder(formData: FormData) {
  const notes = formData.get("notes") as string;
  const itemIds = formData.getAll("itemId[]") as string[];
  const quantities = formData.getAll("quantity[]") as string[];

  const items = await prisma.item.findMany({
    where: { id: { in: itemIds.map(Number) } },
  });

  const orderItems = itemIds.map((id, i) => {
    const item = items.find((it) => it.id === parseInt(id));
    if (!item) throw new Error(`Item ${id} not found`);
    return { itemId: item.id, quantity: parseInt(quantities[i]), price: item.price };
  });

  const total = orderItems.reduce(
    (sum, oi) => sum + oi.price * oi.quantity,
    0
  );

  await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      notes: notes || null,
      total,
      items: { create: orderItems },
    },
  });

  revalidatePath("/admin/orders");
}

export async function updateOrderStatus(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const status = formData.get("status") as string;
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
}

export async function deleteOrder(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/orders");
}
