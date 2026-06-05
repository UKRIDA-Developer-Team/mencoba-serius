import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const productResult = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.slug, slug))
            .limit(1)
            .execute();

        if (productResult.length === 0) {
            return Response.json(
                { success: false, error: "Product not found" },
                { status: 404 }
            );
        }

        const variants = await db
            .select({
                id: productVariants.id,
                label: productVariants.label,
                priceOverride: productVariants.priceOverride,
                sortOrder: productVariants.sortOrder,
            })
            .from(productVariants)
            .where(
                and(
                    eq(productVariants.productId, productResult[0].id),
                    eq(productVariants.isActive, true)
                )
            )
            .orderBy(productVariants.sortOrder)
            .execute();

        const mapped = variants.map((v) => ({
            id: Number(v.id),
            label: v.label,
            priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
            sortOrder: v.sortOrder,
        }));

        return Response.json({ success: true, data: mapped });
    } catch (error) {
        console.error("Error fetching variants:", error);
        return Response.json(
            { success: false, error: "Failed to fetch variants" },
            { status: 500 }
        );
    }
}
