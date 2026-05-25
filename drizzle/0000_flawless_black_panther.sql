CREATE TYPE "public"."custom_cake_status" AS ENUM('DRAFT', 'QUOTED', 'APPROVED', 'IN_PRODUCTION', 'READY', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."inventory_movement_type" AS ENUM('IN', 'OUT', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('WALK_IN', 'PRE_ORDER', 'CUSTOM_CAKE');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('CASH', 'QRIS', 'BANK_TRANSFER', 'E_WALLET', 'CARD');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PAID', 'REFUNDED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."purchase_order_status" AS ENUM('DRAFT', 'SUBMITTED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "custom_cake_requests" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"sales_order_item_id" bigserial NOT NULL,
	"customer_id" bigserial NOT NULL,
	"occasion" text,
	"cake_size_label" text,
	"servings_estimate" integer,
	"flavor" text,
	"filling" text,
	"frosting" text,
	"design_notes" text,
	"inscription_text" text,
	"reference_image_url" text,
	"requested_date" date NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"status" "custom_cake_status" DEFAULT 'DRAFT' NOT NULL,
	"quoted_price" numeric(14, 2),
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "custom_cake_requests_sales_order_item_id_unique" UNIQUE("sales_order_item_id")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"email" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_phone_unique" UNIQUE("phone"),
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ingredient_stock_movements" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ingredient_id" bigserial NOT NULL,
	"unit_id" bigserial NOT NULL,
	"movement_type" "inventory_movement_type" NOT NULL,
	"quantity" numeric(14, 4) NOT NULL,
	"movement_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reference_type" text,
	"reference_id" bigserial,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredient_unit_map" (
	"ingredient_id" bigserial NOT NULL,
	"unit_id" bigserial NOT NULL,
	"to_base_multiplier" numeric(18, 8) NOT NULL,
	"is_purchase_unit" boolean DEFAULT false NOT NULL,
	"is_recipe_unit" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ingredient_unit_map_ingredient_id_unit_id_pk" PRIMARY KEY("ingredient_id","unit_id")
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"base_unit_id" bigserial NOT NULL,
	"reorder_level_base_qty" numeric(14, 4) DEFAULT '0' NOT NULL,
	"preferred_supplier_id" bigserial,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ingredients_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "measurement_units" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"unit_type" text NOT NULL,
	"is_base_unit" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "measurement_units_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"sales_order_id" bigserial NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"paid_at" timestamp with time zone,
	"reference_number" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "product_recipe_ingredients" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_id" bigserial NOT NULL,
	"ingredient_id" bigserial NOT NULL,
	"unit_id" bigserial NOT NULL,
	"quantity_per_product" numeric(14, 4) NOT NULL,
	"wastage_percent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	CONSTRAINT "product_recipe_ingredients_product_id_ingredient_id_unique" UNIQUE("product_id","ingredient_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category_id" bigserial NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"size_label" text,
	"image_path" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_customizable" boolean DEFAULT false NOT NULL,
	"is_preorder_only" boolean DEFAULT false NOT NULL,
	"default_lead_time_days" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"purchase_order_id" bigserial NOT NULL,
	"ingredient_id" bigserial NOT NULL,
	"unit_id" bigserial NOT NULL,
	"quantity" numeric(14, 4) NOT NULL,
	"unit_cost" numeric(14, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"po_number" text NOT NULL,
	"supplier_id" bigserial NOT NULL,
	"status" "purchase_order_status" DEFAULT 'DRAFT' NOT NULL,
	"ordered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expected_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_orders_po_number_unique" UNIQUE("po_number")
);
--> statement-breakpoint
CREATE TABLE "sales_order_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"sales_order_id" bigserial NOT NULL,
	"product_id" bigserial,
	"item_name_snapshot" text NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"unit_price" numeric(14, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"customer_id" bigserial,
	"order_type" "order_type" NOT NULL,
	"status" "order_status" DEFAULT 'DRAFT' NOT NULL,
	"ordered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"scheduled_fulfillment_at" timestamp with time zone,
	"subtotal_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"phone" text,
	"email" text,
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_cake_requests" ADD CONSTRAINT "custom_cake_requests_sales_order_item_id_sales_order_items_id_fk" FOREIGN KEY ("sales_order_item_id") REFERENCES "public"."sales_order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_cake_requests" ADD CONSTRAINT "custom_cake_requests_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_stock_movements" ADD CONSTRAINT "ingredient_stock_movements_ingredient_id_unit_id_ingredient_unit_map_ingredient_id_unit_id_fk" FOREIGN KEY ("ingredient_id","unit_id") REFERENCES "public"."ingredient_unit_map"("ingredient_id","unit_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_unit_map" ADD CONSTRAINT "ingredient_unit_map_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_unit_map" ADD CONSTRAINT "ingredient_unit_map_unit_id_measurement_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."measurement_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_base_unit_id_measurement_units_id_fk" FOREIGN KEY ("base_unit_id") REFERENCES "public"."measurement_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_preferred_supplier_id_suppliers_id_fk" FOREIGN KEY ("preferred_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recipe_ingredients" ADD CONSTRAINT "product_recipe_ingredients_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recipe_ingredients" ADD CONSTRAINT "product_recipe_ingredients_ingredient_id_unit_id_ingredient_unit_map_ingredient_id_unit_id_fk" FOREIGN KEY ("ingredient_id","unit_id") REFERENCES "public"."ingredient_unit_map"("ingredient_id","unit_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_ingredient_id_unit_id_ingredient_unit_map_ingredient_id_unit_id_fk" FOREIGN KEY ("ingredient_id","unit_id") REFERENCES "public"."ingredient_unit_map"("ingredient_id","unit_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;