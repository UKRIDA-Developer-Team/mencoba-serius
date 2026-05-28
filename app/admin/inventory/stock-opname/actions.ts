"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createStockOpname(formData: FormData) {
  const ingredientId = parseInt(formData.get("ingredientId") as string);
  const physicalCount = parseFloat(formData.get("physicalCount") as string);
  const notes = formData.get("notes") as string;

  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
  });
  if (!ingredient) throw new Error("Ingredient not found");

  const systemStock = ingredient.currentStock;
  const difference = physicalCount - systemStock;

  await prisma.$transaction([
    prisma.stockOpname.create({
      data: {
        ingredientId,
        systemStock,
        physicalCount,
        difference,
        notes: notes || null,
      },
    }),
    prisma.ingredient.update({
      where: { id: ingredientId },
      data: { currentStock: physicalCount },
    }),
  ]);

  revalidatePath("/admin/inventory/stock-opname");
  revalidatePath("/admin/inventory/ingredients");
}

export async function deleteStockOpname(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  await prisma.stockOpname.delete({ where: { id } });
  revalidatePath("/admin/inventory/stock-opname");
}
