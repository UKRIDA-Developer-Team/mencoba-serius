"use client";

import Link from "next/link";
import AddToCartButton from "@/features/guest/components/cart/AddToCartButton";
import type { VariantOption } from "@/features/guest/components/cart/VariantPickerModal";

type HomeProductCardActionsProps = {
    product: {
        slug: string;
        name: string;
        image: string;
        category: string;
        size: string;
        price: number;
    };
    variants: VariantOption[];
};

export default function HomeProductCardActions({
    product,
    variants,
}: HomeProductCardActionsProps) {
    return (
        <div className="grid grid-cols-2 mt-4">
            <Link
                href={`/catalog/${product.slug}`}
                className="py-2.5 font-bold bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors duration-200 text-center block border-r border-primary/20"
            >
                View
            </Link>
            <AddToCartButton
                item={{
                    slug: product.slug,
                    name: product.name,
                    image: product.image,
                    category: product.category,
                    size: product.size,
                    price: product.price,
                }}
                variants={variants.length > 0 ? variants : undefined}
                className="!rounded-none py-2.5 font-bold text-sm h-auto"
                label="Add to Cart"
            />
        </div>
    );
}
