"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createIngredient(formData: FormData) {
  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;
  const currentStock = parseFloat(formData.get("currentStock") as string) || 0;
  const minStock = parseFloat(formData.get("minStock") as string) || 0;
  const pricePerUnit = parseFloat(formData.get("pricePerUnit") as string) || 0;

  await prisma.ingredient.create({
    data: { name, unit, currentStock, minStock, pricePerUnit },
  });
  revalidatePath("/admin/inventory/ingredients");
}

export async function updateIngredient(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;
  const currentStock = parseFloat(formData.get("currentStock") as string) || 0;
  const minStock = parseFloat(formData.get("minStock") as string) || 0;
  const pricePerUnit = parseFloat(formData.get("pricePerUnit") as string) || 0;

  await prisma.ingredient.update({
    where: { id },
    data: { name, unit, currentStock, minStock, pricePerUnit },
  });
  revalidatePath("/admin/inventory/ingredients");
}

export async function deleteIngredient(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  await prisma.ingredient.delete({ where: { id } });
  revalidatePath("/admin/inventory/ingredients");
}
