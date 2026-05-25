import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/features/guest/components/cart/AddToCartButton";
import { getProducts } from "@/lib/data/product";

export const metadata: Metadata = {
  title: "Kategori Kue - Chef On Pointe",
  description: "Jelajahi kue kami berdasarkan kategori: Ulang Tahun, Pernikahan, Anniversary, dan Spesial.",
};

async function getCategories() {
  const allProducts = await getProducts();
  const uniqueCategories = Array.from(new Set(allProducts.map((p) => p.category)));
  return uniqueCategories.sort();
}

export default async function CategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.category?.trim() || "";

  const categories = await getCategories();
  const categoryDescriptions: Record<string, string> = {
    Birthday: "Kue spesial untuk merayakan hari istimewa seseorang",
    Wedding: "Kue indah untuk momen pernikahan yang tak terlupakan",
    Anniversary: "Kue elegan untuk merayakan milestone penting",
    Special: "Pilihan spesial kami dengan desain unik",
  };

  let products = await getProducts();
  if (selectedCategory) {
    products = await getProducts({ category: selectedCategory });
  }

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">
          Kategori Kue Kami
        </h1>
        <p className="text-sm text-foreground/70">
          Pilih kategori untuk melihat koleksi kue yang sesuai dengan acara Anda.
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/category?category=${encodeURIComponent(category)}`}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedCategory === category
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <h3 className="font-semibold text-primary text-lg">{category}</h3>
            <p className="text-xs text-foreground/60 mt-1">
              {categoryDescriptions[category] || ""}
            </p>
          </Link>
        ))}
      </div>

      {/* Products Display */}
      {selectedCategory && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-1">
              {selectedCategory} Cakes
            </h2>
            <p className="text-sm text-foreground/70">
              {products.length} produk tersedia
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {products.map((product) => (
                <div
                  key={product.slug}
                  className="bg-[#faf6f1] flex flex-col border border-primary overflow-hidden rounded-t-xl shadow-md"
                >
                  <Link href={`/product/${product.slug}`} className="relative overflow-hidden bg-background h-48 flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={`${product.name} - ${product.category} cake, ${product.size}`}
                      fill
                      className="object-contain p-2"
                    />
                  </Link>

                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <Link href={`/product/${product.slug}`} className="hover:underline">
                      <h3 className="font-semibold text-primary line-clamp-2">{product.name}</h3>
                    </Link>

                    <p className="text-xs text-foreground/60 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex gap-2 flex-wrap text-xs text-foreground/60 mb-2">
                      <span className="border border-border rounded-full px-2 py-0.5">{product.category}</span>
                      <span className="border border-border rounded-full px-2 py-0.5">{product.size}</span>
                    </div>

                    <div className="mt-auto space-y-2">
                      <p className="font-semibold text-primary text-sm">
                        {product.price.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        })}
                      </p>
                      <AddToCartButton
                        item={product}
                        label="Tambah ke Keranjang"
                        className="w-full h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-foreground/70">Tidak ada produk di kategori ini.</p>
            </div>
          )}
        </div>
      )}

      {!selectedCategory && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-foreground/70">Pilih kategori di atas untuk melihat produk.</p>
        </div>
      )}
    </section>
  );
}