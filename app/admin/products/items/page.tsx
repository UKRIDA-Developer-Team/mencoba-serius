import { prisma } from "@/lib/prisma";
import ItemsClient from "./ItemsClient";

export default async function ItemsPage() {
  const items = await prisma.item.findMany({ orderBy: { name: "asc" } });
  return <ItemsClient items={items} />;
}
