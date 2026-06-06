import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/features/guest/components/cart/AddToCartButton";
import { getProducts, getVariantsForProducts } from "@/lib/data/product";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Katalog Kue - Pilih Kue Favorit Anda | Chef On Pointe",
    description: "Jelajahi koleksi lengkap kue custom kami. Kue ulang tahun, pernikahan, anniversary, dan pastry spesial lainnya.",
};

export default async function CatalogPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string }>;
}) {
    const params = await searchParams;
    const selectedCategory = params.category?.trim() || "";
    const search = params.search?.trim() || "";

    const products = await getProducts({
        search: search || undefined,
        category: selectedCategory || undefined,
    });

    // Fetch variants for all products in one query
    const productIds = products.map((p) => p.id);
    const variantMap = await getVariantsForProducts(productIds);

    const categories = Array.from(new Set((await getProducts()).map((product) => product.category)));

    return (
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-semibold text-primary">Katalog Kue</h1>
                <p className="text-sm text-foreground/70">
                    Jelajahi koleksi kue kami, lihat detail dengan cepat, dan tambahkan ke keranjang dalam satu klik.
                </p>
            </div>

            <form className="bg-card border border-border rounded-xl p-4 grid sm:grid-cols-[1fr_auto_auto] gap-3" role="search">
                <label htmlFor="search-cakes" className="flex flex-col gap-2 text-sm">
                    Cari nama kue
                    <input
                        id="search-cakes"
                        type="text"
                        name="search"
                        defaultValue={search}
                        placeholder="Contoh: Coklat"
                        aria-label="Cari kue berdasarkan nama"
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                    Kategori
                    <select
                        name="category"
                        defaultValue={selectedCategory}
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                        <option value="">Semua</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="flex items-end gap-2">
                    <button
                        type="submit"
                        className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/85 transition-colors"
                    >
                        Terapkan
                    </button>
                    <Link
                        href="/catalog"
                        className="h-10 px-4 rounded-lg border border-border text-sm font-medium inline-flex items-center justify-center hover:bg-background transition-colors"
                    >
                        Reset
                    </Link>
                </div>
            </form>

            {products.length === 0 ? (
                <div className="min-h-56 border border-dashed border-border rounded-xl grid place-items-center text-center p-6">
                    <div>
                        <p className="font-semibold">Produk tidak ditemukan</p>
                        <p className="text-sm text-foreground/70 mt-1">Coba kata kunci atau kategori lain.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                                    {(variants.length >= 2) && (
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
                                                size: variants?.length === 1 ? variants[0].label : product.size,
                                                price: product.price,
                                            }}
                                            variants={variants.length >= 2 ? variants.map((v) => ({
                                                id: v.id,
                                                label: v.label,
                                                priceOverride: v.priceOverride,
                                            })) : []}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
