import { prisma } from "@/lib/prisma";
import RecipesClient from "./RecipesClient";

export default async function RecipesPage() {
  const [items, recipes, ingredients] = await Promise.all([
    prisma.item.findMany({ orderBy: { name: "asc" } }),
    prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        item: true,
        ingredients: { include: { ingredient: true } },
      },
    }),
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <RecipesClient items={items} recipes={recipes} ingredients={ingredients} />;
}
