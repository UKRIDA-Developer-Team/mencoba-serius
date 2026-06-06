import Image from "next/image";
import Link from "next/link";
import { getProducts, getVariantsForProducts } from "@/lib/data/product";
import AddToCartButton from "../cart/AddToCartButton";

export default async function Products() {
    const products = await getProducts({ limit: 6 });

    // Fetch variants for all products in one query
    const productIds = products.map((p) => p.id);
    const variantMap = await getVariantsForProducts(productIds);

    return (
        <section className="my-6 px-4 sm:px-6 md:px-8 w-full max-w-6xl mx-auto" aria-label="Produk Pilihan">
            <h2 className="text-3xl font-bold text-primary mt-3 mb-7 text-center">
                Produk Kami
            </h2>

            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {products.map((product) => {
                        const variants = variantMap[product.id] || [];
                        return (
                            <article
                                key={product.slug}
                                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col"
                            >
                                <Link href={`/catalog/${product.slug}`} className="relative aspect-square bg-background">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    {variants.length >= 2 && (
                                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs uppercase font-semibold tracking-[0.08em] shadow-sm z-10"
                                            style={{ backgroundColor: "var(--color-accent)" }}>
                                            Varian Tersedia
                                        </div>
                                    )}
                                </Link>

                                <div className="p-4 flex flex-col gap-3 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h2 className="font-semibold text-primary">{product.name}</h2>
                                        {variants.length === 0 && (
                                            <span className="text-sm whitespace-nowrap border border-border rounded-full px-2 py-1">
                                                {product.size}
                                            </span>
                                        )}
                                        {variants.length > 0 && (
                                            <span className="text-sm whitespace-nowrap border border-border rounded-full px-2 py-1">
                                                {variants[0].label}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-foreground/70 line-clamp-3">{product.description}</p>
                                    <p className="text-sm font-semibold">
                                        {product.price.toLocaleString("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                            minimumFractionDigits: 0,
                                        })}
                                    </p>
                                    <div className="mt-auto grid grid-cols-2 gap-2">
                                        <Link
                                            href={`/catalog/${product.slug}`}
                                            className="h-9 rounded-lg border border-border text-sm font-medium inline-flex items-center justify-center hover:bg-background transition-colors"
                                        >
                                            View
                                        </Link>
                                        <AddToCartButton
                                            item={{
                                                slug: product.slug,
                                                name: product.name,
                                                image: product.image,
                                                category: product.category,
                                                size: variants.length === 1 ? variants[0].label : product.size,
                                                price: product.price,
                                            }}
                                            variants={variants.length > 0 ? variants.map((v) => ({
                                                id: v.id,
                                                label: v.label,
                                                priceOverride: v.priceOverride,
                                            })) : undefined}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-center">
                    <Link
                        href="/catalog"
                        className="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        Lihat Semua Produk
                    </Link>
                </div>
            </div>
        </section>
    );
}
