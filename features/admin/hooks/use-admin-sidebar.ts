"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ADMIN_SIDEBAR_CONFIG } from "@/features/admin/constants/sidebar-config";
import type { AdminRole } from "@/features/admin/types/navigation";
import {
    filterSidebarItemsByRole,
    isSidebarItemActive,
} from "@/features/admin/utils/sidebar";

export function useAdminSidebar(currentRole?: AdminRole) {
    const pathname = usePathname();

    const items = useMemo(
        () => filterSidebarItemsByRole(ADMIN_SIDEBAR_CONFIG, currentRole),
        [currentRole]
    );

    return {
        pathname,
        items,
        isItemActive: (item: (typeof items)[number]) => isSidebarItemActive(pathname, item),
    };
}
