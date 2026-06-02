CREATE TABLE "product_variants" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_id" bigserial NOT NULL,
	"label" text NOT NULL,
	"price_override" numeric(12, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;