import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { products, productCategories, productVariants } from "@/lib/schema";
import { eq, ilike, and, desc, inArray } from "drizzle-orm";
import type { Product } from "@/lib/schemas/product";

function mapDbProductToProduct(dbProduct: any, categoryName: string): Product {
    let imagePath = dbProduct.imagePath || "/product/default-cake.webp";

    if (imagePath && !imagePath.startsWith("/") && !imagePath.startsWith("http")) {
        imagePath = "/" + imagePath;
    }

    return {
        id: Number(dbProduct.id),
        slug: dbProduct.slug,
        name: dbProduct.name,
        description: dbProduct.description || "",
        price: Number(dbProduct.basePrice),
        image: imagePath,
        category: categoryName,
        size: dbProduct.sizeLabel || "20 cm",
    };
}

// ---------------------------------------------------------------------------
// Product list — cached, tagged "products"
// ---------------------------------------------------------------------------
export const getProducts = unstable_cache(
    async (options?: {
        search?: string;
        category?: string;
        limit?: number;
    }): Promise<Product[]> => {
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
    },
    ["products-list"],
    { revalidate: 300, tags: ["products"] }
);

// ---------------------------------------------------------------------------
// Single product by slug — cached, tagged "product:{slug}" + "products"
// ---------------------------------------------------------------------------
export const getProductBySlug = unstable_cache(
    async (slug: string): Promise<Product | null> => {
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
    },
    ["product-by-slug"],
    { revalidate: 300, tags: ["products"] }
);

function getSeasonalCategory(): string {
    const month = new Date().getMonth();
    switch (month) {
        case 0: return "Lunar New Year";
        case 1: return "Valentine";
        case 2: return "Ramadhan";
        case 3: return "Eid Mubarak";
        case 4: return "Mother's Day";
        case 5: return "Anniversary";
        case 6: return "Hijriah New Year";
        case 7: return "Independence Day";
        case 8: return "Autumn";
        case 9: return "Halloween";
        case 10: return "Thanksgiving";
        case 11: return "Christmas";
        default: return "Seasonal";
    }
}

// ---------------------------------------------------------------------------
// Recommended products — cached, tagged "products"
// ---------------------------------------------------------------------------
export const getRecommendedProducts = unstable_cache(
    async (): Promise<Product[]> => {
        try {
            const recommendedProducts = await db
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
                        eq(products.isRecommended, true)
                    )
                )
                .orderBy(desc(products.id))
                .limit(10)
                .execute();

            return recommendedProducts.map((row) => {
                const product = mapDbProductToProduct(row, row.categoryName || "");
                return { ...product, tag: "Rekomendasi" };
            });
        } catch (error) {
            console.error("Error fetching recommended products:", error);
            return [];
        }
    },
    ["recommended-products"],
    { revalidate: 300, tags: ["products"] }
);

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------
export type ProductVariant = {
    id: number;
    label: string;
    priceOverride: number | null;
    sortOrder: number;
};

export const getVariantsByProductId = unstable_cache(
    async (productId: number): Promise<ProductVariant[]> => {
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
    },
    ["variants-by-product-id"],
    { revalidate: 300, tags: ["variants"] }
);

export type VariantsByProduct = Record<number, ProductVariant[]>;

export const getVariantsForProducts = unstable_cache(
    async (
        productIds: number[]
    ): Promise<VariantsByProduct> => {
        try {
            if (productIds.length === 0) return {};

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

            const variantMap: VariantsByProduct = {};
            for (const row of result) {
                const pid = Number(row.productId);
                const variant: ProductVariant = {
                    id: Number(row.id),
                    label: row.label,
                    priceOverride: row.priceOverride ? Number(row.priceOverride) : null,
                    sortOrder: row.sortOrder,
                };
                if (!variantMap[pid]) variantMap[pid] = [];
                variantMap[pid].push(variant);
            }
            return variantMap;
        } catch (error) {
            console.error("Error fetching variants for products:", error);
            return {};
        }
    },
    ["variants-for-products"],
    { revalidate: 300, tags: ["variants"] }
);

// ---------------------------------------------------------------------------
// All active slugs — used by generateStaticParams (NOT cached — build-only)
// ---------------------------------------------------------------------------
export async function getAllProductSlugs(): Promise<string[]> {
    const result = await db
        .select({ slug: products.slug })
        .from(products)
        .where(eq(products.isActive, true))
        .execute();

    return result.map((row) => row.slug);
}
