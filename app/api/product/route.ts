import { type NextRequest } from "next/server";
import { CreateProductSchema, productStore } from "@/lib/schemas/product";
import { generateNextId } from "@/lib/data/product";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search")?.toLowerCase();
    const category = searchParams.get("category")?.toLowerCase();

    let results = [...productStore];

    if (search) {
        results = results.filter((p) => p.name.toLowerCase().includes(search));
    }

    if (category) {
        results = results.filter((p) => p.category.toLowerCase() === category);
    }

    return Response.json({ data: results, message: "Products fetched successfully" });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = CreateProductSchema.parse(body);

        const slugExists = productStore.some((p) => p.slug === parsed.slug);
        if (slugExists) {
            return Response.json(
                { error: "A product with this slug already exists" },
                { status: 409 }
            );
        }

        const newProduct = {
            ...parsed,
            id: generateNextId(),
        };

        productStore.push(newProduct);

        return Response.json(
            { data: newProduct, message: "Product created successfully" },
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