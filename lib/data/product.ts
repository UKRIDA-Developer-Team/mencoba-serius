import { db } from "@/lib/db";
import { products, productCategories } from "@/lib/schema";
import { eq, like, and, desc } from "drizzle-orm";
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
}): Promise<Product[]> {
    try {
        const conditions = [eq(products.isActive, true)];

        if (options?.search) {
            const searchTerm = `%${options.search.toLowerCase()}%`;
            conditions.push(like(products.name, searchTerm));
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

export async function getRecommendedProducts(): Promise<Product[]> {
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
            .where(eq(products.isActive, true))
            .orderBy(desc(products.id))
            .limit(5)
            .execute();

        return result.map((row) =>
            mapDbProductToProduct(row, row.categoryName || "")
        );
    } catch (error) {
        console.error("Error fetching recommended products:", error);
        return [];
    }
}
