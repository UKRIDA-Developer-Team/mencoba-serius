export type FormFieldType = "text" | "number" | "email" | "select";

export type FormField = {
    name: string;
    label: string;
    type: FormFieldType;
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
};

export type IngredientForm = { name: string; sku: string; reorder: string };
export type ProductForm = { name: string; slug: string; price: string; category: string };
