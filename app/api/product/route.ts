// TODO: ini isinya itu GET POST all

import { NextRequest } from "next/server";

interface ProductData {
    id: number;
    name: string;
    description: string;
    image: string;
}

// ini cuma lint error dia mw nya nerima const
let products: ProductData[] = [
    {
        id: 1,
        name: "Product 1",
        description: "Product 1",
        image: '/product/foto-kue.png'
    },
    {
        id: 2,
        name: "Product 2",
        description: "Product 2",
        image: '/product/foto-kue.png'
    }
];

export async function GET() {
    return Response.json(products, { status: 200 });
}

export async function POST(req: NextRequest) {
    const body = await req.json();

    if (!body.name || !body.description) {
        return Response.json(
            { error: "Name and Description required" },
            { status: 400 }
        );
    }

    const newProduct: ProductData = {
        id: products.length + 1,
        name: body.name,
        description: body.description,
        image: body.image ?? '/product/foto-kue.png',
    };

    products.push(newProduct);
    return Response.json(newProduct, { status: 201 });
}

// TODO: buat api route untuk product contoh ke gini tapi nanti agak lebih kompleks dikit yah -_- gitulah kira kira