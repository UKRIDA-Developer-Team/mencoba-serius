import { db } from "@/lib/db";
import { productCategories, products, admins } from "@/lib/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

const categories = [
  { name: "Birthday", description: "Kue untuk perayaan ulang tahun" },
  { name: "Anniversary", description: "Kue untuk perayaan anniversary" },
  { name: "Special", description: "Kue spesial dan pilihan" },
  { name: "Wedding", description: "Kue untuk pernikahan" },
];

const seedProductsData = [
  {
    slug: "chocolate-cake",
    name: "Chocolate Cake",
    description: "Kue coklat lembut dengan rasa manis pekat dan tekstur yang moist, cocok untuk pecinta coklat sejati.",
    price: "285000",
    image: "/product/chocolate-cake.webp",
    category: "Birthday",
    size: "20 cm",
  },
  {
    slug: "strawberry-shortcake",
    name: "Strawberry Shortcake",
    description: "Kue ringan dengan lapisan krim lembut dan potongan stroberi segar yang memberikan rasa manis dan sedikit asam.",
    price: "320000",
    image: "/product/strawberry-shortcake.webp",
    category: "Birthday",
    size: "20 cm",
  },
  {
    slug: "red-velvet",
    name: "Red Velvet",
    description: "Kue lembut berwarna merah khas dengan rasa coklat ringan yang dipadukan dengan krim keju yang lezat.",
    price: "310000",
    image: "/product/red-velvet.webp",
    category: "Anniversary",
    size: "20 cm",
  },
  {
    slug: "tiramisu",
    name: "Tiramisu",
    description: "Kue klasik Italia dengan lapisan kopi dan krim mascarpone yang lembut serta aroma kopi yang khas.",
    price: "375000",
    image: "/product/tiramisu.webp",
    category: "Special",
    size: "22 cm",
  },
  {
    slug: "black-forest",
    name: "Black Forest",
    description: "Kue coklat dengan lapisan krim dan ceri yang segar, memberikan kombinasi rasa manis dan sedikit asam.",
    price: "295000",
    image: "/product/black-forest.webp",
    category: "Birthday",
    size: "20 cm",
  },
  {
    slug: "matcha-cake",
    name: "Matcha Cake",
    description: "Kue lembut dengan rasa matcha khas Jepang yang sedikit pahit namun seimbang dengan manisnya krim.",
    price: "330000",
    image: "/product/matcha-cake.webp",
    category: "Special",
    size: "20 cm",
  },
  {
    slug: "vanilla-sponge",
    name: "Vanilla Sponge",
    description: "Kue vanilla yang ringan dan empuk dengan aroma harum yang cocok dinikmati kapan saja.",
    price: "265000",
    image: "/product/vanilla-sponge.webp",
    category: "Birthday",
    size: "20 cm",
  },
  {
    slug: "carrot-cake",
    name: "Carrot Cake",
    description: "Kue wortel dengan rasa manis alami dan sentuhan rempah yang hangat serta tekstur yang moist.",
    price: "280000",
    image: "/product/carrot-cake.webp",
    category: "Special",
    size: "20 cm",
  },
  {
    slug: "lemon-cake",
    name: "Lemon Cake",
    description: "Kue dengan rasa lemon yang segar, memberikan perpaduan rasa manis dan asam yang menyegarkan.",
    price: "275000",
    image: "/product/lemon-cake.webp",
    category: "Anniversary",
    size: "20 cm",
  },
  {
    slug: "opera-cake",
    name: "Opera Cake",
    description: "Kue elegan dengan lapisan kopi, coklat, dan krim yang kaya rasa serta tampilan yang mewah.",
    price: "420000",
    image: "/product/opera-cake.webp",
    category: "Wedding",
    size: "24 cm",
  },
  {
    slug: "chiffon-cake",
    name: "Chiffon Cake",
    description: "Kue super ringan dan fluffy dengan tekstur lembut seperti kapas, cocok untuk semua kalangan.",
    price: "255000",
    image: "/product/chiffon-cake.webp",
    category: "Birthday",
    size: "22 cm",
  },
];

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // 1. Seed categories
    console.log("📦 Seeding categories...");
    const categoryMap: Record<string, bigint> = {};

    for (const category of categories) {
      const existing = await db
        .select()
        .from(productCategories)
        .where(eq(productCategories.name, category.name))
        .limit(1);

      if (existing.length > 0) {
        categoryMap[category.name] = existing[0].id;
        console.log(`  ✓ Category "${category.name}" already exists`);
      } else {
        const inserted = await db
          .insert(productCategories)
          .values({
            name: category.name,
            description: category.description,
          })
          .returning({ id: productCategories.id });

        categoryMap[category.name] = inserted[0].id;
        console.log(`  ✓ Created category "${category.name}"`);
      }
    }

    // 2. Seed products
    console.log("🍰 Seeding products...");
    for (const product of seedProductsData) {
      const categoryId = categoryMap[product.category];
      if (!categoryId) {
        console.error(`  ✗ Category "${product.category}" not found`);
        continue;
      }

      const existing = await db
        .select()
        .from(products)
        .where(eq(products.slug, product.slug))
        .limit(1);

      if (existing.length > 0) {
        console.log(`  ✓ Product "${product.name}" already exists`);
      } else {
        await db.insert(products).values({
          slug: product.slug,
          name: product.name,
          description: product.description,
          categoryId,
          basePrice: product.price,
          sizeLabel: product.size,
          imagePath: product.image,
          isActive: true,
          isCustomizable: false,
          isPreorderOnly: false,
          defaultLeadTimeDays: 0,
        });

        console.log(`  ✓ Created product "${product.name}"`);
      }
    }

    // 3. Seed admin user
    console.log("👨‍💼 Seeding admin user...");
    const existing = await db
      .select()
      .from(admins)
      .where(eq(admins.username, "admin"))
      .limit(1);

    if (existing.length > 0) {
      console.log("  ✓ Admin user already exists");
    } else {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(admins).values({
        username: "admin",
        email: "admin@chefon pointe.local",
        password: hashedPassword,
        fullName: "Chef On Pointe Admin",
        isActive: true,
      });
      console.log("  ✓ Created admin user (username: admin, password: admin123)");
    }

    console.log("✅ Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
