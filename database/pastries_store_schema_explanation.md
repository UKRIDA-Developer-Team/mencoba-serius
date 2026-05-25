# Pastries Store PostgreSQL Schema Explanation

This schema is designed for a pastries business with a strong focus on **ingredient inventory management with multiple units**, while still supporting **POS sales**, **pre-orders**, and **custom cake workflows**.

## 1) `measurement_units`
Stores all measurement units used across inventory and recipes.

- `id`: Primary key.
- `code`: Short unit code (example: `g`, `kg`, `ml`, `pcs`).
- `name`: Display name of the unit.
- `unit_type`: Unit group (`mass`, `volume`, `count`, `package`).
- `is_base_unit`: Marks base units used as stock-normalization targets.
- `created_at`: Creation timestamp.

## 2) `suppliers`
Stores ingredient supplier data.

- `id`: Primary key.
- `name`: Supplier company name.
- `contact_name`: Main contact person.
- `phone`: Supplier phone.
- `email`: Supplier email.
- `address`: Supplier address details.
- `created_at`: Creation timestamp.

## 3) `customers`
Stores customer profiles for POS, pre-order, and custom cake orders.

- `id`: Primary key.
- `full_name`: Customer full name.
- `phone`: Customer phone (unique when provided).
- `email`: Customer email (unique when provided).
- `notes`: Internal note about preferences.
- `created_at`: Creation timestamp.

## 4) `product_categories`
Category list for pastry products.

- `id`: Primary key.
- `name`: Category name (unique).
- `description`: Category description.
- `created_at`: Creation timestamp.

## 5) `products`
Master list of products sold by the pastries store.

- `id`: Primary key.
- `slug`: URL/business identifier (unique).
- `name`: Product name.
- `description`: Product description.
- `category_id`: FK to `product_categories`.
- `base_price`: Standard selling price.
- `size_label`: Size text (example: `20 cm`).
- `image_path`: Product image path (seeded from `/public/product/...`).
- `is_active`: Enables/disables sale availability.
- `is_customizable`: Marks product as customizable.
- `is_preorder_only`: Marks product as pre-order only.
- `default_lead_time_days`: Suggested lead time in days.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

## 6) `ingredients`
Master ingredient data with normalized base unit and reorder level.

- `id`: Primary key.
- `sku`: Unique ingredient code.
- `name`: Ingredient name.
- `description`: Ingredient notes.
- `base_unit_id`: FK to `measurement_units`; canonical stock unit.
- `reorder_level_base_qty`: Reorder threshold in base unit quantity.
- `preferred_supplier_id`: FK to `suppliers`.
- `is_active`: Ingredient active flag.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

## 7) `ingredient_unit_map`
Core table for multi-unit inventory handling (per-ingredient conversion map).

- `ingredient_id`: FK to `ingredients`.
- `unit_id`: FK to `measurement_units`.
- `to_base_multiplier`: Conversion factor to ingredient base unit.
  - Formula: `base_qty = qty * to_base_multiplier`
  - Example: Egg tray can be `30` pcs.
- `is_purchase_unit`: Marks unit used for purchasing.
- `is_recipe_unit`: Marks unit used for production recipes.

Primary key is `(ingredient_id, unit_id)` so each ingredient/unit pair is defined once.

## 8) `product_recipe_ingredients`
Bill of materials/recipe table mapping product to required ingredients.

- `id`: Primary key.
- `product_id`: FK to `products`.
- `ingredient_id`: Ingredient used.
- `unit_id`: Unit used in recipe.
- `quantity_per_product`: Quantity needed for one product.
- `wastage_percent`: Expected wastage percentage.
- `notes`: Recipe notes.

`(ingredient_id, unit_id)` is constrained to `ingredient_unit_map` to ensure valid unit usage.

## 9) `purchase_orders`
Header table for ingredient procurement.

- `id`: Primary key.
- `po_number`: Unique purchase order number.
- `supplier_id`: FK to `suppliers`.
- `status`: Procurement lifecycle status.
- `ordered_at`: PO creation/order datetime.
- `expected_at`: Expected arrival datetime.
- `received_at`: Final receive datetime.
- `notes`: Additional notes.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

## 10) `purchase_order_items`
Line items for each purchase order.

- `id`: Primary key.
- `purchase_order_id`: FK to `purchase_orders`.
- `ingredient_id`: Purchased ingredient.
- `unit_id`: Purchase unit used.
- `quantity`: Ordered quantity.
- `unit_cost`: Cost per unit.
- `notes`: Item-level notes.

`(ingredient_id, unit_id)` is constrained to `ingredient_unit_map`.

## 11) `ingredient_stock_movements`
Inventory ledger table for stock-in, stock-out, and adjustments.

- `id`: Primary key.
- `ingredient_id`: Ingredient moved.
- `unit_id`: Transaction unit.
- `movement_type`: `IN`, `OUT`, or `ADJUSTMENT`.
- `quantity`: Movement quantity in `unit_id`.
- `movement_at`: Datetime of movement.
- `reference_type`: Source type (`purchase_order`, `production_batch`, etc.).
- `reference_id`: Linked source ID.
- `notes`: Free text note.
- `created_at`: Creation timestamp.

This is the source-of-truth table for inventory history/audit.

## 12) `ingredient_current_stock` (VIEW)
Calculated view for current stock in each ingredient’s base unit.

- `ingredient_id`: Ingredient ID.
- `sku`: Ingredient code.
- `ingredient_name`: Ingredient name.
- `base_unit_code`: Canonical unit code.
- `current_stock_base_qty`: Net stock after conversion and movement signs.
- `reorder_level_base_qty`: Ingredient reorder threshold.
- `is_below_reorder_level`: `true` when stock is below threshold.

This view enables low-stock monitoring regardless of mixed incoming/outgoing units.

## 13) `sales_orders`
Order header table for POS, pre-order, and custom cake orders.

- `id`: Primary key.
- `order_number`: Unique order number.
- `customer_id`: FK to `customers` (nullable for anonymous walk-in).
- `order_type`: `WALK_IN`, `PRE_ORDER`, `CUSTOM_CAKE`.
- `status`: Order lifecycle status.
- `ordered_at`: Order creation datetime.
- `scheduled_fulfillment_at`: Pickup/delivery schedule (important for pre-orders).
- `subtotal_amount`: Subtotal before discount/tax.
- `discount_amount`: Discount total.
- `tax_amount`: Tax total.
- `total_amount`: Final total.
- `notes`: Operational note.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

## 14) `sales_order_items`
Line item details for each order.

- `id`: Primary key.
- `sales_order_id`: FK to `sales_orders`.
- `product_id`: FK to `products` (nullable for custom item).
- `item_name_snapshot`: Item name at transaction time (audit-safe).
- `quantity`: Ordered quantity.
- `unit_price`: Price per unit.
- `line_total`: Stored generated value (`quantity * unit_price`).
- `notes`: Item-level notes.

## 15) `custom_cake_requests`
Custom cake specification and approval workflow.

- `id`: Primary key.
- `sales_order_item_id`: FK to custom line item (unique, 1:1).
- `customer_id`: FK to `customers`.
- `occasion`: Event type (birthday/wedding/etc).
- `cake_size_label`: Requested size text.
- `servings_estimate`: Estimated serving count.
- `flavor`: Main flavor.
- `filling`: Filling preference.
- `frosting`: Frosting preference.
- `design_notes`: Design instructions.
- `inscription_text`: Cake text request.
- `reference_image_url`: Inspiration/reference image URL.
- `requested_date`: Date request was made.
- `due_at`: Target completion datetime.
- `status`: Custom cake workflow status.
- `quoted_price`: Approved quote amount.
- `approved_at`: Approval datetime.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

## 16) `payments`
Payment records for each sales order (supports partial/down payment).

- `id`: Primary key.
- `sales_order_id`: FK to `sales_orders`.
- `method`: Payment method.
- `status`: Payment status.
- `amount`: Paid amount.
- `paid_at`: Payment datetime.
- `reference_number`: External/internal payment reference.
- `notes`: Payment note.
- `created_at`: Creation timestamp.

---

## Seeder Coverage Summary
The SQL script also inserts seed data for:

- Measurement units and suppliers.
- Customers.
- Product categories and all product images from `public/product` paths.
- Ingredients + per-ingredient unit conversions (multi-unit setup).
- Recipe samples.
- Purchase orders + stock movements with mixed units (`kg`, `tray`, `l`, `g`, `pcs`).
- Sales orders for walk-in, pre-order, and custom cake.
- Custom cake request details and payment records.
