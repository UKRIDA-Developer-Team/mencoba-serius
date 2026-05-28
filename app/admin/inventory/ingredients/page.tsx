import { prisma } from "@/lib/prisma";
import IngredientsClient from "./IngredientsClient";

export default async function IngredientsPage() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
  });
  return <IngredientsClient ingredients={ingredients} />;
}
