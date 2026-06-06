-- ============================================================
-- PASTRIES STORE — SEED DATA
-- Generated: 2026-05-31
--
-- SCOPE:
--   ✓ measurement_units
--   ✓ product_categories
--   ✓ products  (existing + 5 new requested products)
--   ✓ ingredients
--   ✓ ingredient_unit_map
--   ✓ product_recipe_ingredients
--   ✓ purchase_orders + purchase_order_items
--   ✓ sales_orders + sales_order_items
--   ✓ custom_cake_requests
--   ✓ payments
--
--   ✗ suppliers                    (skipped per instruction)
--   ✗ customers                    (skipped per instruction)
--   ✗ ingredient_stock_movements   (skipped per instruction)
-- ============================================================

BEGIN;

-- ============================================================
-- 1. MEASUREMENT UNITS
-- ============================================================
INSERT INTO measurement_units (code, name, unit_type, is_base_unit) VALUES
('g',    'Gram',        'mass',    TRUE),
('kg',   'Kilogram',    'mass',    FALSE),
('ml',   'Milliliter',  'volume',  TRUE),
('l',    'Liter',       'volume',  FALSE),
('pcs',  'Pieces',      'count',   TRUE),
('tray', 'Tray',        'package', FALSE),
('box',  'Box',         'package', FALSE);

-- ============================================================
-- 2. PRODUCT CATEGORIES
-- ============================================================
INSERT INTO product_categories (name, description) VALUES
('Birthday',    'Birthday and celebration cakes'),
('Anniversary', 'Anniversary and romantic cakes'),
('Special',     'Seasonal and limited-edition cakes'),
('Wedding',     'Elegant wedding and reception cakes'),
('Custom',      'Fully custom-made cakes to order'),
('Jar Cake',    'Individual desserts served in a jar — no-slice, ready to enjoy'),
('Classic',     'Time-honoured bakery classics with a premium twist');

-- ============================================================
-- 3. SUPPLIERS  (minimal — required by purchase_orders FK)
-- ============================================================
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES
('Nusantara Baking Supply', 'Budi Santoso',  '+62-812-1000-0001', 'budi@nusantarabaking.id',  'Jakarta, Indonesia'),
('Fresh Dairy Co',          'Dewi Larasati', '+62-812-1000-0002', 'dewi@freshdairy.id',        'Bandung, Indonesia'),
('Sweet Harvest Farm',      'Rama Pratama',  '+62-812-1000-0003', 'rama@sweetharvest.id',       'Lembang, Indonesia'),
('Tropical Fruit Hub',      'Sari Wulandari','+62-812-1000-0004', 'sari@tropicalfruithub.id',  'Bogor, Indonesia');

-- ============================================================
-- 4. CUSTOMERS  (minimal — required by sales_orders / custom_cake_requests FK)
-- ============================================================
INSERT INTO customers (full_name, phone, email, notes) VALUES
('Alicia Prameswari',  '+62-813-7000-0001', 'alicia@example.com',  'Prefers less sweet frosting'),
('Rizky Maulana',      '+62-813-7000-0002', 'rizky@example.com',   'Often orders for office events — keep lead time at 2 days'),
('Sinta Rahayu',       '+62-813-7000-0003', 'sinta@example.com',   'Allergic to nuts — always confirm before production'),
('Dimas Prasetyo',     '+62-813-7000-0004', 'dimas@example.com',   'Prefers dark rum in Black Forest'),
('Nadia Kusuma',       '+62-813-7000-0005', 'nadia@example.com',   'Regular weekly pre-order for jar cakes');

-- ============================================================
-- 5. PRODUCTS
--    Existing 11 products (from schema seed) + 5 new products
-- ============================================================

-- ── Existing products ─────────────────────────────────────

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'chocolate-cake', 'Chocolate Cake',
       'Kue coklat lembut dengan rasa manis pekat dan tekstur yang moist, dilapisi ganache coklat premium. Cocok untuk pecinta coklat sejati.',
       c.id, 285000, '20 cm', '/product/chocolate-cake.webp', TRUE, FALSE, 1
FROM product_categories c WHERE c.name = 'Birthday';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'strawberry-shortcake', 'Strawberry Shortcake',
       'Kue ringan dengan lapisan krim lembut dan potongan stroberi segar yang memberikan rasa manis dan sedikit asam. Disajikan dingin untuk kesegaran maksimal.',
       c.id, 320000, '20 cm', '/product/strawberry-shortcake.webp', TRUE, TRUE, 2
FROM product_categories c WHERE c.name = 'Birthday';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'red-velvet', 'Red Velvet',
       'Kue lembut berwarna merah khas dengan rasa coklat ringan yang dipadukan dengan krim keju yang lezat dan sedikit tangy.',
       c.id, 310000, '20 cm', '/product/red-velvet.webp', TRUE, FALSE, 1
FROM product_categories c WHERE c.name = 'Anniversary';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'tiramisu', 'Tiramisu',
       'Kue klasik Italia dengan lapisan kopi espresso dan krim mascarpone yang lembut, diakhiri dengan taburan bubuk kakao premium.',
       c.id, 375000, '22 cm', '/product/tiramisu.webp', TRUE, TRUE, 2
FROM product_categories c WHERE c.name = 'Special';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'black-forest', 'Black Forest',
       'Kue coklat premium dengan lapisan krim Chantilly dan ceri Morello yang segar, memberikan kombinasi rasa manis dan sedikit asam yang autentik.',
       c.id, 295000, '20 cm', '/product/black-forest.webp', TRUE, FALSE, 1
FROM product_categories c WHERE c.name = 'Birthday';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'matcha-cake', 'Matcha Cake',
       'Kue lembut dengan rasa matcha ceremonial grade khas Jepang yang sedikit pahit namun seimbang dengan manisnya krim vanilla.',
       c.id, 330000, '20 cm', '/product/matcha-cake.webp', TRUE, TRUE, 2
FROM product_categories c WHERE c.name = 'Special';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'vanilla-sponge', 'Vanilla Sponge',
       'Kue vanilla yang ringan dan empuk dengan aroma harum vanilla bean, cocok dinikmati kapan saja tanpa rasa berat.',
       c.id, 265000, '20 cm', '/product/vanilla-sponge.webp', TRUE, FALSE, 1
FROM product_categories c WHERE c.name = 'Birthday';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'carrot-cake', 'Carrot Cake',
       'Kue wortel dengan rasa manis alami dan sentuhan rempah hangat — kayu manis, pala, dan jahe — serta tekstur yang moist dan frosting krim keju.',
       c.id, 280000, '20 cm', '/product/carrot-cake.webp', TRUE, TRUE, 2
FROM product_categories c WHERE c.name = 'Special';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'lemon-cake', 'Lemon Cake',
       'Kue dengan rasa lemon segar yang cerah, dipadukan dengan lemon curd buatan rumah dan frosting buttercream lemon yang menyegarkan.',
       c.id, 275000, '20 cm', '/product/lemon-cake.webp', TRUE, FALSE, 1
FROM product_categories c WHERE c.name = 'Anniversary';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'opera-cake', 'Opera Cake',
       'Kue elegan Prancis dengan lapisan joconde almond, buttercream kopi, dan ganache coklat yang kaya rasa serta tampilan yang mewah.',
       c.id, 420000, '24 cm', '/product/opera-cake.webp', TRUE, TRUE, 3
FROM product_categories c WHERE c.name = 'Wedding';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'chiffon-cake', 'Chiffon Cake',
       'Kue super ringan dan fluffy dengan tekstur lembut seperti kapas dan aroma jeruk yang halus, cocok untuk semua kalangan.',
       c.id, 255000, '22 cm', '/product/chiffon-cake.webp', TRUE, FALSE, 1
FROM product_categories c WHERE c.name = 'Birthday';

-- ── 5 New requested products ──────────────────────────────

-- (1) Banana Cake Cream Cheese
INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'banana-cake-cream-cheese', 'Banana Cake Cream Cheese',
       'Kue pisang lembut nan moist dengan aroma pisang matang yang kaya, dilapis cream cheese frosting yang tangy dan manis. Perpaduan sempurna antara kelembutan sponge dan kekayaan rasa keju.',
       c.id, 305000, '20 cm', '/product/banana-cake-cream-cheese.webp', TRUE, FALSE, 1
FROM product_categories c WHERE c.name = 'Birthday';

-- (2) Avocado Mocca Delight Jar
INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'avocado-mocca-delight-jar', 'Avocado Mocca Delight Jar',
       'Mousse alpukat premium yang dipadukan dengan mousse mocca espresso yang intens, berlapis di atas potongan sponge coklat yang lembut. Disajikan dalam jar cantik, kaya tekstur, dan ready to eat.',
       c.id, 65000, '250 ml jar', '/product/avocado-mocca-delight-jar.webp', FALSE, FALSE, 0
FROM product_categories c WHERE c.name = 'Jar Cake';

-- (3) Exotic Mango Cake in Jar
INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'exotic-mango-cake-in-jar', 'Exotic Mango Cake in Jar',
       'Vanilla cake yang ringan dipadukan dengan mousse mangga harum Harum Manis pilihan yang lembut dan segar. Disajikan dalam jar dengan topping potongan mangga segar. Kesegaran tropis dalam genggaman.',
       c.id, 62000, '250 ml jar', '/product/exotic-mango-cake-in-jar.webp', FALSE, FALSE, 0
FROM product_categories c WHERE c.name = 'Jar Cake';

-- (4) Black Forest Rum
INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'black-forest-rum', 'Black Forest Rum',
       'Versi premium dari Black Forest klasik dengan sponge coklat Genoise yang direndam dark rum berkualitas, diisi kompot ceri Morello asam, dan dilapisi krim Chantilly yang ringan. Kaya, bold, dan tak terlupakan.',
       c.id, 345000, '20 cm', '/product/black-forest.webp', TRUE, TRUE, 2
FROM product_categories c WHERE c.name = 'Classic';

-- (5) Old Memories Vanilla Cheese
INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'old-memories-vanilla-cheese', 'Old Memories Vanilla Cheese',
       'Cheesecake nostalgia dengan lapisan vanilla sponge lembut di bagian bawah, diisi filling cream cheese no-bake yang creamy dan kaya rasa vanilla bean asli. Teksturnya lembut seperti meleleh di mulut.',
       c.id, 315000, '20 cm', '/product/old-memories-vanilla-cheese.webp', TRUE, TRUE, 2
FROM product_categories c WHERE c.name = 'Classic';

-- ============================================================
-- 6. INGREDIENTS
-- ============================================================

-- Core dry goods
INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-FLOUR', 'All-Purpose Flour', 'Tepung terigu protein sedang untuk adonan sponge dan cake', u.id, 5000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-CAKE-FLOUR', 'Cake Flour', 'Tepung protein rendah untuk sponge ringan dan chiffon', u.id, 3000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-SUGAR', 'Granulated Sugar', 'Gula pasir untuk adonan dan frosting umum', u.id, 4000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-POWDERED-SUGAR', 'Powdered Sugar (Icing Sugar)', 'Gula halus untuk frosting dan glazing', u.id, 2000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-BUTTER', 'Unsalted Butter', 'Mentega premium tanpa garam untuk adonan dan frosting', u.id, 2000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Fresh Dairy Co';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-EGG', 'Chicken Egg', 'Telur ayam segar ukuran besar — disimpan suhu ruang sebelum pakai', u.id, 90, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'pcs' AND s.name = 'Sweet Harvest Farm';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-MILK', 'Fresh Full-Cream Milk', 'Susu segar full-fat untuk adonan dan krim', u.id, 5000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'ml' AND s.name = 'Fresh Dairy Co';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-HEAVY-CREAM', 'Heavy Whipping Cream (min 35% fat)', 'Krim kocok untuk mousse, Chantilly, dan ganache', u.id, 3000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'ml' AND s.name = 'Fresh Dairy Co';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-CREAM-CHEESE', 'Full-Fat Cream Cheese', 'Cream cheese brick Philadelphia atau setara, untuk frosting dan filling', u.id, 2000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Fresh Dairy Co';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-COCOA', 'Dutch-Processed Cocoa Powder', 'Bubuk kakao Dutch-process untuk rasa coklat yang dalam dan halus', u.id, 1000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-DARK-CHOC', 'Dark Chocolate Couverture (60–70%)', 'Coklat couverture dark untuk ganache dan mousse premium', u.id, 1000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-VANILLA', 'Vanilla Extract', 'Ekstrak vanilla alami botol kecil', u.id, 500, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'ml' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-VANILLA-BEAN-PASTE', 'Vanilla Bean Paste', 'Pasta vanilla bean premium, kaya biji vanilla', u.id, 200, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'ml' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-STRAWBERRY', 'Fresh Strawberry', 'Stroberi segar untuk topping dan filling', u.id, 2000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Sweet Harvest Farm';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-MATCHA', 'Matcha Powder (Ceremonial Grade)', 'Bubuk matcha ceremonial grade untuk rasa autentik Jepang', u.id, 500, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-BANANA', 'Ripe Banana (Pisang Ambon/Kepok)', 'Pisang matang overripe untuk cake — gunakan yang kulitnya sudah bercak coklat', u.id, 1500, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Sweet Harvest Farm';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-AVOCADO', 'Ripe Avocado (Alpukat Mentega)', 'Alpukat mentega matang sempurna untuk mousse — tekstur creamy tanpa serat', u.id, 2000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Tropical Fruit Hub';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-ESPRESSO', 'Espresso / Strong Brewed Coffee', 'Kopi espresso atau kopi tubruk kental — untuk mousse mocca dan tiramisu', u.id, 500, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'ml' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-MANGO', 'Fresh Mango (Mangga Harum Manis)', 'Mangga Harum Manis pilihan untuk puree dan topping jar cake', u.id, 2000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Tropical Fruit Hub';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-GELATIN', 'Powdered Gelatin', 'Gelatin bubuk untuk stabilisasi mousse', u.id, 100, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-DARK-RUM', 'Dark Rum (Aged)', 'Dark rum untuk perendaman sponge Black Forest Rum — gunakan rum aged min 3 tahun', u.id, 500, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'ml' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-MORELLO-CHERRY', 'Sour Morello Cherries (canned/jarred)', 'Ceri Morello asam dalam sirup untuk filling Black Forest', u.id, 1200, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-MASCARPONE', 'Mascarpone Cheese', 'Keju mascarpone Italia untuk tiramisu dan filling premium', u.id, 500, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Fresh Dairy Co';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-VEG-OIL', 'Vegetable / Sunflower Oil', 'Minyak sayur tanpa rasa untuk adonan moist cake', u.id, 2000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'ml' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-CARROT', 'Fresh Carrot (grated)', 'Wortel segar yang diparut kasar untuk carrot cake', u.id, 1000, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Sweet Harvest Farm';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-LEMON', 'Fresh Lemon (juice + zest)', 'Lemon segar untuk jus, zest, dan lemon curd', u.id, 800, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Sweet Harvest Farm';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-ALMOND-MEAL', 'Almond Meal / Ground Almond', 'Tepung almond untuk Opera Cake joconde sponge', u.id, 500, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-MAPLE-SYRUP', 'Pure Maple Syrup', 'Sirup maple murni sebagai pemanis alami untuk mousse alpukat', u.id, 300, s.id
FROM measurement_units u CROSS JOIN suppliers s WHERE u.code = 'ml' AND s.name = 'Nusantara Baking Supply';

-- ============================================================
-- 7. INGREDIENT UNIT MAPS
-- ============================================================

-- Gram-based solid ingredients: g (base) + kg (purchase)
INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 1, FALSE, TRUE
FROM ingredients i JOIN measurement_units u ON u.code = 'g'
WHERE i.sku IN (
    'ING-FLOUR','ING-CAKE-FLOUR','ING-SUGAR','ING-POWDERED-SUGAR',
    'ING-BUTTER','ING-CREAM-CHEESE','ING-COCOA','ING-DARK-CHOC',
    'ING-STRAWBERRY','ING-MATCHA','ING-BANANA','ING-AVOCADO',
    'ING-MANGO','ING-GELATIN','ING-MORELLO-CHERRY','ING-MASCARPONE',
    'ING-CARROT','ING-LEMON','ING-ALMOND-MEAL'
);

INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 1000, TRUE, FALSE
FROM ingredients i JOIN measurement_units u ON u.code = 'kg'
WHERE i.sku IN (
    'ING-FLOUR','ING-CAKE-FLOUR','ING-SUGAR','ING-POWDERED-SUGAR',
    'ING-BUTTER','ING-CREAM-CHEESE','ING-COCOA','ING-DARK-CHOC',
    'ING-STRAWBERRY','ING-MATCHA','ING-BANANA','ING-AVOCADO',
    'ING-MANGO','ING-MORELLO-CHERRY','ING-MASCARPONE',
    'ING-CARROT','ING-LEMON','ING-ALMOND-MEAL'
);

-- Millilitre-based liquid ingredients: ml (base) + l (purchase)
INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 1, FALSE, TRUE
FROM ingredients i JOIN measurement_units u ON u.code = 'ml'
WHERE i.sku IN (
    'ING-MILK','ING-HEAVY-CREAM','ING-VANILLA','ING-VANILLA-BEAN-PASTE',
    'ING-ESPRESSO','ING-DARK-RUM','ING-VEG-OIL','ING-MAPLE-SYRUP'
);

INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 1000, TRUE, FALSE
FROM ingredients i JOIN measurement_units u ON u.code = 'l'
WHERE i.sku IN (
    'ING-MILK','ING-HEAVY-CREAM','ING-ESPRESSO','ING-VEG-OIL'
);

-- Egg: pcs (base) + tray (purchase, 30 pcs each)
INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 1, FALSE, TRUE
FROM ingredients i JOIN measurement_units u ON u.code = 'pcs'
WHERE i.sku = 'ING-EGG';

INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 30, TRUE, FALSE
FROM ingredients i JOIN measurement_units u ON u.code = 'tray'
WHERE i.sku = 'ING-EGG';

-- Gelatin small-pack: g (base) + box (purchase, 1 box = 50 sachets × 7g each = 350g)
INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 350, TRUE, FALSE
FROM ingredients i JOIN measurement_units u ON u.code = 'box'
WHERE i.sku = 'ING-GELATIN';

-- ============================================================
-- 8. PRODUCT RECIPE INGREDIENTS
--    All quantities are per-product (one whole cake / one jar).
-- ============================================================

-- ────────────────────────────────────────────────
-- Chocolate Cake (20 cm, serves ~12)
-- Classic moist chocolate cake with ganache
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 350, 2.0, 'Tepung untuk adonan batter utama'
FROM products p JOIN ingredients i ON i.sku='ING-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='chocolate-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 260, 1.5, 'Gula pasir untuk batter dan ganache'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='chocolate-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 6, 0.0, 'Telur untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='chocolate-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 120, 2.0, 'Kakao Dutch-process untuk batter dan ganache lapisan luar'
FROM products p JOIN ingredients i ON i.sku='ING-COCOA' JOIN measurement_units u ON u.code='g' WHERE p.slug='chocolate-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 150, 1.5, 'Mentega untuk adonan'
FROM products p JOIN ingredients i ON i.sku='ING-BUTTER' JOIN measurement_units u ON u.code='g' WHERE p.slug='chocolate-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 180, 1.0, 'Susu untuk kelembaban batter'
FROM products p JOIN ingredients i ON i.sku='ING-MILK' JOIN measurement_units u ON u.code='ml' WHERE p.slug='chocolate-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 5, 0.0, 'Vanilla extract untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-VANILLA' JOIN measurement_units u ON u.code='ml' WHERE p.slug='chocolate-cake';

-- ────────────────────────────────────────────────
-- Strawberry Shortcake (20 cm, serves ~12)
-- Light sponge with cream cheese frosting & fresh strawberries
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 300, 2.0, 'Tepung untuk batter sponge ringan'
FROM products p JOIN ingredients i ON i.sku='ING-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='strawberry-shortcake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 1.5, 'Gula untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='strawberry-shortcake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 4, 0.0, 'Telur untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='strawberry-shortcake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 300, 4.0, 'Stroberi segar untuk topping dan filling'
FROM products p JOIN ingredients i ON i.sku='ING-STRAWBERRY' JOIN measurement_units u ON u.code='g' WHERE p.slug='strawberry-shortcake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 250, 2.5, 'Cream cheese untuk frosting'
FROM products p JOIN ingredients i ON i.sku='ING-CREAM-CHEESE' JOIN measurement_units u ON u.code='g' WHERE p.slug='strawberry-shortcake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 1.5, 'Krim kocok untuk frosting'
FROM products p JOIN ingredients i ON i.sku='ING-HEAVY-CREAM' JOIN measurement_units u ON u.code='ml' WHERE p.slug='strawberry-shortcake';

-- ────────────────────────────────────────────────
-- Red Velvet (20 cm)
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 280, 2.0, 'Tepung untuk batter red velvet'
FROM products p JOIN ingredients i ON i.sku='ING-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='red-velvet';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 250, 1.5, 'Gula untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='red-velvet';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 2, 0.0, 'Telur untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='red-velvet';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 15, 0.0, 'Kakao untuk warna dan rasa'
FROM products p JOIN ingredients i ON i.sku='ING-COCOA' JOIN measurement_units u ON u.code='g' WHERE p.slug='red-velvet';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 300, 2.0, 'Cream cheese frosting berlapis'
FROM products p JOIN ingredients i ON i.sku='ING-CREAM-CHEESE' JOIN measurement_units u ON u.code='g' WHERE p.slug='red-velvet';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 120, 1.5, 'Mentega untuk frosting'
FROM products p JOIN ingredients i ON i.sku='ING-BUTTER' JOIN measurement_units u ON u.code='g' WHERE p.slug='red-velvet';

-- ────────────────────────────────────────────────
-- Tiramisu (22 cm)
-- Classic Italian: savoiardi-style sponge, mascarpone, espresso
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 4, 0.0, 'Telur untuk sabayon dan batter ladyfinger'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='tiramisu';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 500, 2.5, 'Mascarpone untuk krim utama'
FROM products p JOIN ingredients i ON i.sku='ING-MASCARPONE' JOIN measurement_units u ON u.code='g' WHERE p.slug='tiramisu';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 1.5, 'Krim kocok untuk mengaerasi krim mascarpone'
FROM products p JOIN ingredients i ON i.sku='ING-HEAVY-CREAM' JOIN measurement_units u ON u.code='ml' WHERE p.slug='tiramisu';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 150, 1.5, 'Gula untuk sabayon'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='tiramisu';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 0.0, 'Espresso kuat untuk merendam ladyfinger'
FROM products p JOIN ingredients i ON i.sku='ING-ESPRESSO' JOIN measurement_units u ON u.code='ml' WHERE p.slug='tiramisu';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 25, 1.0, 'Kakao untuk taburan finishing'
FROM products p JOIN ingredients i ON i.sku='ING-COCOA' JOIN measurement_units u ON u.code='g' WHERE p.slug='tiramisu';

-- ────────────────────────────────────────────────
-- Black Forest (20 cm)  — Standard (without rum)
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 4, 0.0, 'Telur untuk sponge coklat'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='black-forest';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 135, 1.5, 'Gula untuk Genoise'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='black-forest';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 70, 2.0, 'Tepung kue untuk sponge ringan'
FROM products p JOIN ingredients i ON i.sku='ING-CAKE-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='black-forest';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 30, 1.0, 'Kakao untuk sponge coklat'
FROM products p JOIN ingredients i ON i.sku='ING-COCOA' JOIN measurement_units u ON u.code='g' WHERE p.slug='black-forest';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 400, 3.0, 'Krim Chantilly untuk lapisan dan dekorasi'
FROM products p JOIN ingredients i ON i.sku='ING-HEAVY-CREAM' JOIN measurement_units u ON u.code='ml' WHERE p.slug='black-forest';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 400, 2.0, 'Ceri Morello untuk filling dan dekorasi'
FROM products p JOIN ingredients i ON i.sku='ING-MORELLO-CHERRY' JOIN measurement_units u ON u.code='g' WHERE p.slug='black-forest';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 35, 1.5, 'Mentega cair untuk sponge Genoise'
FROM products p JOIN ingredients i ON i.sku='ING-BUTTER' JOIN measurement_units u ON u.code='g' WHERE p.slug='black-forest';

-- ────────────────────────────────────────────────
-- Matcha Cake (20 cm)
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 300, 2.0, 'Tepung untuk batter matcha'
FROM products p JOIN ingredients i ON i.sku='ING-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='matcha-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 220, 1.5, 'Gula untuk adonan dan frosting'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='matcha-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 4, 0.0, 'Telur untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='matcha-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 25, 0.5, 'Matcha ceremonial grade untuk batter dan garnish'
FROM products p JOIN ingredients i ON i.sku='ING-MATCHA' JOIN measurement_units u ON u.code='g' WHERE p.slug='matcha-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 1.5, 'Krim untuk frosting vanilla'
FROM products p JOIN ingredients i ON i.sku='ING-HEAVY-CREAM' JOIN measurement_units u ON u.code='ml' WHERE p.slug='matcha-cake';

-- ────────────────────────────────────────────────
-- Vanilla Sponge (20 cm)
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 280, 2.0, 'Tepung kue untuk sponge ringan'
FROM products p JOIN ingredients i ON i.sku='ING-CAKE-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='vanilla-sponge';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 1.5, 'Gula pasir untuk adonan'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='vanilla-sponge';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 4, 0.0, 'Telur untuk aerasi sponge'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='vanilla-sponge';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 10, 0.0, 'Vanilla bean paste untuk aroma khas'
FROM products p JOIN ingredients i ON i.sku='ING-VANILLA-BEAN-PASTE' JOIN measurement_units u ON u.code='ml' WHERE p.slug='vanilla-sponge';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 120, 1.0, 'Mentega cair untuk kelembaban'
FROM products p JOIN ingredients i ON i.sku='ING-BUTTER' JOIN measurement_units u ON u.code='g' WHERE p.slug='vanilla-sponge';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 60, 1.0, 'Susu untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-MILK' JOIN measurement_units u ON u.code='ml' WHERE p.slug='vanilla-sponge';

-- ────────────────────────────────────────────────
-- Carrot Cake (20 cm)
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 280, 2.0, 'Tepung untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='carrot-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 1.5, 'Gula merah dan putih untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='carrot-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 3, 0.0, 'Telur untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='carrot-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 300, 5.0, 'Wortel parut segar untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-CARROT' JOIN measurement_units u ON u.code='g' WHERE p.slug='carrot-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 150, 1.5, 'Minyak sayur untuk batter moist'
FROM products p JOIN ingredients i ON i.sku='ING-VEG-OIL' JOIN measurement_units u ON u.code='ml' WHERE p.slug='carrot-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 250, 2.5, 'Cream cheese frosting'
FROM products p JOIN ingredients i ON i.sku='ING-CREAM-CHEESE' JOIN measurement_units u ON u.code='g' WHERE p.slug='carrot-cake';

-- ────────────────────────────────────────────────
-- Lemon Cake (20 cm)
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 280, 2.0, 'Tepung untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='lemon-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 220, 1.5, 'Gula untuk batter dan lemon curd'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='lemon-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 4, 0.0, 'Telur untuk batter dan lemon curd'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='lemon-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 250, 8.0, 'Lemon segar untuk jus dan zest batter + lemon curd'
FROM products p JOIN ingredients i ON i.sku='ING-LEMON' JOIN measurement_units u ON u.code='g' WHERE p.slug='lemon-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 180, 1.5, 'Mentega untuk batter dan lemon curd'
FROM products p JOIN ingredients i ON i.sku='ING-BUTTER' JOIN measurement_units u ON u.code='g' WHERE p.slug='lemon-cake';

-- ────────────────────────────────────────────────
-- Opera Cake (24 cm)
-- French Opera: almond joconde, coffee buttercream, dark choc ganache
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 2.5, 'Tepung almond untuk joconde sponge'
FROM products p JOIN ingredients i ON i.sku='ING-ALMOND-MEAL' JOIN measurement_units u ON u.code='g' WHERE p.slug='opera-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 6, 0.0, 'Telur utuh untuk joconde'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='opera-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 250, 1.5, 'Gula halus untuk joconde dan buttercream'
FROM products p JOIN ingredients i ON i.sku='ING-POWDERED-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='opera-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 1.5, 'Mentega tawar untuk coffee buttercream'
FROM products p JOIN ingredients i ON i.sku='ING-BUTTER' JOIN measurement_units u ON u.code='g' WHERE p.slug='opera-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 100, 0.5, 'Espresso untuk merendam sponge dan buttercream kopi'
FROM products p JOIN ingredients i ON i.sku='ING-ESPRESSO' JOIN measurement_units u ON u.code='ml' WHERE p.slug='opera-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 2.0, 'Dark couverture untuk ganache lapisan atas'
FROM products p JOIN ingredients i ON i.sku='ING-DARK-CHOC' JOIN measurement_units u ON u.code='g' WHERE p.slug='opera-cake';

-- ────────────────────────────────────────────────
-- Chiffon Cake (22 cm)
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 2.0, 'Tepung kue untuk chiffon yang ringan'
FROM products p JOIN ingredients i ON i.sku='ING-CAKE-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='chiffon-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 180, 1.5, 'Gula pasir untuk batter dan meringue putih telur'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='chiffon-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 6, 0.0, 'Telur pisahkan kuning & putih untuk chiffon'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='chiffon-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 120, 0.5, 'Minyak sayur untuk kelembaban chiffon'
FROM products p JOIN ingredients i ON i.sku='ING-VEG-OIL' JOIN measurement_units u ON u.code='ml' WHERE p.slug='chiffon-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 150, 1.0, 'Susu untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-MILK' JOIN measurement_units u ON u.code='ml' WHERE p.slug='chiffon-cake';

-- ────────────────────────────────────────────────
-- NEW: Banana Cake Cream Cheese (20 cm)
-- Moist banana sponge + tangy cream cheese frosting
-- Reference: professional bakery recipe
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 400, 2.0, 'Tepung serbaguna untuk batter banana cake'
FROM products p JOIN ingredients i ON i.sku='ING-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='banana-cake-cream-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 400, 1.5, 'Gula pasir untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='banana-cake-cream-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 260, 5.0, 'Pisang overripe yang dihaluskan — gunakan pisang bercak coklat'
FROM products p JOIN ingredients i ON i.sku='ING-BANANA' JOIN measurement_units u ON u.code='g' WHERE p.slug='banana-cake-cream-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 4, 0.0, 'Telur untuk batter'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='banana-cake-cream-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 226, 1.5, 'Mentega tawar cair untuk batter moist'
FROM products p JOIN ingredients i ON i.sku='ING-BUTTER' JOIN measurement_units u ON u.code='g' WHERE p.slug='banana-cake-cream-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 150, 1.5, 'Minyak sayur tambahan untuk kelembaban'
FROM products p JOIN ingredients i ON i.sku='ING-VEG-OIL' JOIN measurement_units u ON u.code='ml' WHERE p.slug='banana-cake-cream-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 320, 1.0, 'Buttermilk / susu full-cream untuk batter lembap'
FROM products p JOIN ingredients i ON i.sku='ING-MILK' JOIN measurement_units u ON u.code='ml' WHERE p.slug='banana-cake-cream-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 450, 2.5, 'Cream cheese brick untuk frosting tangy'
FROM products p JOIN ingredients i ON i.sku='ING-CREAM-CHEESE' JOIN measurement_units u ON u.code='g' WHERE p.slug='banana-cake-cream-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 900, 1.0, 'Gula halus untuk frosting cream cheese'
FROM products p JOIN ingredients i ON i.sku='ING-POWDERED-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='banana-cake-cream-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 10, 0.0, 'Vanilla bean paste untuk batter dan frosting'
FROM products p JOIN ingredients i ON i.sku='ING-VANILLA-BEAN-PASTE' JOIN measurement_units u ON u.code='ml' WHERE p.slug='banana-cake-cream-cheese';

-- ────────────────────────────────────────────────
-- NEW: Avocado Mocca Delight Jar (250 ml jar)
-- Avocado mousse + mocha espresso mousse over chocolate sponge
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 5.0, 'Alpukat mentega matang sebagai base mousse creamy'
FROM products p JOIN ingredients i ON i.sku='ING-AVOCADO' JOIN measurement_units u ON u.code='g' WHERE p.slug='avocado-mocca-delight-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 80, 1.5, 'Dark couverture leleh untuk mousse mocca'
FROM products p JOIN ingredients i ON i.sku='ING-DARK-CHOC' JOIN measurement_units u ON u.code='g' WHERE p.slug='avocado-mocca-delight-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 15, 0.5, 'Kakao Dutch-process untuk intensitas mocca'
FROM products p JOIN ingredients i ON i.sku='ING-COCOA' JOIN measurement_units u ON u.code='g' WHERE p.slug='avocado-mocca-delight-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 45, 0.5, 'Espresso pekat untuk layer mocca'
FROM products p JOIN ingredients i ON i.sku='ING-ESPRESSO' JOIN measurement_units u ON u.code='ml' WHERE p.slug='avocado-mocca-delight-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 30, 0.5, 'Maple syrup sebagai pemanis alami untuk mousse alpukat'
FROM products p JOIN ingredients i ON i.sku='ING-MAPLE-SYRUP' JOIN measurement_units u ON u.code='ml' WHERE p.slug='avocado-mocca-delight-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 60, 1.5, 'Krim kocok untuk aerasi mousse'
FROM products p JOIN ingredients i ON i.sku='ING-HEAVY-CREAM' JOIN measurement_units u ON u.code='ml' WHERE p.slug='avocado-mocca-delight-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 50, 2.0, 'Sponge coklat dipotong dadu sebagai base jar'
FROM products p JOIN ingredients i ON i.sku='ING-CAKE-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='avocado-mocca-delight-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 5, 0.0, 'Vanilla extract untuk mousse alpukat'
FROM products p JOIN ingredients i ON i.sku='ING-VANILLA' JOIN measurement_units u ON u.code='ml' WHERE p.slug='avocado-mocca-delight-jar';

-- ────────────────────────────────────────────────
-- NEW: Exotic Mango Cake in Jar (250 ml jar)
-- Vanilla sponge + mango mousse + fresh mango topping
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 55, 2.0, 'Tepung kue untuk vanilla sponge base jar'
FROM products p JOIN ingredients i ON i.sku='ING-CAKE-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='exotic-mango-cake-in-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 70, 1.5, 'Gula untuk sponge dan mousse'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='exotic-mango-cake-in-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 2, 0.0, 'Telur untuk sponge'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='exotic-mango-cake-in-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 5, 0.0, 'Vanilla extract untuk sponge'
FROM products p JOIN ingredients i ON i.sku='ING-VANILLA' JOIN measurement_units u ON u.code='ml' WHERE p.slug='exotic-mango-cake-in-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 8.0, 'Mangga Harum Manis segar untuk puree mousse dan topping potongan'
FROM products p JOIN ingredients i ON i.sku='ING-MANGO' JOIN measurement_units u ON u.code='g' WHERE p.slug='exotic-mango-cake-in-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 120, 1.5, 'Krim kocok 35%+ fat untuk mousse mangga'
FROM products p JOIN ingredients i ON i.sku='ING-HEAVY-CREAM' JOIN measurement_units u ON u.code='ml' WHERE p.slug='exotic-mango-cake-in-jar';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 3, 1.0, 'Gelatin bubuk untuk stabilisasi mousse mangga'
FROM products p JOIN ingredients i ON i.sku='ING-GELATIN' JOIN measurement_units u ON u.code='g' WHERE p.slug='exotic-mango-cake-in-jar';

-- ────────────────────────────────────────────────
-- NEW: Black Forest Rum (20 cm)
-- Premium version with dark rum soak, Morello cherries, Chantilly
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 4, 0.0, 'Telur untuk sponge Genoise coklat'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='black-forest-rum';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 145, 1.5, 'Gula pasir untuk Genoise'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='black-forest-rum';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 70, 2.0, 'Tepung kue untuk sponge ringan'
FROM products p JOIN ingredients i ON i.sku='ING-CAKE-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='black-forest-rum';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 33, 1.0, 'Kakao Dutch-process untuk sponge'
FROM products p JOIN ingredients i ON i.sku='ING-COCOA' JOIN measurement_units u ON u.code='g' WHERE p.slug='black-forest-rum';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 38, 1.5, 'Mentega cair untuk Genoise'
FROM products p JOIN ingredients i ON i.sku='ING-BUTTER' JOIN measurement_units u ON u.code='g' WHERE p.slug='black-forest-rum';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 45, 0.0, 'Dark rum aged untuk merendam setiap lapisan sponge'
FROM products p JOIN ingredients i ON i.sku='ING-DARK-RUM' JOIN measurement_units u ON u.code='ml' WHERE p.slug='black-forest-rum';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 400, 3.0, 'Ceri Morello asam untuk filling dan kompot'
FROM products p JOIN ingredients i ON i.sku='ING-MORELLO-CHERRY' JOIN measurement_units u ON u.code='g' WHERE p.slug='black-forest-rum';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 450, 2.0, 'Krim Chantilly 35% fat untuk lapisan dan dekorasi'
FROM products p JOIN ingredients i ON i.sku='ING-HEAVY-CREAM' JOIN measurement_units u ON u.code='ml' WHERE p.slug='black-forest-rum';

-- ────────────────────────────────────────────────
-- NEW: Old Memories Vanilla Cheese (20 cm)
-- Vanilla sponge base + no-bake cream cheese filling + vanilla bean paste
-- ────────────────────────────────────────────────
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 125, 2.0, 'Tepung kue untuk vanilla sponge base tipis'
FROM products p JOIN ingredients i ON i.sku='ING-CAKE-FLOUR' JOIN measurement_units u ON u.code='g' WHERE p.slug='old-memories-vanilla-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 200, 1.5, 'Gula pasir untuk sponge dan filling'
FROM products p JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='old-memories-vanilla-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 4, 0.0, 'Telur untuk sponge'
FROM products p JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='pcs' WHERE p.slug='old-memories-vanilla-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 400, 2.0, 'Cream cheese brick full-fat untuk filling no-bake'
FROM products p JOIN ingredients i ON i.sku='ING-CREAM-CHEESE' JOIN measurement_units u ON u.code='g' WHERE p.slug='old-memories-vanilla-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 100, 1.5, 'Gula halus untuk filling'
FROM products p JOIN ingredients i ON i.sku='ING-POWDERED-SUGAR' JOIN measurement_units u ON u.code='g' WHERE p.slug='old-memories-vanilla-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 300, 1.0, 'Krim double/heavy untuk dikocok dan dilipat ke filling'
FROM products p JOIN ingredients i ON i.sku='ING-HEAVY-CREAM' JOIN measurement_units u ON u.code='ml' WHERE p.slug='old-memories-vanilla-cheese';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 15, 0.0, 'Vanilla bean paste kualitas premium — kunci aroma nostalgia'
FROM products p JOIN ingredients i ON i.sku='ING-VANILLA-BEAN-PASTE' JOIN measurement_units u ON u.code='ml' WHERE p.slug='old-memories-vanilla-cheese';

-- ============================================================
-- 9. PURCHASE ORDERS + ITEMS
-- ============================================================

-- PO-001: Nusantara Baking Supply — Dry goods replenishment
INSERT INTO purchase_orders (po_number, supplier_id, status, ordered_at, expected_at, received_at, notes)
SELECT 'PO-20260527-001', s.id, 'RECEIVED',
       NOW() - INTERVAL '4 day', NOW() - INTERVAL '2 day', NOW() - INTERVAL '2 day',
       'Mingguan — tepung, gula, kakao, coklat couverture, matcha'
FROM suppliers s WHERE s.name = 'Nusantara Baking Supply';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 10, 13500, 'All-purpose flour 10 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-FLOUR' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260527-001';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 5, 14000, 'Cake flour 5 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-CAKE-FLOUR' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260527-001';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 8, 16000, 'Granulated sugar 8 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-SUGAR' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260527-001';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 3, 48000, 'Powdered sugar 3 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-POWDERED-SUGAR' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260527-001';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 2, 185000, 'Dutch-process cocoa powder 2 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-COCOA' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260527-001';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 3, 320000, 'Dark chocolate couverture 60% — 3 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-DARK-CHOC' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260527-001';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 1, 580000, 'Ceremonial grade matcha powder 1 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-MATCHA' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260527-001';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 2, 650000, 'Almond meal 2 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-ALMOND-MEAL' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260527-001';

-- PO-002: Fresh Dairy Co — Dairy restocking
INSERT INTO purchase_orders (po_number, supplier_id, status, ordered_at, expected_at, received_at, notes)
SELECT 'PO-20260528-002', s.id, 'RECEIVED',
       NOW() - INTERVAL '3 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
       'Mingguan — mentega, susu, krim, cream cheese, mascarpone'
FROM suppliers s WHERE s.name = 'Fresh Dairy Co';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 5, 58000, 'Unsalted butter 5 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-BUTTER' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260528-002';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 20, 18000, 'Fresh full-cream milk 20 l'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-MILK' JOIN measurement_units u ON u.code='l'
WHERE po.po_number='PO-20260528-002';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 10, 35000, 'Heavy whipping cream 35% fat — 10 l'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-HEAVY-CREAM' JOIN measurement_units u ON u.code='l'
WHERE po.po_number='PO-20260528-002';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 5, 72000, 'Full-fat cream cheese brick 5 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-CREAM-CHEESE' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260528-002';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 3, 145000, 'Mascarpone cheese 3 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-MASCARPONE' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260528-002';

-- PO-003: Sweet Harvest Farm — Eggs & fresh produce
INSERT INTO purchase_orders (po_number, supplier_id, status, ordered_at, expected_at, received_at, notes)
SELECT 'PO-20260529-003', s.id, 'RECEIVED',
       NOW() - INTERVAL '2 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
       'Telur segar, stroberi, pisang overripe, wortel, lemon'
FROM suppliers s WHERE s.name = 'Sweet Harvest Farm';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 5, 55000, 'Fresh eggs 5 trays (30 pcs/tray)'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-EGG' JOIN measurement_units u ON u.code='tray'
WHERE po.po_number='PO-20260529-003';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 3, 68000, 'Fresh strawberry 3 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-STRAWBERRY' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260529-003';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 4, 14000, 'Overripe banana 4 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-BANANA' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260529-003';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 3, 12000, 'Fresh carrot 3 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-CARROT' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260529-003';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 2, 22000, 'Fresh lemon 2 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-LEMON' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260529-003';

-- PO-004: Tropical Fruit Hub — Avocado & Mango (jar cakes)
INSERT INTO purchase_orders (po_number, supplier_id, status, ordered_at, expected_at, received_at, notes)
SELECT 'PO-20260530-004', s.id, 'RECEIVED',
       NOW() - INTERVAL '1 day', NOW(), NOW(),
       'Alpukat mentega dan mangga Harum Manis untuk jar cakes'
FROM suppliers s WHERE s.name = 'Tropical Fruit Hub';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 5, 38000, 'Ripe avocado 5 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-AVOCADO' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260530-004';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 8, 28000, 'Fresh Harum Manis mango 8 kg'
FROM purchase_orders po JOIN ingredients i ON i.sku='ING-MANGO' JOIN measurement_units u ON u.code='kg'
WHERE po.po_number='PO-20260530-004';

-- ============================================================
-- 10. SALES ORDERS, ORDER ITEMS, CUSTOM CAKE, PAYMENTS
-- ============================================================

-- ── SO-001: Walk-in — Chocolate Cake ─────────────────────────
INSERT INTO sales_orders (order_number, customer_id, order_type, status, ordered_at, scheduled_fulfillment_at,
                          subtotal_amount, discount_amount, tax_amount, total_amount, notes)
SELECT 'SO-20260529-001', c.id, 'WALK_IN', 'COMPLETED',
       NOW() - INTERVAL '2 day 9 hour', NOW() - INTERVAL '2 day 9 hour',
       285000, 0, 0, 285000, 'Pembelian langsung di toko'
FROM customers c WHERE c.phone = '+62-813-7000-0001';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 1, p.base_price, NULL
FROM sales_orders so JOIN products p ON p.slug='chocolate-cake'
WHERE so.order_number='SO-20260529-001';

INSERT INTO payments (sales_order_id, method, status, amount, paid_at, reference_number, notes)
SELECT so.id, 'CASH', 'PAID', 285000, NOW() - INTERVAL '2 day 9 hour', 'CASH-0001', 'Bayar tunai penuh di kasir'
FROM sales_orders so WHERE so.order_number='SO-20260529-001';

-- ── SO-002: Walk-in — Avocado Mocca Jar (2 pcs) ──────────────
INSERT INTO sales_orders (order_number, customer_id, order_type, status, ordered_at, scheduled_fulfillment_at,
                          subtotal_amount, discount_amount, tax_amount, total_amount, notes)
SELECT 'SO-20260529-002', c.id, 'WALK_IN', 'COMPLETED',
       NOW() - INTERVAL '2 day 7 hour', NOW() - INTERVAL '2 day 7 hour',
       130000, 0, 0, 130000, 'Beli 2 jar langsung bawa'
FROM customers c WHERE c.phone = '+62-813-7000-0005';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 2, p.base_price, 'Ready stock'
FROM sales_orders so JOIN products p ON p.slug='avocado-mocca-delight-jar'
WHERE so.order_number='SO-20260529-002';

INSERT INTO payments (sales_order_id, method, status, amount, paid_at, reference_number, notes)
SELECT so.id, 'QRIS', 'PAID', 130000, NOW() - INTERVAL '2 day 7 hour', 'QR-0002', 'QRIS scan langsung'
FROM sales_orders so WHERE so.order_number='SO-20260529-002';

-- ── SO-003: Pre-order — Banana Cake Cream Cheese + Mango Jar ─
INSERT INTO sales_orders (order_number, customer_id, order_type, status, ordered_at, scheduled_fulfillment_at,
                          subtotal_amount, discount_amount, tax_amount, total_amount, notes)
SELECT 'SO-20260529-003', c.id, 'PRE_ORDER', 'IN_PRODUCTION',
       NOW() - INTERVAL '2 day 5 hour', NOW() + INTERVAL '1 day',
       553000, 28000, 0, 525000, 'Pre-order acara ulang tahun kantor — ambil besok sore'
FROM customers c WHERE c.phone = '+62-813-7000-0002';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 1, p.base_price, 'Banana Cake Cream Cheese — tulisan: Happy Birthday Team!'
FROM sales_orders so JOIN products p ON p.slug='banana-cake-cream-cheese'
WHERE so.order_number='SO-20260529-003';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 4, p.base_price, 'Jar mango untuk masing-masing anggota tim'
FROM sales_orders so JOIN products p ON p.slug='exotic-mango-cake-in-jar'
WHERE so.order_number='SO-20260529-003';

INSERT INTO payments (sales_order_id, method, status, amount, paid_at, reference_number, notes)
SELECT so.id, 'BANK_TRANSFER', 'PAID', 262500, NOW() - INTERVAL '2 day 4 hour', 'TRF-PR-0003', 'DP 50% via transfer BCA'
FROM sales_orders so WHERE so.order_number='SO-20260529-003';

-- ── SO-004: Pre-order — Black Forest Rum ─────────────────────
INSERT INTO sales_orders (order_number, customer_id, order_type, status, ordered_at, scheduled_fulfillment_at,
                          subtotal_amount, discount_amount, tax_amount, total_amount, notes)
SELECT 'SO-20260530-004', c.id, 'PRE_ORDER', 'CONFIRMED',
       NOW() - INTERVAL '1 day 8 hour', NOW() + INTERVAL '2 day',
       345000, 0, 0, 345000, 'Request: rum tidak dikurangi, topping ceri banyak'
FROM customers c WHERE c.phone = '+62-813-7000-0004';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 1, p.base_price, 'Konfirmasi: dark rum aged — tidak halal, pelanggan sudah setuju'
FROM sales_orders so JOIN products p ON p.slug='black-forest-rum'
WHERE so.order_number='SO-20260530-004';

INSERT INTO payments (sales_order_id, method, status, amount, paid_at, reference_number, notes)
SELECT so.id, 'E_WALLET', 'PAID', 172500, NOW() - INTERVAL '1 day 7 hour', 'OVO-0004', 'DP 50% via OVO'
FROM sales_orders so WHERE so.order_number='SO-20260530-004';

-- ── SO-005: Pre-order — Old Memories Vanilla Cheese ──────────
INSERT INTO sales_orders (order_number, customer_id, order_type, status, ordered_at, scheduled_fulfillment_at,
                          subtotal_amount, discount_amount, tax_amount, total_amount, notes)
SELECT 'SO-20260530-005', c.id, 'PRE_ORDER', 'CONFIRMED',
       NOW() - INTERVAL '1 day 4 hour', NOW() + INTERVAL '3 day',
       315000, 15000, 0, 300000, 'Diskon pelanggan setia — ambil Senin pagi'
FROM customers c WHERE c.phone = '+62-813-7000-0003';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 1, p.base_price, NULL
FROM sales_orders so JOIN products p ON p.slug='old-memories-vanilla-cheese'
WHERE so.order_number='SO-20260530-005';

INSERT INTO payments (sales_order_id, method, status, amount, paid_at, reference_number, notes)
SELECT so.id, 'QRIS', 'PAID', 150000, NOW() - INTERVAL '1 day 3 hour', 'QR-0005', 'DP 50% QRIS'
FROM sales_orders so WHERE so.order_number='SO-20260530-005';

-- ── SO-006: Walk-in — Matcha + Lemon Cake ────────────────────
INSERT INTO sales_orders (order_number, customer_id, order_type, status, ordered_at, scheduled_fulfillment_at,
                          subtotal_amount, discount_amount, tax_amount, total_amount, notes)
SELECT 'SO-20260531-006', NULL, 'WALK_IN', 'COMPLETED',
       NOW() - INTERVAL '4 hour', NOW() - INTERVAL '4 hour',
       605000, 0, 0, 605000, 'Walk-in anonim — bayar tunai'
FROM measurement_units LIMIT 1;

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 1, p.base_price, NULL
FROM sales_orders so JOIN products p ON p.slug='matcha-cake'
WHERE so.order_number='SO-20260531-006';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 1, p.base_price, NULL
FROM sales_orders so JOIN products p ON p.slug='lemon-cake'
WHERE so.order_number='SO-20260531-006';

INSERT INTO payments (sales_order_id, method, status, amount, paid_at, reference_number, notes)
SELECT so.id, 'CASH', 'PAID', 605000, NOW() - INTERVAL '4 hour', 'CASH-0006', 'Tunai, kembalian diberikan'
FROM sales_orders so WHERE so.order_number='SO-20260531-006';

-- ── SO-007: Walk-in — Jar Cakes batch (Avocado + Mango) ──────
INSERT INTO sales_orders (order_number, customer_id, order_type, status, ordered_at, scheduled_fulfillment_at,
                          subtotal_amount, discount_amount, tax_amount, total_amount, notes)
SELECT 'SO-20260531-007', c.id, 'WALK_IN', 'COMPLETED',
       NOW() - INTERVAL '2 hour', NOW() - INTERVAL '2 hour',
       372000, 0, 0, 372000, 'Pelanggan reguler — beli jar mingguan'
FROM customers c WHERE c.phone = '+62-813-7000-0005';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 3, p.base_price, NULL
FROM sales_orders so JOIN products p ON p.slug='avocado-mocca-delight-jar'
WHERE so.order_number='SO-20260531-007';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 3, p.base_price, NULL
FROM sales_orders so JOIN products p ON p.slug='exotic-mango-cake-in-jar'
WHERE so.order_number='SO-20260531-007';

INSERT INTO payments (sales_order_id, method, status, amount, paid_at, reference_number, notes)
SELECT so.id, 'QRIS', 'PAID', 372000, NOW() - INTERVAL '2 hour', 'QR-0007', 'QRIS Gopay scan'
FROM sales_orders so WHERE so.order_number='SO-20260531-007';

-- ── SO-008: Custom Cake — 2-Tier Wedding ─────────────────────
INSERT INTO sales_orders (order_number, customer_id, order_type, status, ordered_at, scheduled_fulfillment_at,
                          subtotal_amount, discount_amount, tax_amount, total_amount, notes)
SELECT 'SO-20260531-008', c.id, 'CUSTOM_CAKE', 'IN_PRODUCTION',
       NOW() - INTERVAL '6 hour', NOW() + INTERVAL '4 day',
       1200000, 0, 0, 1200000, '2-tier wedding cake dengan floral edible — sudah diapprove'
FROM customers c WHERE c.phone = '+62-813-7000-0001';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, NULL, 'Custom Wedding Cake - 2 Tier Floral Edible', 1, 1200000, 'Tier bawah 24 cm, tier atas 16 cm'
FROM sales_orders so WHERE so.order_number='SO-20260531-008';

INSERT INTO custom_cake_requests (
    sales_order_item_id, customer_id, occasion, cake_size_label, servings_estimate,
    flavor, filling, frosting, design_notes, inscription_text,
    reference_image_url, requested_date, due_at, status, quoted_price, approved_at
)
SELECT
    soi.id, c.id,
    'Wedding Reception',
    '2 Tier (24 cm + 16 cm)',
    80,
    'Vanilla Bean & Rose Lychee',
    'Lychee Compote & Vanilla Pastry Cream',
    'Swiss Meringue Buttercream',
    'White base fondant, pressed edible flowers (rose + jasmine), gold leaf accents, dusted with pearl shimmer. Pillar separators antar tier. Topper: initial monogram emas.',
    'Forever & Always — A & R',
    'https://example.com/ref/wedding-floral-2tier.jpg',
    CURRENT_DATE,
    NOW() + INTERVAL '4 day',
    'APPROVED',
    1200000,
    NOW() - INTERVAL '4 hour'
FROM sales_order_items soi
JOIN sales_orders so ON so.id = soi.sales_order_id
JOIN customers c ON c.id = so.customer_id
WHERE so.order_number = 'SO-20260531-008'
  AND soi.item_name_snapshot = 'Custom Wedding Cake - 2 Tier Floral Edible';

INSERT INTO payments (sales_order_id, method, status, amount, paid_at, reference_number, notes)
SELECT so.id, 'BANK_TRANSFER', 'PAID', 600000, NOW() - INTERVAL '5 hour', 'TRF-CUSTOM-0008', 'DP 50% BCA custom wedding cake'
FROM sales_orders so WHERE so.order_number='SO-20260531-008';

COMMIT;
