import { z } from "zod";

export const ProductSchema = z.object({
    id: z.number().int().positive(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.number().min(0, "Price cannot be negative"),
    image: z.string().default("/product/chocolate-cake.jpeg"),
    category: z.string().min(1, "Category is required"),
    size: z.string().min(1, "Size is required"),
});

export const CreateProductSchema = ProductSchema.omit({ id: true });

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;

export const seedProducts: Product[] = [
    {
        id: 1,
        slug: "chocolate-cake",
        name: "Chocolate Cake",
        description: "Kue coklat lembut dengan rasa manis pekat dan tekstur yang moist, cocok untuk pecinta coklat sejati.",
        price: 285000,
        image: "/product/chocolate-cake.jpeg",
        category: "Birthday",
        size: "20 cm",
    },
    {
        id: 2,
        slug: "strawberry-shortcake",
        name: "Strawberry Shortcake",
        description: "Kue ringan dengan lapisan krim lembut dan potongan stroberi segar yang memberikan rasa manis dan sedikit asam.",
        price: 320000,
        image: "/product/strawberry-shortcake.jpeg",
        category: "Birthday",
        size: "20 cm",
    },
    {
        id: 3,
        slug: "red-velvet",
        name: "Red Velvet",
        description: "Kue lembut berwarna merah khas dengan rasa coklat ringan yang dipadukan dengan krim keju yang lezat.",
        price: 310000,
        image: "/product/red-velvet.jpeg",
        category: "Anniversary",
        size: "20 cm",
    },
    {
        id: 4,
        slug: "tiramisu",
        name: "Tiramisu",
        description: "Kue klasik Italia dengan lapisan kopi dan krim mascarpone yang lembut serta aroma kopi yang khas.",
        price: 375000,
        image: "/product/tiramisu.jpeg",
        category: "Special",
        size: "22 cm",
    },
    {
        id: 5,
        slug: "black-forest",
        name: "Black Forest",
        description: "Kue coklat dengan lapisan krim dan ceri yang segar, memberikan kombinasi rasa manis dan sedikit asam.",
        price: 295000,
        image: "/product/black-forest.jpeg",
        category: "Birthday",
        size: "20 cm",
    },
    {
        id: 6,
        slug: "matcha-cake",
        name: "Matcha Cake",
        description: "Kue lembut dengan rasa matcha khas Jepang yang sedikit pahit namun seimbang dengan manisnya krim.",
        price: 330000,
        image: "/product/matcha-cake.jpeg",
        category: "Special",
        size: "20 cm",
    },
    {
        id: 7,
        slug: "vanilla-sponge",
        name: "Vanilla Sponge",
        description: "Kue vanilla yang ringan dan empuk dengan aroma harum yang cocok dinikmati kapan saja.",
        price: 265000,
        image: "/product/vanilla-sponge.jpeg",
        category: "Birthday",
        size: "20 cm",
    },
    {
        id: 8,
        slug: "carrot-cake",
        name: "Carrot Cake",
        description: "Kue wortel dengan rasa manis alami dan sentuhan rempah yang hangat serta tekstur yang moist.",
        price: 280000,
        image: "/product/carrot-cake.jpeg",
        category: "Special",
        size: "20 cm",
    },
    {
        id: 9,
        slug: "lemon-cake",
        name: "Lemon Cake",
        description: "Kue dengan rasa lemon yang segar, memberikan perpaduan rasa manis dan asam yang menyegarkan.",
        price: 275000,
        image: "/product/lemon-cake.jpeg",
        category: "Anniversary",
        size: "20 cm",
    },
    {
        id: 10,
        slug: "opera-cake",
        name: "Opera Cake",
        description: "Kue elegan dengan lapisan kopi, coklat, dan krim yang kaya rasa serta tampilan yang mewah.",
        price: 420000,
        image: "/product/opera-cake.jpeg",
        category: "Wedding",
        size: "24 cm",
    },
    {
        id: 11,
        slug: "chiffon-cake",
        name: "Chiffon Cake",
        description: "Kue super ringan dan fluffy dengan tekstur lembut seperti kapas, cocok untuk semua kalangan.",
        price: 255000,
        image: "/product/chiffon-cake.jpeg",
        category: "Birthday",
        size: "22 cm",
    },
];

/** In-memory store swap ini ke Supabase query nanti */
export const productStore: Product[] = [...seedProducts];
// Masih raw ygy
