import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductActions from "@/features/guest/components/catalog/ProductActions";
import { getProductBySlug, getVariantsByProductId, getAllProductSlugs } from "@/lib/data/product";

export const revalidate = 300;

export async function generateStaticParams() {
    const slugs = await getAllProductSlugs();
    return slugs.map((slug) => ({ slug }));
}

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
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-xs tracking-wide uppercase text-foreground/70">{product.category}</p>
                        <h1 className="text-2xl font-semibold text-primary mt-1">{product.name}</h1>
                        {(!variants || variants.length === 0) && (
                            <p className="text-lg font-semibold mt-2">
                                {product.price.toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                })}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2 flex-wrap text-xs">
                        {(!variants || variants.length === 0) && (
                            <span className="border border-border rounded-full px-3 py-1">Size: {product.size}</span>
                        )}
                        <span className="border border-border rounded-full px-3 py-1">Freshly made daily</span>
                    </div>

                    <p className="text-sm text-foreground/75 leading-relaxed">{product.description}</p>

                    <ProductActions
                        product={{
                            slug: product.slug,
                            name: product.name,
                            image: product.image,
                            category: product.category,
                            size: variants.length === 1 ? variants[0].label : product.size,
                            price: product.price,
                        }}
                        variants={variants.map((v) => ({
                            id: v.id,
                            label: v.label,
                            priceOverride: v.priceOverride,
                        }))}
                    />
                </div>
            </div>
        </section>
    );
}
