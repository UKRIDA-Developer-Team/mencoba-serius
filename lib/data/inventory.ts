export type IngredientStock = {
    id: number;
    sku: string;
    name: string;
    baseUnitCode: "g" | "ml" | "pcs";
    reorderLevelBaseQty: number;
    currentStockBaseQty: number;
    preferredSupplier: string;
    isActive: boolean;
};

export type ProductManagementItem = {
    id: number;
    slug: string;
    name: string;
    category: string;
    basePrice: number;
    sizeLabel: string;
    isCustomizable: boolean;
    isPreorderOnly: boolean;
    isActive: boolean;
};

export const seededIngredientStocks: IngredientStock[] = [
    {
        id: 1,
        sku: "ING-FLOUR",
        name: "All-Purpose Flour",
        baseUnitCode: "g",
        reorderLevelBaseQty: 5000,
        currentStockBaseQty: 9300,
        preferredSupplier: "Nusantara Baking Supply",
        isActive: true,
    },
    {
        id: 2,
        sku: "ING-SUGAR",
        name: "Granulated Sugar",
        baseUnitCode: "g",
        reorderLevelBaseQty: 3000,
        currentStockBaseQty: 5150,
        preferredSupplier: "Nusantara Baking Supply",
        isActive: true,
    },
    {
        id: 3,
        sku: "ING-BUTTER",
        name: "Unsalted Butter",
        baseUnitCode: "g",
        reorderLevelBaseQty: 2000,
        currentStockBaseQty: 0,
        preferredSupplier: "Fresh Dairy Co",
        isActive: true,
    },
    {
        id: 4,
        sku: "ING-EGG",
        name: "Chicken Egg",
        baseUnitCode: "pcs",
        reorderLevelBaseQty: 90,
        currentStockBaseQty: 108,
        preferredSupplier: "Sweet Harvest Farm",
        isActive: true,
    },
    {
        id: 5,
        sku: "ING-MILK",
        name: "Fresh Milk",
        baseUnitCode: "ml",
        reorderLevelBaseQty: 4000,
        currentStockBaseQty: 20000,
        preferredSupplier: "Fresh Dairy Co",
        isActive: true,
    },
    {
        id: 6,
        sku: "ING-COCOA",
        name: "Cocoa Powder",
        baseUnitCode: "g",
        reorderLevelBaseQty: 1000,
        currentStockBaseQty: 0,
        preferredSupplier: "Nusantara Baking Supply",
        isActive: true,
    },
    {
        id: 7,
        sku: "ING-STRAWBERRY",
        name: "Fresh Strawberry",
        baseUnitCode: "g",
        reorderLevelBaseQty: 2000,
        currentStockBaseQty: 0,
        preferredSupplier: "Sweet Harvest Farm",
        isActive: true,
    },
    {
        id: 8,
        sku: "ING-CHEESE",
        name: "Cream Cheese",
        baseUnitCode: "g",
        reorderLevelBaseQty: 1500,
        currentStockBaseQty: 0,
        preferredSupplier: "Fresh Dairy Co",
        isActive: true,
    },
    {
        id: 9,
        sku: "ING-MATCHA",
        name: "Matcha Powder",
        baseUnitCode: "g",
        reorderLevelBaseQty: 500,
        currentStockBaseQty: 0,
        preferredSupplier: "Nusantara Baking Supply",
        isActive: true,
    },
    {
        id: 10,
        sku: "ING-VANILLA",
        name: "Vanilla Extract",
        baseUnitCode: "ml",
        reorderLevelBaseQty: 500,
        currentStockBaseQty: 0,
        preferredSupplier: "Nusantara Baking Supply",
        isActive: true,
    },
];

export const seededProductManagementItems: ProductManagementItem[] = [
    {
        id: 1,
        slug: "chocolate-cake",
        name: "Chocolate Cake",
        category: "Birthday",
        basePrice: 285000,
        sizeLabel: "20 cm",
        isCustomizable: true,
        isPreorderOnly: false,
        isActive: true,
    },
    {
        id: 2,
        slug: "strawberry-shortcake",
        name: "Strawberry Shortcake",
        category: "Birthday",
        basePrice: 320000,
        sizeLabel: "20 cm",
        isCustomizable: true,
        isPreorderOnly: true,
        isActive: true,
    },
    {
        id: 3,
        slug: "red-velvet",
        name: "Red Velvet",
        category: "Anniversary",
        basePrice: 310000,
        sizeLabel: "20 cm",
        isCustomizable: true,
        isPreorderOnly: false,
        isActive: true,
    },
    {
        id: 4,
        slug: "tiramisu",
        name: "Tiramisu",
        category: "Special",
        basePrice: 375000,
        sizeLabel: "22 cm",
        isCustomizable: true,
        isPreorderOnly: true,
        isActive: true,
    },
    {
        id: 5,
        slug: "opera-cake",
        name: "Opera Cake",
        category: "Wedding",
        basePrice: 420000,
        sizeLabel: "24 cm",
        isCustomizable: true,
        isPreorderOnly: true,
        isActive: true,
    },
];

export function isLowStock(item: IngredientStock): boolean {
    return item.currentStockBaseQty <= item.reorderLevelBaseQty;
}

export function lowStockSeverity(item: IngredientStock): "critical" | "warning" | "ok" {
    if (item.currentStockBaseQty === 0) return "critical";
    if (item.currentStockBaseQty <= item.reorderLevelBaseQty) return "warning";
    return "ok";
}
