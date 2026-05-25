import type {
    AdminRole,
    SidebarGroupItem,
    SidebarItem,
    SidebarLinkItem,
} from "@/features/admin/types/navigation";

function hasRoleAccess(itemRoles: AdminRole[] | undefined, currentRole?: AdminRole) {
    if (!itemRoles?.length) return true;
    if (!currentRole) return false;
    return itemRoles.includes(currentRole);
}

export function isLinkActive(pathname: string, item: SidebarLinkItem): boolean {
    if (item.activeMatch === "exact") {
        return pathname === item.href;
    }

    return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function isSidebarItemActive(pathname: string, item: SidebarItem): boolean {
    if (item.type === "link") {
        return isLinkActive(pathname, item);
    }

    return item.children.some((child) => isLinkActive(pathname, child));
}

export function filterSidebarItemsByRole(items: SidebarItem[], currentRole?: AdminRole): SidebarItem[] {
    return items
        .map((item) => {
            if (!hasRoleAccess(item.roles, currentRole)) return null;

            if (item.type === "group") {
                const children = item.children.filter((child) => hasRoleAccess(child.roles, currentRole));
                if (!children.length) return null;
                return { ...item, children } as SidebarGroupItem;
            }

            return item;
        })
        .filter((item): item is SidebarItem => item !== null);
}
