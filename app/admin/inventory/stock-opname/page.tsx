import { prisma } from "@/lib/prisma";
import StockOpnameClient from "./StockOpnameClient";

export default async function StockOpnamePage() {
  const [opnames, ingredients] = await Promise.all([
    prisma.stockOpname.findMany({
      orderBy: { date: "desc" },
      include: { ingredient: true },
    }),
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <StockOpnameClient opnames={opnames} ingredients={ingredients} />;
}
