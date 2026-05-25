import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/features/guest/components/cart/AddToCartButton";
import { getProductBySlug } from "@/lib/data/product";

export default async function CatalogSlugPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) notFound();

    return (
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-5 text-sm">
                <Link href="/catalog" className="text-primary hover:underline">
                    Catalog
                </Link>
                <span className="mx-2 text-foreground/60">/</span>
                <span className="text-foreground/70">{product.name}</span>
            </div>

            <article className="bg-card border border-border rounded-2xl overflow-hidden grid md:grid-cols-2">
                <div className="relative aspect-square bg-background">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                <div className="p-5 sm:p-6 flex flex-col gap-4">
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
            </article>
        </section>
    );
}
