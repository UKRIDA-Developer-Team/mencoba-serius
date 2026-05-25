import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";
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
        id: "ingredients",
        label: "Ingredients",
        icon: Package,
        href: ADMIN_ROUTES.ingredients,
        roles: ["super_admin", "manager"],
    },
    {
        type: "link",
        id: "products",
        label: "Products",
        icon: ShoppingBag,
        href: ADMIN_ROUTES.products,
    },
];
