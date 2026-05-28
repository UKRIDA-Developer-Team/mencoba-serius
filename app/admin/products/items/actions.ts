"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createItem(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;

  await prisma.item.create({
    data: { name, description: description || null, price, category: category || null },
  });
  revalidatePath("/admin/products/items");
}

export async function updateItem(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;

  await prisma.item.update({
    where: { id },
    data: { name, description: description || null, price, category: category || null },
  });
  revalidatePath("/admin/products/items");
}

export async function deleteItem(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  await prisma.item.delete({ where: { id } });
  revalidatePath("/admin/products/items");
}
