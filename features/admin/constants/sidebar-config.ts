import { LayoutDashboard, ShoppingBag, ShoppingCart, Warehouse } from "lucide-react";
import { ADMIN_ROUTES } from "@/features/admin/constants/routes";
import type { SidebarItem } from "@/features/admin/types/navigation";

export const SIDEBAR_WIDTH = {
  expanded: "w-56",
  collapsed: "w-16",
} as const;

export const ADMIN_SIDEBAR_CONFIG: SidebarItem[] = [
  {
    type: "link",
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: ADMIN_ROUTES.dashboard,
    activeMatch: "exact",
  },
  {
    type: "link",
    id: "orders",
    label: "Order",
    icon: ShoppingCart,
    href: ADMIN_ROUTES.orders,
  },
  {
    type: "group",
    id: "products",
    label: "Products",
    icon: ShoppingBag,
    defaultOpen: true,
    children: [
      {
        type: "link",
        id: "products-item",
        label: "Item",
        href: ADMIN_ROUTES.productsItem,
        activeMatch: "exact",
      },
      {
        type: "link",
        id: "products-recipe",
        label: "Recipe",
        href: ADMIN_ROUTES.productsRecipe,
      },
    ],
  },
  {
    type: "group",
    id: "inventory",
    label: "Inventory",
    icon: Warehouse,
    defaultOpen: true,
    children: [
      {
        type: "link",
        id: "inventory-ingredients",
        label: "Ingredients",
        href: ADMIN_ROUTES.inventoryIngredients,
      },
      {
        type: "link",
        id: "inventory-stock-opname",
        label: "Stock Opname",
        href: ADMIN_ROUTES.inventoryStockOpname,
      },
    ],
  },
];
