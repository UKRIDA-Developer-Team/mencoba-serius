import { LayoutDashboard, ShoppingBag, ShoppingCart, PackageOpen, BookCopy, Carrot } from "lucide-react";
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
    type: "link",
    id: "products",
    label: "Products",
    icon: ShoppingBag,
    href: ADMIN_ROUTES.productsItem,
    activeMatch: "prefix",
  },
  {
    type: "group",
    id: "inventory",
    label: "Inventory",
    icon: PackageOpen,
    defaultOpen: true,
    children: [
      {
        type: "link",
        id: "inventory-ingredients",
        label: "Ingredients",
        icon: Carrot,
        href: ADMIN_ROUTES.inventoryIngredients,
      },
      {
        type: "link",
        id: "inventory-stock-opname",
        label: "Stock Opname",
        icon: BookCopy,
        href: ADMIN_ROUTES.inventoryStockOpname,
      },
    ],
  },
];
