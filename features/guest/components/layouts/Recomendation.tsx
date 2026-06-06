import { getRecommendedProducts } from "@/lib/data/product";
import ProductCarouselClient from "./ProductCarouselClient";

export default async function Recomendation() {
    const products = await getRecommendedProducts();

    return (
        <section className="w-full my-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mt-3 mb-5 text-center px-4">
                Rekomendasi Kami
            </h2>
            {products.length === 0 ? (
                <p className="text-center text-foreground/60 text-sm px-4">
                    Untuk saat ini belum ada rekomendasi
                </p>
            ) : (
                <ProductCarouselClient products={products} />
            )}
        </section>
    );
}