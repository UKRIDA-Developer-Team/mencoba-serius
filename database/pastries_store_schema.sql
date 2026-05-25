BEGIN;

-- ==============================
-- ENUM TYPES
-- ==============================
CREATE TYPE inventory_movement_type AS ENUM ('IN', 'OUT', 'ADJUSTMENT');
CREATE TYPE order_type AS ENUM ('WALK_IN', 'PRE_ORDER', 'CUSTOM_CAKE');
CREATE TYPE order_status AS ENUM ('DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'COMPLETED', 'CANCELLED');
CREATE TYPE custom_cake_status AS ENUM ('DRAFT', 'QUOTED', 'APPROVED', 'IN_PRODUCTION', 'READY', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'QRIS', 'BANK_TRANSFER', 'E_WALLET', 'CARD');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');
CREATE TYPE purchase_order_status AS ENUM ('DRAFT', 'SUBMITTED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- ==============================
-- MASTER TABLES
-- ==============================
CREATE TABLE measurement_units (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    unit_type       VARCHAR(20) NOT NULL CHECK (unit_type IN ('mass', 'volume', 'count', 'package')),
    is_base_unit    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE suppliers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    contact_name    VARCHAR(150),
    phone           VARCHAR(50),
    email           VARCHAR(150),
    address         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
    id              BIGSERIAL PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(50),
    email           VARCHAR(150),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (phone),
    UNIQUE (email)
);

CREATE TABLE product_categories (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id                      BIGSERIAL PRIMARY KEY,
    slug                    VARCHAR(200) NOT NULL UNIQUE,
    name                    VARCHAR(200) NOT NULL,
    description             TEXT,
    category_id             BIGINT NOT NULL REFERENCES product_categories(id),
    base_price              NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
    size_label              VARCHAR(100),
    image_path              TEXT,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    is_customizable         BOOLEAN NOT NULL DEFAULT FALSE,
    is_preorder_only        BOOLEAN NOT NULL DEFAULT FALSE,
    default_lead_time_days  INTEGER NOT NULL DEFAULT 0 CHECK (default_lead_time_days >= 0),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ingredients (
    id                      BIGSERIAL PRIMARY KEY,
    sku                     VARCHAR(100) NOT NULL UNIQUE,
    name                    VARCHAR(200) NOT NULL,
    description             TEXT,
    base_unit_id            BIGINT NOT NULL REFERENCES measurement_units(id),
    reorder_level_base_qty  NUMERIC(14,4) NOT NULL DEFAULT 0 CHECK (reorder_level_base_qty >= 0),
    preferred_supplier_id   BIGINT REFERENCES suppliers(id),
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ingredient-specific conversion map: quantity_in_base = quantity_in_unit * to_base_multiplier
CREATE TABLE ingredient_unit_map (
    ingredient_id           BIGINT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    unit_id                 BIGINT NOT NULL REFERENCES measurement_units(id),
    to_base_multiplier      NUMERIC(18,8) NOT NULL CHECK (to_base_multiplier > 0),
    is_purchase_unit        BOOLEAN NOT NULL DEFAULT FALSE,
    is_recipe_unit          BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ingredient_id, unit_id)
);

CREATE TABLE product_recipe_ingredients (
    id                      BIGSERIAL PRIMARY KEY,
    product_id              BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredient_id           BIGINT NOT NULL,
    unit_id                 BIGINT NOT NULL,
    quantity_per_product    NUMERIC(14,4) NOT NULL CHECK (quantity_per_product > 0),
    wastage_percent         NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (wastage_percent >= 0),
    notes                   TEXT,
    UNIQUE (product_id, ingredient_id),
    FOREIGN KEY (ingredient_id, unit_id)
        REFERENCES ingredient_unit_map(ingredient_id, unit_id)
);

-- ==============================
-- INVENTORY TRANSACTIONS
-- ==============================
CREATE TABLE purchase_orders (
    id                  BIGSERIAL PRIMARY KEY,
    po_number           VARCHAR(100) NOT NULL UNIQUE,
    supplier_id         BIGINT NOT NULL REFERENCES suppliers(id),
    status              purchase_order_status NOT NULL DEFAULT 'DRAFT',
    ordered_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_at         TIMESTAMPTZ,
    received_at         TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id                  BIGSERIAL PRIMARY KEY,
    purchase_order_id   BIGINT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    ingredient_id       BIGINT NOT NULL,
    unit_id             BIGINT NOT NULL,
    quantity            NUMERIC(14,4) NOT NULL CHECK (quantity > 0),
    unit_cost           NUMERIC(14,2) NOT NULL CHECK (unit_cost >= 0),
    notes               TEXT,
    FOREIGN KEY (ingredient_id, unit_id)
        REFERENCES ingredient_unit_map(ingredient_id, unit_id)
);

CREATE TABLE ingredient_stock_movements (
    id                  BIGSERIAL PRIMARY KEY,
    ingredient_id       BIGINT NOT NULL,
    unit_id             BIGINT NOT NULL,
    movement_type       inventory_movement_type NOT NULL,
    quantity            NUMERIC(14,4) NOT NULL CHECK (quantity > 0),
    movement_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reference_type      VARCHAR(50),
    reference_id        BIGINT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (ingredient_id, unit_id)
        REFERENCES ingredient_unit_map(ingredient_id, unit_id)
);

CREATE VIEW ingredient_current_stock AS
SELECT
    i.id AS ingredient_id,
    i.sku,
    i.name AS ingredient_name,
    bu.code AS base_unit_code,
    COALESCE(SUM(
        CASE m.movement_type
            WHEN 'IN' THEN m.quantity * ium.to_base_multiplier
            WHEN 'OUT' THEN -1 * m.quantity * ium.to_base_multiplier
            WHEN 'ADJUSTMENT' THEN m.quantity * ium.to_base_multiplier
        END
    ), 0) AS current_stock_base_qty,
    i.reorder_level_base_qty,
    (COALESCE(SUM(
        CASE m.movement_type
            WHEN 'IN' THEN m.quantity * ium.to_base_multiplier
            WHEN 'OUT' THEN -1 * m.quantity * ium.to_base_multiplier
            WHEN 'ADJUSTMENT' THEN m.quantity * ium.to_base_multiplier
        END
    ), 0) <= i.reorder_level_base_qty) AS is_below_reorder_level
FROM ingredients i
JOIN measurement_units bu ON bu.id = i.base_unit_id
LEFT JOIN ingredient_stock_movements m ON m.ingredient_id = i.id
LEFT JOIN ingredient_unit_map ium
    ON ium.ingredient_id = m.ingredient_id
   AND ium.unit_id = m.unit_id
GROUP BY i.id, i.sku, i.name, bu.code, i.reorder_level_base_qty;

-- ==============================
-- SALES / POS / PRE-ORDER / CUSTOM CAKE
-- ==============================
CREATE TABLE sales_orders (
    id                          BIGSERIAL PRIMARY KEY,
    order_number                VARCHAR(100) NOT NULL UNIQUE,
    customer_id                 BIGINT REFERENCES customers(id),
    order_type                  order_type NOT NULL,
    status                      order_status NOT NULL DEFAULT 'DRAFT',
    ordered_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_fulfillment_at    TIMESTAMPTZ,
    subtotal_amount             NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (subtotal_amount >= 0),
    discount_amount             NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount                  NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount                NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    notes                       TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sales_order_items (
    id                  BIGSERIAL PRIMARY KEY,
    sales_order_id      BIGINT NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id          BIGINT REFERENCES products(id),
    item_name_snapshot  VARCHAR(200) NOT NULL,
    quantity            NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
    unit_price          NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),
    line_total          NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    notes               TEXT
);

CREATE TABLE custom_cake_requests (
    id                      BIGSERIAL PRIMARY KEY,
    sales_order_item_id     BIGINT NOT NULL UNIQUE REFERENCES sales_order_items(id) ON DELETE CASCADE,
    customer_id             BIGINT NOT NULL REFERENCES customers(id),
    occasion                VARCHAR(100),
    cake_size_label         VARCHAR(100),
    servings_estimate       INTEGER CHECK (servings_estimate > 0),
    flavor                  VARCHAR(100),
    filling                 VARCHAR(100),
    frosting                VARCHAR(100),
    design_notes            TEXT,
    inscription_text        VARCHAR(255),
    reference_image_url     TEXT,
    requested_date          DATE NOT NULL,
    due_at                  TIMESTAMPTZ NOT NULL,
    status                  custom_cake_status NOT NULL DEFAULT 'DRAFT',
    quoted_price            NUMERIC(14,2) CHECK (quoted_price >= 0),
    approved_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
    id                  BIGSERIAL PRIMARY KEY,
    sales_order_id      BIGINT NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    method              payment_method NOT NULL,
    status              payment_status NOT NULL DEFAULT 'PENDING',
    amount              NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    paid_at             TIMESTAMPTZ,
    reference_number    VARCHAR(150),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================
-- SEED DATA
-- ==============================

-- Units
INSERT INTO measurement_units (code, name, unit_type, is_base_unit) VALUES
('g', 'Gram', 'mass', TRUE),
('kg', 'Kilogram', 'mass', FALSE),
('ml', 'Milliliter', 'volume', TRUE),
('l', 'Liter', 'volume', FALSE),
('pcs', 'Pieces', 'count', TRUE),
('tray', 'Tray', 'package', FALSE),
('box', 'Box', 'package', FALSE);

-- Suppliers
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES
('Nusantara Baking Supply', 'Budi Santoso', '+62-812-1000-0001', 'budi@nusantarabaking.id', 'Jakarta, Indonesia'),
('Fresh Dairy Co', 'Dewi Larasati', '+62-812-1000-0002', 'dewi@freshdairy.id', 'Bandung, Indonesia'),
('Sweet Harvest Farm', 'Rama Pratama', '+62-812-1000-0003', 'rama@sweetharvest.id', 'Lembang, Indonesia');

-- Customers
INSERT INTO customers (full_name, phone, email, notes) VALUES
('Alicia Prameswari', '+62-813-7000-0001', 'alicia@example.com', 'Prefers less sweet frosting'),
('Rizky Maulana', '+62-813-7000-0002', 'rizky@example.com', 'Often places pre-orders for office events');

-- Product categories
INSERT INTO product_categories (name, description) VALUES
('Birthday', 'Birthday and celebration cakes'),
('Anniversary', 'Anniversary cakes'),
('Special', 'Seasonal and special cakes'),
('Wedding', 'Wedding cakes'),
('Custom', 'Custom-made cakes');

-- Products (aligned with current app seed and /public/product images)
INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'chocolate-cake', 'Chocolate Cake', 'Kue coklat lembut dengan rasa manis pekat dan tekstur yang moist, cocok untuk pecinta coklat sejati.', c.id, 285000, '20 cm', '/product/chocolate-cake.jpeg', TRUE, FALSE, 1 FROM product_categories c WHERE c.name = 'Birthday';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'strawberry-shortcake', 'Strawberry Shortcake', 'Kue ringan dengan lapisan krim lembut dan potongan stroberi segar yang memberikan rasa manis dan sedikit asam.', c.id, 320000, '20 cm', '/product/strawberry-shortcake.jpeg', TRUE, TRUE, 2 FROM product_categories c WHERE c.name = 'Birthday';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'red-velvet', 'Red Velvet', 'Kue lembut berwarna merah khas dengan rasa coklat ringan yang dipadukan dengan krim keju yang lezat.', c.id, 310000, '20 cm', '/product/red-velvet.jpeg', TRUE, FALSE, 1 FROM product_categories c WHERE c.name = 'Anniversary';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'tiramisu', 'Tiramisu', 'Kue klasik Italia dengan lapisan kopi dan krim mascarpone yang lembut serta aroma kopi yang khas.', c.id, 375000, '22 cm', '/product/tiramisu.jpeg', TRUE, TRUE, 2 FROM product_categories c WHERE c.name = 'Special';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'black-forest', 'Black Forest', 'Kue coklat dengan lapisan krim dan ceri yang segar, memberikan kombinasi rasa manis dan sedikit asam.', c.id, 295000, '20 cm', '/product/black-forest.jpeg', TRUE, FALSE, 1 FROM product_categories c WHERE c.name = 'Birthday';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'matcha-cake', 'Matcha Cake', 'Kue lembut dengan rasa matcha khas Jepang yang sedikit pahit namun seimbang dengan manisnya krim.', c.id, 330000, '20 cm', '/product/matcha-cake.jpeg', TRUE, TRUE, 2 FROM product_categories c WHERE c.name = 'Special';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'vanilla-sponge', 'Vanilla Sponge', 'Kue vanilla yang ringan dan empuk dengan aroma harum yang cocok dinikmati kapan saja.', c.id, 265000, '20 cm', '/product/vanilla-sponge.jpeg', TRUE, FALSE, 1 FROM product_categories c WHERE c.name = 'Birthday';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'carrot-cake', 'Carrot Cake', 'Kue wortel dengan rasa manis alami dan sentuhan rempah yang hangat serta tekstur yang moist.', c.id, 280000, '20 cm', '/product/carrot-cake.jpeg', TRUE, TRUE, 2 FROM product_categories c WHERE c.name = 'Special';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'lemon-cake', 'Lemon Cake', 'Kue dengan rasa lemon yang segar, memberikan perpaduan rasa manis dan asam yang menyegarkan.', c.id, 275000, '20 cm', '/product/lemon-cake.jpeg', TRUE, FALSE, 1 FROM product_categories c WHERE c.name = 'Anniversary';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'opera-cake', 'Opera Cake', 'Kue elegan dengan lapisan kopi, coklat, dan krim yang kaya rasa serta tampilan yang mewah.', c.id, 420000, '24 cm', '/product/opera-cake.jpeg', TRUE, TRUE, 3 FROM product_categories c WHERE c.name = 'Wedding';

INSERT INTO products (slug, name, description, category_id, base_price, size_label, image_path, is_customizable, is_preorder_only, default_lead_time_days)
SELECT 'chiffon-cake', 'Chiffon Cake', 'Kue super ringan dan fluffy dengan tekstur lembut seperti kapas, cocok untuk semua kalangan.', c.id, 255000, '22 cm', '/product/chiffon-cake.jpeg', TRUE, FALSE, 1 FROM product_categories c WHERE c.name = 'Birthday';

-- Ingredients
INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-FLOUR', 'All-Purpose Flour', 'Main flour for sponge and cake batter', u.id, 5000, s.id
FROM measurement_units u CROSS JOIN suppliers s
WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-SUGAR', 'Granulated Sugar', 'General baking sugar', u.id, 3000, s.id
FROM measurement_units u CROSS JOIN suppliers s
WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-BUTTER', 'Unsalted Butter', 'Premium butter for cake and frosting', u.id, 2000, s.id
FROM measurement_units u CROSS JOIN suppliers s
WHERE u.code = 'g' AND s.name = 'Fresh Dairy Co';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-EGG', 'Chicken Egg', 'Fresh eggs', u.id, 90, s.id
FROM measurement_units u CROSS JOIN suppliers s
WHERE u.code = 'pcs' AND s.name = 'Sweet Harvest Farm';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-MILK', 'Fresh Milk', 'Milk for batter and cream', u.id, 4000, s.id
FROM measurement_units u CROSS JOIN suppliers s
WHERE u.code = 'ml' AND s.name = 'Fresh Dairy Co';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-COCOA', 'Cocoa Powder', 'Unsweetened cocoa powder', u.id, 1000, s.id
FROM measurement_units u CROSS JOIN suppliers s
WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-STRAWBERRY', 'Fresh Strawberry', 'Fresh strawberries for toppings and filling', u.id, 2000, s.id
FROM measurement_units u CROSS JOIN suppliers s
WHERE u.code = 'g' AND s.name = 'Sweet Harvest Farm';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-CHEESE', 'Cream Cheese', 'Cream cheese for frosting', u.id, 1500, s.id
FROM measurement_units u CROSS JOIN suppliers s
WHERE u.code = 'g' AND s.name = 'Fresh Dairy Co';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-MATCHA', 'Matcha Powder', 'Premium matcha powder', u.id, 500, s.id
FROM measurement_units u CROSS JOIN suppliers s
WHERE u.code = 'g' AND s.name = 'Nusantara Baking Supply';

INSERT INTO ingredients (sku, name, description, base_unit_id, reorder_level_base_qty, preferred_supplier_id)
SELECT 'ING-VANILLA', 'Vanilla Extract', 'Natural vanilla extract', u.id, 500, s.id
FROM measurement_units u CROSS JOIN suppliers s
WHERE u.code = 'ml' AND s.name = 'Nusantara Baking Supply';

-- Ingredient unit maps (multi-unit support)
INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 1, FALSE, TRUE FROM ingredients i JOIN measurement_units u ON u.code = 'g' WHERE i.sku IN ('ING-FLOUR', 'ING-SUGAR', 'ING-BUTTER', 'ING-COCOA', 'ING-STRAWBERRY', 'ING-CHEESE', 'ING-MATCHA');
INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 1000, TRUE, FALSE FROM ingredients i JOIN measurement_units u ON u.code = 'kg' WHERE i.sku IN ('ING-FLOUR', 'ING-SUGAR', 'ING-BUTTER', 'ING-COCOA', 'ING-STRAWBERRY', 'ING-CHEESE', 'ING-MATCHA');

INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 1, FALSE, TRUE FROM ingredients i JOIN measurement_units u ON u.code = 'ml' WHERE i.sku IN ('ING-MILK', 'ING-VANILLA');
INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 1000, TRUE, FALSE FROM ingredients i JOIN measurement_units u ON u.code = 'l' WHERE i.sku IN ('ING-MILK', 'ING-VANILLA');

INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 1, FALSE, TRUE FROM ingredients i JOIN measurement_units u ON u.code = 'pcs' WHERE i.sku = 'ING-EGG';
INSERT INTO ingredient_unit_map (ingredient_id, unit_id, to_base_multiplier, is_purchase_unit, is_recipe_unit)
SELECT i.id, u.id, 30, TRUE, FALSE FROM ingredients i JOIN measurement_units u ON u.code = 'tray' WHERE i.sku = 'ING-EGG';

-- Product recipes
INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 350, 2.5, 'Base batter flour'
FROM products p
JOIN ingredients i ON i.sku = 'ING-FLOUR'
JOIN measurement_units u ON u.code = 'g'
WHERE p.slug = 'chocolate-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 260, 1.5, 'Chocolate cake sugar'
FROM products p
JOIN ingredients i ON i.sku = 'ING-SUGAR'
JOIN measurement_units u ON u.code = 'g'
WHERE p.slug = 'chocolate-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 6, 0, 'Eggs in batter'
FROM products p
JOIN ingredients i ON i.sku = 'ING-EGG'
JOIN measurement_units u ON u.code = 'pcs'
WHERE p.slug = 'chocolate-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 120, 2, 'Cocoa for batter and ganache'
FROM products p
JOIN ingredients i ON i.sku = 'ING-COCOA'
JOIN measurement_units u ON u.code = 'g'
WHERE p.slug = 'chocolate-cake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 300, 4, 'Strawberry for topping/filling'
FROM products p
JOIN ingredients i ON i.sku = 'ING-STRAWBERRY'
JOIN measurement_units u ON u.code = 'g'
WHERE p.slug = 'strawberry-shortcake';

INSERT INTO product_recipe_ingredients (product_id, ingredient_id, unit_id, quantity_per_product, wastage_percent, notes)
SELECT p.id, i.id, u.id, 250, 3, 'Cream cheese for strawberry frosting'
FROM products p
JOIN ingredients i ON i.sku = 'ING-CHEESE'
JOIN measurement_units u ON u.code = 'g'
WHERE p.slug = 'strawberry-shortcake';

-- Purchase order seed
INSERT INTO purchase_orders (po_number, supplier_id, status, ordered_at, expected_at, notes)
SELECT 'PO-20260521-001', s.id, 'RECEIVED', NOW() - INTERVAL '3 day', NOW() - INTERVAL '1 day', 'Weekly ingredient replenishment'
FROM suppliers s
WHERE s.name = 'Nusantara Baking Supply';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 10, 15000, 'Flour in 10 kg bulk'
FROM purchase_orders po
JOIN ingredients i ON i.sku = 'ING-FLOUR'
JOIN measurement_units u ON u.code = 'kg'
WHERE po.po_number = 'PO-20260521-001';

INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, unit_id, quantity, unit_cost, notes)
SELECT po.id, i.id, u.id, 5, 18000, 'Sugar in 5 kg bulk'
FROM purchase_orders po
JOIN ingredients i ON i.sku = 'ING-SUGAR'
JOIN measurement_units u ON u.code = 'kg'
WHERE po.po_number = 'PO-20260521-001';

-- Stock movements in mixed units
INSERT INTO ingredient_stock_movements (ingredient_id, unit_id, movement_type, quantity, movement_at, reference_type, reference_id, notes)
SELECT i.id, u.id, 'IN', 10, NOW() - INTERVAL '2 day', 'purchase_order', po.id, 'Flour received from PO'
FROM ingredients i
JOIN measurement_units u ON u.code = 'kg'
JOIN purchase_orders po ON po.po_number = 'PO-20260521-001'
WHERE i.sku = 'ING-FLOUR';

INSERT INTO ingredient_stock_movements (ingredient_id, unit_id, movement_type, quantity, movement_at, reference_type, reference_id, notes)
SELECT i.id, u.id, 'IN', 5, NOW() - INTERVAL '2 day', 'purchase_order', po.id, 'Sugar received from PO'
FROM ingredients i
JOIN measurement_units u ON u.code = 'kg'
JOIN purchase_orders po ON po.po_number = 'PO-20260521-001'
WHERE i.sku = 'ING-SUGAR';

INSERT INTO ingredient_stock_movements (ingredient_id, unit_id, movement_type, quantity, movement_at, reference_type, reference_id, notes)
SELECT i.id, u.id, 'IN', 4, NOW() - INTERVAL '2 day', 'manual_init', NULL, 'Initial egg stock in trays'
FROM ingredients i
JOIN measurement_units u ON u.code = 'tray'
WHERE i.sku = 'ING-EGG';

INSERT INTO ingredient_stock_movements (ingredient_id, unit_id, movement_type, quantity, movement_at, reference_type, reference_id, notes)
SELECT i.id, u.id, 'IN', 20, NOW() - INTERVAL '2 day', 'manual_init', NULL, 'Initial milk stock in liters'
FROM ingredients i
JOIN measurement_units u ON u.code = 'l'
WHERE i.sku = 'ING-MILK';

INSERT INTO ingredient_stock_movements (ingredient_id, unit_id, movement_type, quantity, movement_at, reference_type, reference_id, notes)
SELECT i.id, u.id, 'OUT', 700, NOW() - INTERVAL '1 day', 'production_batch', NULL, 'Used for 2 chocolate cakes'
FROM ingredients i
JOIN measurement_units u ON u.code = 'g'
WHERE i.sku = 'ING-FLOUR';

INSERT INTO ingredient_stock_movements (ingredient_id, unit_id, movement_type, quantity, movement_at, reference_type, reference_id, notes)
SELECT i.id, u.id, 'OUT', 12, NOW() - INTERVAL '1 day', 'production_batch', NULL, 'Used eggs for daily production'
FROM ingredients i
JOIN measurement_units u ON u.code = 'pcs'
WHERE i.sku = 'ING-EGG';

INSERT INTO ingredient_stock_movements (ingredient_id, unit_id, movement_type, quantity, movement_at, reference_type, reference_id, notes)
SELECT i.id, u.id, 'ADJUSTMENT', 150, NOW() - INTERVAL '12 hour', 'stock_take', NULL, 'Positive adjustment after recount'
FROM ingredients i
JOIN measurement_units u ON u.code = 'g'
WHERE i.sku = 'ING-SUGAR';

-- Sales order seeds (walk-in, pre-order, custom cake)
INSERT INTO sales_orders (order_number, customer_id, order_type, status, ordered_at, scheduled_fulfillment_at, subtotal_amount, discount_amount, tax_amount, total_amount, notes)
SELECT
    'SO-20260521-001',
    c.id,
    'WALK_IN',
    'COMPLETED',
    NOW() - INTERVAL '10 hour',
    NOW() - INTERVAL '10 hour',
    285000,
    0,
    0,
    285000,
    'Direct purchase from storefront'
FROM customers c
WHERE c.phone = '+62-813-7000-0001';

INSERT INTO sales_orders (order_number, customer_id, order_type, status, ordered_at, scheduled_fulfillment_at, subtotal_amount, discount_amount, tax_amount, total_amount, notes)
SELECT
    'SO-20260521-002',
    c.id,
    'PRE_ORDER',
    'CONFIRMED',
    NOW() - INTERVAL '6 hour',
    NOW() + INTERVAL '2 day',
    640000,
    20000,
    0,
    620000,
    'Pre-order for office event'
FROM customers c
WHERE c.phone = '+62-813-7000-0002';

INSERT INTO sales_orders (order_number, customer_id, order_type, status, ordered_at, scheduled_fulfillment_at, subtotal_amount, discount_amount, tax_amount, total_amount, notes)
SELECT
    'SO-20260521-003',
    c.id,
    'CUSTOM_CAKE',
    'IN_PRODUCTION',
    NOW() - INTERVAL '4 hour',
    NOW() + INTERVAL '3 day',
    850000,
    0,
    0,
    850000,
    '2-tier floral custom cake'
FROM customers c
WHERE c.phone = '+62-813-7000-0001';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 1, p.base_price, 'Walk-in sale'
FROM sales_orders so
JOIN products p ON p.slug = 'chocolate-cake'
WHERE so.order_number = 'SO-20260521-001';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, p.id, p.name, 2, p.base_price, 'Pre-order batch'
FROM sales_orders so
JOIN products p ON p.slug = 'strawberry-shortcake'
WHERE so.order_number = 'SO-20260521-002';

INSERT INTO sales_order_items (sales_order_id, product_id, item_name_snapshot, quantity, unit_price, notes)
SELECT so.id, NULL, 'Custom Cake - 2 Tier Floral', 1, 850000, 'Custom cake based on customer request'
FROM sales_orders so
WHERE so.order_number = 'SO-20260521-003';

INSERT INTO custom_cake_requests (
    sales_order_item_id,
    customer_id,
    occasion,
    cake_size_label,
    servings_estimate,
    flavor,
    filling,
    frosting,
    design_notes,
    inscription_text,
    reference_image_url,
    requested_date,
    due_at,
    status,
    quoted_price,
    approved_at
)
SELECT
    soi.id,
    c.id,
    'Wedding Reception',
    '2 Tier (24 cm + 18 cm)',
    60,
    'Vanilla & Lemon',
    'Lemon Curd',
    'Swiss Meringue Buttercream',
    'White base, edible pressed flowers, gold accents',
    'Forever starts today',
    '/product/opera-cake.jpeg',
    CURRENT_DATE,
    NOW() + INTERVAL '3 day',
    'APPROVED',
    850000,
    NOW() - INTERVAL '2 hour'
FROM sales_order_items soi
JOIN sales_orders so ON so.id = soi.sales_order_id
JOIN customers c ON c.id = so.customer_id
WHERE so.order_number = 'SO-20260521-003'
  AND soi.item_name_snapshot = 'Custom Cake - 2 Tier Floral';

-- Payments
INSERT INTO payments (sales_order_id, method, status, amount, paid_at, reference_number, notes)
SELECT so.id, 'CASH', 'PAID', 285000, NOW() - INTERVAL '10 hour', 'CASH-0001', 'Paid in full at cashier'
FROM sales_orders so WHERE so.order_number = 'SO-20260521-001';

INSERT INTO payments (sales_order_id, method, status, amount, paid_at, reference_number, notes)
SELECT so.id, 'BANK_TRANSFER', 'PAID', 310000, NOW() - INTERVAL '5 hour', 'TRF-PR-0002', '50% pre-order down payment'
FROM sales_orders so WHERE so.order_number = 'SO-20260521-002';

INSERT INTO payments (sales_order_id, method, status, amount, paid_at, reference_number, notes)
SELECT so.id, 'QRIS', 'PAID', 425000, NOW() - INTERVAL '3 hour', 'QR-CUSTOM-0003', '50% custom cake down payment'
FROM sales_orders so WHERE so.order_number = 'SO-20260521-003';

COMMIT;
