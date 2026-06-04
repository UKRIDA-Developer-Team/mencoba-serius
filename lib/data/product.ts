import { db } from "@/lib/db";
import { products, productCategories, productVariants } from "@/lib/schema";
import { eq, ilike, and, desc, not, inArray } from "drizzle-orm";
import type { Product } from "@/lib/schemas/product";

// Map database product to frontend Product type
function mapDbProductToProduct(dbProduct: any, categoryName: string): Product {
    return {
        id: Number(dbProduct.id),
        slug: dbProduct.slug,
        name: dbProduct.name,
        description: dbProduct.description || "",
        price: Number(dbProduct.basePrice),
        image: dbProduct.imagePath || "/product/chocolate-cake.webp",
        category: categoryName,
        size: dbProduct.sizeLabel || "20 cm",
    };
}

export async function getProducts(options?: {
    search?: string;
    category?: string;
    limit?: number;
}): Promise<Product[]> {
    try {
        const conditions = [eq(products.isActive, true)];

        if (options?.search) {
            const searchTerm = `%${options.search}%`;
            conditions.push(ilike(products.name, searchTerm));
        }

        if (options?.category) {
            conditions.push(eq(productCategories.name, options.category));
        }

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
            .where(and(...conditions))
            .limit(options?.limit || 100)
            .execute();

        return result.map((row) =>
            mapDbProductToProduct(row, row.categoryName || "")
        );
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    try {
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

        if (result.length === 0) return null;

        return mapDbProductToProduct(result[0], result[0].categoryName || "");
    } catch (error) {
        console.error("Error fetching product by slug:", error);
        return null;
    }
}

function getSeasonalCategory(): string {
    const month = new Date().getMonth();
    // 0-indexed months
    switch (month) {
        case 0: return "Lunar New Year";
        case 1: return "Valentine";
        case 2: return "Ramadhan";
        case 3: return "Eid Mubarak";
        case 4: return "Mother's Day";
        case 5: return "Anniversary"; //"Summer";
        case 6: return "Hijriah New Year";
        case 7: return "Independence Day";
        case 8: return "Autumn";
        case 9: return "Halloween";
        case 10: return "Thanksgiving";
        case 11: return "Christmas";
        default: return "Seasonal";
    }
}

export async function getRecommendedProducts(): Promise<Product[]> {
    try {
        const seasonalCat = getSeasonalCategory();

        // 1. Try to get seasonal products
        const seasonalProducts = await db
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
            .where(
                and(
                    eq(products.isActive, true),
                    eq(productCategories.name, seasonalCat)
                )
            )
            .orderBy(desc(products.id))
            .limit(5)
            .execute();

        let results = seasonalProducts.map((row) => {
            const product = mapDbProductToProduct(row, row.categoryName || "");
            return { ...product, tag: seasonalCat };
        });
        console.log(`Found ${results.length} seasonal products for category "${seasonalCat}"`);

        // 2. If we don't have enough, fill with "high sales" proxy (latest active products)
        if (results.length < 5) {
            const remaining = 5 - results.length;
            const existingIds = results.map(r => BigInt(r.id));

            const conditions = [eq(products.isActive, true)];
            if (existingIds.length > 0) {
                conditions.push(not(inArray(products.id, existingIds)));
            }

            const highSalesProxy = await db
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
                .where(and(...conditions))
                .orderBy(desc(products.id)) // Proxy for high sales
                .limit(remaining)
                .execute();

            const additionalProducts = highSalesProxy.map((row) => {
                const product = mapDbProductToProduct(row, row.categoryName || "");
                return { ...product, tag: "Best Seller" };
            });

            results = [...results, ...additionalProducts];
        }

        return results;
    } catch (error) {
        console.error("Error fetching recommended products:", error);
        return [];
    }
}

export type ProductVariant = {
    id: number;
    label: string;
    priceOverride: number | null;
    sortOrder: number;
};

export async function getVariantsByProductId(productId: number): Promise<ProductVariant[]> {
    try {
        const result = await db
            .select({
                id: productVariants.id,
                label: productVariants.label,
                priceOverride: productVariants.priceOverride,
                sortOrder: productVariants.sortOrder,
            })
            .from(productVariants)
            .where(
                and(
                    eq(productVariants.productId, BigInt(productId)),
                    eq(productVariants.isActive, true)
                )
            )
            .orderBy(productVariants.sortOrder)
            .execute();

        return result.map((row) => ({
            id: Number(row.id),
            label: row.label,
            priceOverride: row.priceOverride ? Number(row.priceOverride) : null,
            sortOrder: row.sortOrder,
        }));
    } catch (error) {
        console.error("Error fetching variants:", error);
        return [];
    }
}

export async function getVariantsForProducts(
    productIds: number[]
): Promise<Map<number, ProductVariant[]>> {
    try {
        const bigIntIds = productIds.map((id) => BigInt(id));
        const result = await db
            .select({
                id: productVariants.id,
                productId: productVariants.productId,
                label: productVariants.label,
                priceOverride: productVariants.priceOverride,
                sortOrder: productVariants.sortOrder,
            })
            .from(productVariants)
            .where(
                and(
                    inArray(productVariants.productId, bigIntIds),
                    eq(productVariants.isActive, true)
                )
            )
            .orderBy(productVariants.sortOrder)
            .execute();

        const variantMap = new Map<number, ProductVariant[]>();
        for (const row of result) {
            const pid = Number(row.productId);
            const variant: ProductVariant = {
                id: Number(row.id),
                label: row.label,
                priceOverride: row.priceOverride ? Number(row.priceOverride) : null,
                sortOrder: row.sortOrder,
            };
            const existing = variantMap.get(pid) || [];
            existing.push(variant);
            variantMap.set(pid, existing);
        }
        return variantMap;
    } catch (error) {
        console.error("Error fetching variants for products:", error);
        return new Map();
    }
}
