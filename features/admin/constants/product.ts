export const PRODUCT_CATEGORIES = ["Birthday", "Wedding", "Anniversary", "Special"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
