import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data/product";
import AddToCartButton from "@/features/guest/components/cart/AddToCartButton";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const product = getProductBySlug(slug);

    if (!product) {
        return {
            title: "Produk Tidak Ditemukan",
        };
    }

    return {
        title: `${product.name} - ${product.category} | Chef On Pointe`,
        description: product.description,
    };
}

export default async function ProductCakePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = getProductBySlug(slug);

    if (!product) notFound();

    return (
        <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block" aria-label="Kembali ke halaman utama">
                Kembali ke Beranda
            </Link>

            <div className="overflow-hidden rounded-xl">
                <div className="relative w-full aspect-square">
                    <Image
                        src={product.image}
                        alt={`${product.name} - ${product.category} cake, ${product.size}, priced at Rp ${product.price.toLocaleString('id-ID')}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 672px"
                    />
                </div>

                <div className="px-3 sm:px-6 py-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-bold text-primary">{product.name}</h1>
                        <span className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                            {product.price.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })}
                        </span>
                    </div>

                    <div className="flex gap-2 flex-wrap text-xs text-gray-500">
                        <span className="border border-border rounded-full px-3 py-1">{product.category}</span>
                        <span className="border border-border rounded-full px-3 py-1">{product.size}</span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <AddToCartButton
                            item={{
                                slug: product.slug,
                                name: product.name,
                                image: product.image,
                                category: product.category,
                                size: product.size,
                                price: product.price,
                            }}
                            className="flex-1 py-4 text-sm"
                        />
                        <Button className="flex-1 py-4 text-sm" variant="outline" size="lg">
                            Contact for Custom Cake
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
