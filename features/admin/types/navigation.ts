import type { LucideIcon } from "lucide-react";

export type AdminRole = "super_admin" | "manager" | "staff";

export type ActiveMatchMode = "exact" | "prefix";

export type SidebarBaseItem = {
    id: string;
    label: string;
    icon?: LucideIcon;
    roles?: AdminRole[];
};

export type SidebarLinkItem = SidebarBaseItem & {
    type: "link";
    href: string;
    activeMatch?: ActiveMatchMode;
};

export type SidebarGroupItem = SidebarBaseItem & {
    type: "group";
    collapsible?: boolean;
    defaultOpen?: boolean;
    children: SidebarLinkItem[];
};

export type SidebarItem = SidebarLinkItem | SidebarGroupItem;
