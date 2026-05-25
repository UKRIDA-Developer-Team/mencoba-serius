import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, productCategories } from "@/lib/schema";
import { eq, like, and } from "drizzle-orm";
import { CreateProductSchema } from "@/lib/schemas/product";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const search = searchParams.get("search");
        const category = searchParams.get("category");

        let query = db
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
            .where(eq(products.isActive, true));

        if (search) {
            const searchTerm = `%${search.toLowerCase()}%`;
            query = query.where(like(products.name, searchTerm));
        }

        if (category) {
            query = query.where(eq(productCategories.name, category));
        }

        const result = await query.execute();

        const mapped = result.map((row) => ({
            id: Number(row.id),
            slug: row.slug,
            name: row.name,
            description: row.description,
            price: Number(row.basePrice),
            image: row.imagePath || "/product/chocolate-cake.webp",
            category: row.categoryName || "",
            size: row.sizeLabel || "20 cm",
        }));

        return Response.json({ data: mapped, message: "Products fetched successfully" });
    } catch (error) {
        console.error("Error fetching products:", error);
        return Response.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = CreateProductSchema.parse(body);

        // Check if slug exists
        const existing = await db
            .select()
            .from(products)
            .where(eq(products.slug, parsed.slug))
            .limit(1)
            .execute();

        if (existing.length > 0) {
            return Response.json(
                { error: "A product with this slug already exists" },
                { status: 409 }
            );
        }

        // Get default category or create
        let categoryId = BigInt(1);
        const categoryResult = await db
            .select()
            .from(productCategories)
            .where(eq(productCategories.name, parsed.category))
            .limit(1)
            .execute();

        if (categoryResult.length > 0) {
            categoryId = categoryResult[0].id;
        }

        const newProduct = await db
            .insert(products)
            .values({
                slug: parsed.slug,
                name: parsed.name,
                description: parsed.description,
                categoryId,
                basePrice: parsed.price.toString(),
                sizeLabel: parsed.size,
                imagePath: parsed.image,
                isActive: true,
            })
            .returning()
            .execute();

        if (newProduct.length === 0) {
            throw new Error("Failed to create product");
        }

        const created = newProduct[0];
        const response = {
            id: Number(created.id),
            slug: created.slug,
            name: created.name,
            description: created.description,
            price: Number(created.basePrice),
            image: created.imagePath || "/product/chocolate-cake.webp",
            category: parsed.category,
            size: created.sizeLabel || "20 cm",
        };

        return Response.json(
            { data: response, message: "Product created successfully" },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return Response.json(
                { error: "Validation failed", details: error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}