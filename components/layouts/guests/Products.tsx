"use client";

import Image from "next/image";

const products = [
    {
        name: "Chocolate Cake",
        image: "foto-kue.png",
        description:
            "Kue coklat lembut dengan rasa manis pekat dan tekstur yang moist, cocok untuk pecinta coklat sejati.",
    },
    {
        name: "Strawberry Shortcake",
        image: "foto-kue.png",
        description:
            "Kue ringan dengan lapisan krim lembut dan potongan stroberi segar yang memberikan rasa manis dan sedikit asam.",
    },
    {
        name: "Cheesecake",
        image: "foto-kue.png",
        description:
            "Kue keju creamy dengan tekstur halus dan rasa gurih manis yang lumer di mulut setiap gigitan.",
    },
    {
        name: "Red Velvet",
        image: "foto-kue.png",
        description:
            "Kue lembut berwarna merah khas dengan rasa coklat ringan yang dipadukan dengan krim keju yang lezat.",
    },
    {
        name: "Tiramisu",
        image: "foto-kue.png",
        description:
            "Kue klasik Italia dengan lapisan kopi dan krim mascarpone yang lembut serta aroma kopi yang khas.",
    },
    {
        name: "Black Forest",
        image: "foto-kue.png",
        description:
            "Kue coklat dengan lapisan krim dan ceri yang segar, memberikan kombinasi rasa manis dan sedikit asam.",
    },
    {
        name: "Matcha Cake",
        image: "foto-kue.png",
        description:
            "Kue lembut dengan rasa matcha khas Jepang yang sedikit pahit namun seimbang dengan manisnya krim.",
    },
    {
        name: "Vanilla Sponge",
        image: "foto-kue.png",
        description:
            "Kue vanilla yang ringan dan empuk dengan aroma harum yang cocok dinikmati kapan saja.",
    },
    {
        name: "Carrot Cake",
        image: "foto-kue.png",
        description:
            "Kue wortel dengan rasa manis alami dan sentuhan rempah yang hangat serta tekstur yang moist.",
    },
    {
        name: "Lemon Cake",
        image: "foto-kue.png",
        description:
            "Kue dengan rasa lemon yang segar, memberikan perpaduan rasa manis dan asam yang menyegarkan.",
    },
    {
        name: "Opera Cake",
        image: "foto-kue.png",
        description:
            "Kue elegan dengan lapisan kopi, coklat, dan krim yang kaya rasa serta tampilan yang mewah.",
    },
    {
        name: "Chiffon Cake",
        image: "foto-kue.png",
        description:
            "Kue super ringan dan fluffy dengan tekstur lembut seperti kapas, cocok untuk semua kalangan.",
    },
];

export default function Products() {
    return (
        <section className="my-6">
            <h2 className="text-3xl font-bold text-primary mt-3 mb-7 text-center">
                Our Products
            </h2>

            <div className="max-w-md mx-auto sm:max-w-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.name}
                            className="bg-[#faf6f1] flex flex-col border border-primary overflow-hidden rounded-t-xl shadow-md"
                        >
                            <Image
                                src={`/product/${product.image}`}
                                alt={product.name}
                                width={400}
                                height={400}
                                className="w-full object-cover"
                            />

                            <div className="flex flex-col flex-1 gap-3 mx-4 mt-3">
                                <h3 className="text-sm font-bold">{product.name}</h3>
                                <p className="text-xs text-accentLight">{product.description}</p>
                            </div>

                            <button className="py-2.5 font-bold w-full mt-4 bg-primary text-white text-sm hover:bg-primary/80 transition-colors duration-200">
                                Add to Cart
                                {/* TODO: link ke product/nama-kue/ untuk bisa cek informasi lebih lanjut */}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
