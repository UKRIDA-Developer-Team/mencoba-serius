import { productStore } from "@/lib/schemas/product";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const product = productStore.find((p) => p.slug === slug);

    if (!product) {
        return Response.json(
            { error: `Product with slug "${slug}" not found` },
            { status: 404 }
        );
    }

    return Response.json({ data: product, message: "Product fetched successfully" });
}
