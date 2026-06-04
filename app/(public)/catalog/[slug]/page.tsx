import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/features/guest/components/cart/AddToCartButton";
import { getProductBySlug, getVariantsByProductId } from "@/lib/data/product";

export default async function CatalogSlugPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) notFound();

    const variants = await getVariantsByProductId(product.id);

    return (
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-5 text-sm">
                <Link href="/catalog" className="text-primary hover:underline">
                    Catalog
                </Link>
                <span className="mx-2 text-foreground/60">/</span>
                <span className="text-foreground/70">{product.name}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Product image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                {/* Product details */}
                <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-xs tracking-wide uppercase text-foreground/70">{product.category}</p>
                        <h1 className="text-2xl font-semibold text-primary mt-1">{product.name}</h1>
                        <p className="text-lg font-semibold mt-2">
                            {product.price.toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                            })}
                        </p>
                    </div>

                    <div className="flex gap-2 flex-wrap text-xs">
                        <span className="border border-border rounded-full px-3 py-1">Size: {product.size}</span>
                        <span className="border border-border rounded-full px-3 py-1">Freshly made daily</span>
                    </div>

                    <p className="text-sm text-foreground/75 leading-relaxed">{product.description}</p>

                    {/* Variants section */}
                    {variants.length > 0 && (
                        <div className="space-y-2">
                            <h2 className="text-sm font-semibold text-foreground/80">Varian Tersedia</h2>
                            <div className="grid gap-2">
                                {variants.map((variant) => {
                                    const hasPriceChange = variant.priceOverride !== null && variant.priceOverride !== product.price;
                                    const price = variant.priceOverride ?? product.price;

                                    return (
                                        <div
                                            key={variant.id}
                                            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border bg-card/50"
                                        >
                                            <span className="text-sm">{variant.label}</span>
                                            {hasPriceChange ? (
                                                <span className="text-sm font-semibold text-chart-2 whitespace-nowrap">
                                                    {price.toLocaleString("id-ID", {
                                                        style: "currency",
                                                        currency: "IDR",
                                                        minimumFractionDigits: 0,
                                                    })}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-foreground/50 whitespace-nowrap">
                                                    Harga dasar
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-auto grid sm:grid-cols-2 gap-2">
                        <AddToCartButton
                            item={{
                                slug: product.slug,
                                name: product.name,
                                image: product.image,
                                category: product.category,
                                size: product.size,
                                price: product.price,
                            }}
                            variants={variants.length > 0 ? variants.map((v) => ({
                                id: v.id,
                                label: v.label,
                                priceOverride: v.priceOverride,
                            })) : undefined}
                            className="h-10"
                            label="Add to Cart"
                        />
                        <Link
                            href="/cart"
                            className="h-10 rounded-lg border border-border text-sm font-medium inline-flex items-center justify-center hover:bg-background transition-colors"
                        >
                            Go to Cart
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
