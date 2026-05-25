import type { FormField } from "@/features/admin/types/forms";

export const INGREDIENT_FORM_SCHEMA: FormField[] = [
    {
        name: "name",
        label: "Ingredient Name",
        type: "text",
        placeholder: "New ingredient",
        required: true,
    },
    {
        name: "sku",
        label: "SKU",
        type: "text",
        placeholder: "SKU",
        required: true,
    },
    {
        name: "reorder",
        label: "Reorder Level",
        type: "number",
        placeholder: "Reorder level",
        required: true,
    },
];

export const PRODUCT_FORM_SCHEMA: FormField[] = [
    {
        name: "name",
        label: "Product Name",
        type: "text",
        placeholder: "New product",
        required: true,
    },
    {
        name: "slug",
        label: "Slug",
        type: "text",
        placeholder: "Product slug",
        required: true,
    },
    {
        name: "price",
        label: "Price",
        type: "number",
        placeholder: "Price",
        required: true,
    },
    {
        name: "category",
        label: "Category",
        type: "select",
        placeholder: "Select category",
        required: true,
        options: [
            { value: "Birthday", label: "Birthday" },
            { value: "Wedding", label: "Wedding" },
            { value: "Anniversary", label: "Anniversary" },
            { value: "Special", label: "Special" },
        ],
    },
];
