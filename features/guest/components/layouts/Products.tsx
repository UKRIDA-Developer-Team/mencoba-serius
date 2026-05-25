import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/data/product";

export default async function Products() {
    const products = getProducts();

    return (
        <section className="my-6 px-4 sm:px-6 md:px-8 w-full max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mt-3 mb-7 text-center">
                Our Products
            </h2>

            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {products.map((product) => (
                        <div
                            key={product.slug}
                            className="bg-[#faf6f1] flex flex-col border border-primary overflow-hidden rounded-t-xl shadow-md"
                        >
                            <div className="relative aspect-square w-full bg-card">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            </div>

                            <div className="flex flex-col flex-1 gap-3 mx-4 mt-3">
                                <h3 className="text-sm font-bold">{product.name}</h3>
                                <p className="text-xs text-accentLight flex-1">{product.description}</p>
                                <p className="text-sm font-semibold text-primary">
                                    {product.price.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })}
                                </p>
                            </div>

                            <Link
                                href={`/catalog/${product.slug}`}
                                className="py-2.5 font-bold w-full mt-4 bg-primary text-white text-sm hover:bg-primary/80 transition-colors duration-200 text-center block"
                            >
                                Lihat Detail
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
