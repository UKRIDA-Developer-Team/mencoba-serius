import { db } from "@/lib/db";
import { products, productCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const result = await db
            .select({
                id: products.id,
                slug: products.slug,
                name: products.name,
                description: products.description,
                basePrice: products.basePrice,
                imagePath: products.imagePath,
                sizeLabel: products.sizeLabel,
                categoryName: productCategories.name,
            })
            .from(products)
            .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
            .where(eq(products.slug, slug))
            .limit(1)
            .execute();

        if (result.length === 0) {
            return Response.json(
                { error: `Product with slug "${slug}" not found` },
                { status: 404 }
            );
        }

        const row = result[0];
        const product = {
            id: Number(row.id),
            slug: row.slug,
            name: row.name,
            description: row.description,
            price: Number(row.basePrice),
            image: row.imagePath || "/product/default-cake.webp",
            category: row.categoryName || "",
            size: row.sizeLabel || "20 cm",
        };

        return Response.json({ data: product, message: "Product fetched successfully" });
    } catch (error) {
        console.error("Error fetching product:", error);
        return Response.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}
