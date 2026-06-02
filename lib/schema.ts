import {
  pgTable,
  text,
  bigserial,
  integer,
  timestamp,
  boolean,
  numeric,
  date,
  pgEnum,
  foreignKey,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

// ==============================
// ENUM TYPES
// ==============================
export const inventoryMovementTypeEnum = pgEnum("inventory_movement_type", [
  "IN",
  "OUT",
  "ADJUSTMENT",
]);
export const orderTypeEnum = pgEnum("order_type", [
  "WALK_IN",
  "PRE_ORDER",
  "CUSTOM_CAKE",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "DRAFT",
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY",
  "COMPLETED",
  "CANCELLED",
]);
export const customCakeStatusEnum = pgEnum("custom_cake_status", [
  "DRAFT",
  "QUOTED",
  "APPROVED",
  "IN_PRODUCTION",
  "READY",
  "COMPLETED",
  "CANCELLED",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "CASH",
  "QRIS",
  "BANK_TRANSFER",
  "E_WALLET",
  "CARD",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "REFUNDED",
  "FAILED",
]);
export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "DRAFT",
  "SUBMITTED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
]);

// ==============================
// MASTER TABLES
// ==============================
export const measurementUnits = pgTable("measurement_units", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  unitType: text("unit_type").notNull(),
  isBaseUnit: boolean("is_base_unit").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const customers = pgTable("customers", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").unique(),
  email: text("email").unique(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const productCategories = pgTable("product_categories", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const products = pgTable("products", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: bigserial("category_id", { mode: "bigint" }).notNull(),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  sizeLabel: text("size_label"),
  imagePath: text("image_path"),
  isActive: boolean("is_active").notNull().default(true),
  isCustomizable: boolean("is_customizable").notNull().default(false),
  isPreorderOnly: boolean("is_preorder_only").notNull().default(false),
  defaultLeadTimeDays: integer("default_lead_time_days")
    .notNull()
    .default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  categoryFk: foreignKey({
    columns: [table.categoryId],
    foreignColumns: [productCategories.id],
  }),
}));

export const productVariants = pgTable("product_variants", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  productId: bigserial("product_id", { mode: "bigint" }).notNull(),
  label: text("label").notNull(),
  priceOverride: numeric("price_override", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  productFk: foreignKey({
    columns: [table.productId],
    foreignColumns: [products.id],
  }).onDelete("cascade"),
}));

export const ingredients = pgTable("ingredients", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  baseUnitId: bigserial("base_unit_id", { mode: "bigint" }).notNull(),
  reorderLevelBaseQty: numeric("reorder_level_base_qty", {
    precision: 14,
    scale: 4,
  })
    .notNull()
    .default("0"),
  preferredSupplierId: bigserial("preferred_supplier_id", {
    mode: "bigint",
  }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  baseUnitFk: foreignKey({
    columns: [table.baseUnitId],
    foreignColumns: [measurementUnits.id],
  }),
  preferredSupplierFk: foreignKey({
    columns: [table.preferredSupplierId],
    foreignColumns: [suppliers.id],
  }),
}));

export const ingredientUnitMap = pgTable(
  "ingredient_unit_map",
  {
    ingredientId: bigserial("ingredient_id", { mode: "bigint" }).notNull(),
    unitId: bigserial("unit_id", { mode: "bigint" }).notNull(),
    toBaseMultiplier: numeric("to_base_multiplier", {
      precision: 18,
      scale: 8,
    }).notNull(),
    isPurchaseUnit: boolean("is_purchase_unit").notNull().default(false),
    isRecipeUnit: boolean("is_recipe_unit").notNull().default(true),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.ingredientId, table.unitId] }),
    ingredientFk: foreignKey({
      columns: [table.ingredientId],
      foreignColumns: [ingredients.id],
    }).onDelete("cascade"),
    unitFk: foreignKey({
      columns: [table.unitId],
      foreignColumns: [measurementUnits.id],
    }),
  })
);

export const productRecipeIngredients = pgTable("product_recipe_ingredients", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  productId: bigserial("product_id", { mode: "bigint" }).notNull(),
  ingredientId: bigserial("ingredient_id", { mode: "bigint" }).notNull(),
  unitId: bigserial("unit_id", { mode: "bigint" }).notNull(),
  quantityPerProduct: numeric("quantity_per_product", {
    precision: 14,
    scale: 4,
  }).notNull(),
  wastagePercent: numeric("wastage_percent", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  notes: text("notes"),
}, (table) => ({
  productFk: foreignKey({
    columns: [table.productId],
    foreignColumns: [products.id],
  }).onDelete("cascade"),
  ingredientUnitFk: foreignKey({
    columns: [table.ingredientId, table.unitId],
    foreignColumns: [ingredientUnitMap.ingredientId, ingredientUnitMap.unitId],
  }),
  uniqueProductIngredient: unique().on(
    table.productId,
    table.ingredientId
  ),
}));

// ==============================
// INVENTORY TRANSACTIONS
// ==============================
export const purchaseOrders = pgTable("purchase_orders", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  poNumber: text("po_number").notNull().unique(),
  supplierId: bigserial("supplier_id", { mode: "bigint" }).notNull(),
  status: purchaseOrderStatusEnum("status").notNull().default("DRAFT"),
  orderedAt: timestamp("ordered_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expectedAt: timestamp("expected_at", { withTimezone: true }),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  supplierFk: foreignKey({
    columns: [table.supplierId],
    foreignColumns: [suppliers.id],
  }),
}));

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  purchaseOrderId: bigserial("purchase_order_id", { mode: "bigint" }).notNull(),
  ingredientId: bigserial("ingredient_id", { mode: "bigint" }).notNull(),
  unitId: bigserial("unit_id", { mode: "bigint" }).notNull(),
  quantity: numeric("quantity", { precision: 14, scale: 4 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 14, scale: 2 }).notNull(),
  notes: text("notes"),
}, (table) => ({
  poFk: foreignKey({
    columns: [table.purchaseOrderId],
    foreignColumns: [purchaseOrders.id],
  }).onDelete("cascade"),
  ingredientUnitFk: foreignKey({
    columns: [table.ingredientId, table.unitId],
    foreignColumns: [ingredientUnitMap.ingredientId, ingredientUnitMap.unitId],
  }),
}));

export const ingredientStockMovements = pgTable(
  "ingredient_stock_movements",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    ingredientId: bigserial("ingredient_id", { mode: "bigint" }).notNull(),
    unitId: bigserial("unit_id", { mode: "bigint" }).notNull(),
    movementType: inventoryMovementTypeEnum("movement_type").notNull(),
    quantity: numeric("quantity", { precision: 14, scale: 4 }).notNull(),
    movementAt: timestamp("movement_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    referenceType: text("reference_type"),
    referenceId: bigserial("reference_id", { mode: "bigint" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ingredientUnitFk: foreignKey({
      columns: [table.ingredientId, table.unitId],
      foreignColumns: [
        ingredientUnitMap.ingredientId,
        ingredientUnitMap.unitId,
      ],
    }),
  })
);

// ==============================
// SALES / POS / PRE-ORDER / CUSTOM CAKE
// ==============================
export const salesOrders = pgTable("sales_orders", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: bigserial("customer_id", { mode: "bigint" }),
  orderType: orderTypeEnum("order_type").notNull(),
  status: orderStatusEnum("status").notNull().default("DRAFT"),
  orderedAt: timestamp("ordered_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  scheduledFulfillmentAt: timestamp("scheduled_fulfillment_at", {
    withTimezone: true,
  }),
  subtotalAmount: numeric("subtotal_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  discountAmount: numeric("discount_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  taxAmount: numeric("tax_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  customerFk: foreignKey({
    columns: [table.customerId],
    foreignColumns: [customers.id],
  }),
}));

export const salesOrderItems = pgTable("sales_order_items", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  salesOrderId: bigserial("sales_order_id", { mode: "bigint" }).notNull(),
  productId: bigserial("product_id", { mode: "bigint" }),
  itemNameSnapshot: text("item_name_snapshot").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
  notes: text("notes"),
}, (table) => ({
  soFk: foreignKey({
    columns: [table.salesOrderId],
    foreignColumns: [salesOrders.id],
  }).onDelete("cascade"),
  productFk: foreignKey({
    columns: [table.productId],
    foreignColumns: [products.id],
  }),
}));

export const customCakeRequests = pgTable("custom_cake_requests", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  salesOrderItemId: bigserial("sales_order_item_id", {
    mode: "bigint",
  }).notNull(),
  customerId: bigserial("customer_id", { mode: "bigint" }).notNull(),
  occasion: text("occasion"),
  cakeSizeLabel: text("cake_size_label"),
  servingsEstimate: integer("servings_estimate"),
  flavor: text("flavor"),
  filling: text("filling"),
  frosting: text("frosting"),
  designNotes: text("design_notes"),
  inscriptionText: text("inscription_text"),
  referenceImageUrl: text("reference_image_url"),
  requestedDate: date("requested_date").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  status: customCakeStatusEnum("status").notNull().default("DRAFT"),
  quotedPrice: numeric("quoted_price", { precision: 14, scale: 2 }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  soiFk: foreignKey({
    columns: [table.salesOrderItemId],
    foreignColumns: [salesOrderItems.id],
  }).onDelete("cascade"),
  customerFk: foreignKey({
    columns: [table.customerId],
    foreignColumns: [customers.id],
  }),
  uniqueSalesOrderItem: unique().on(table.salesOrderItemId),
}));

export const payments = pgTable("payments", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  salesOrderId: bigserial("sales_order_id", { mode: "bigint" }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("PENDING"),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  soFk: foreignKey({
    columns: [table.salesOrderId],
    foreignColumns: [salesOrders.id],
  }).onDelete("cascade"),
}));

export const admins = pgTable("admins", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
