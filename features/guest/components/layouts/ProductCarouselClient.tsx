"use client";

import Image from "next/image";
import Link from "next/link";
import { Carousel } from "@/components/ui/carousel";
import type { Product } from "@/lib/schemas/product";

export default function ProductCarouselClient({
    products,
}: {
    products: Product[];
}) {
    const slides = products.map((product) => (
        <Link
            key={product.slug}
            href={`/product/${product.slug}`}
            className="block relative h-60 sm:h-80 overflow-hidden"
            aria-label={`View details for ${product.name}, priced at Rp ${product.price.toLocaleString('id-ID')}`}
        >
            <Image
                src={product.image}
                alt={`${product.name} - ${product.category} cake, ${product.size} size`}
                fill
                className="object-cover"
                sizes="100vw"
            />

            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/20 to-transparent px-5 py-4">
                <h3 className="text-white font-bold text-base leading-tight">
                    {product.name}
                </h3>
                <p className="text-white/80 text-sm mt-0.5">
                    {product.price.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                    })}
                </p>
            </div>
        </Link>
    ));

    return (
        <Carousel
            slides={slides}
            options={{ loop: true, align: "start" }}
            slideClassName="flex-[0_0_85%] sm:flex-[0_0_55%] md:flex-[0_0_48%] lg:flex-[0_0_38%] pl-4"
        />
    );
}
