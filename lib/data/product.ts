import { productStore } from "@/lib/schemas/product";
import type { Product } from "@/lib/schemas/product";

export function getProducts(options?: {
    search?: string;
    category?: string;
}): Product[] {
    let results = [...productStore];

    if (options?.search) {
        const search = options.search.toLowerCase();
        results = results.filter((p) => p.name.toLowerCase().includes(search));
    }

    if (options?.category) {
        const category = options.category.toLowerCase();
        results = results.filter((p) => p.category.toLowerCase() === category);
    }

    return results;
}

export function getProductBySlug(slug: string): Product | null {
    return productStore.find((p) => p.slug === slug) ?? null;
}

/* Math.max dari semua id yang ada, bukan .length + 1, supaya aman saat ada produk yang dihapus */
export function generateNextId(): number {
    if (productStore.length === 0) return 1;
    return Math.max(...productStore.map((p) => p.id)) + 1;
}

/* TODO: ganti slice ini dengan produk yang dikurasi/dipinned dari database */
export function getRecommendedProducts(): Product[] {
    return productStore.slice(0, 5);
}
