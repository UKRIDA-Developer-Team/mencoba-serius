"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertRecipe(formData: FormData) {
  const itemId = parseInt(formData.get("itemId") as string);
  const description = formData.get("description") as string;
  const ingredientIds = formData.getAll("ingredientId[]") as string[];
  const quantities = formData.getAll("quantity[]") as string[];
  const units = formData.getAll("unit[]") as string[];

  const existingRecipe = await prisma.recipe.findUnique({ where: { itemId } });

  if (existingRecipe) {
    await prisma.recipe.update({
      where: { itemId },
      data: {
        description: description || null,
        ingredients: {
          deleteMany: {},
          create: ingredientIds.map((ingId, i) => ({
            ingredientId: parseInt(ingId),
            quantity: parseFloat(quantities[i]),
            unit: units[i],
          })),
        },
      },
    });
  } else {
    await prisma.recipe.create({
      data: {
        itemId,
        description: description || null,
        ingredients: {
          create: ingredientIds.map((ingId, i) => ({
            ingredientId: parseInt(ingId),
            quantity: parseFloat(quantities[i]),
            unit: units[i],
          })),
        },
      },
    });
  }

  revalidatePath("/admin/products/recipes");
}

export async function deleteRecipe(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  await prisma.recipe.delete({ where: { id } });
  revalidatePath("/admin/products/recipes");
}
