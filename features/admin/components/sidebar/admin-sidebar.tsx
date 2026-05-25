"use client";

import { X } from "lucide-react";
import { useAdminSidebar } from "@/features/admin/hooks/use-admin-sidebar";
import { useAdminSidebarContext } from "@/features/admin/providers/admin-sidebar-provider";
import AdminSidebarNav from "@/features/admin/components/navigation/sidebar-navigation";
import { SidebarBrand } from "@/features/admin/components/sidebar/sidebar-brand";
import { SidebarProfile } from "@/features/admin/components/sidebar/sidebar-profile";
import { SIDEBAR_WIDTH } from "@/features/admin/constants/sidebar-config";
import { cn } from "@/lib/utils";

function SidebarPanel({ isMobile = false }: { isMobile?: boolean }) {
    const { pathname, items } = useAdminSidebar();
    const { isCollapsed, toggleCollapsed, closeMobile } = useAdminSidebarContext();

    return (
        <aside
            className={cn(
                "relative flex h-full flex-col border-r border-border bg-card transition-[width] duration-300 ease-in-out",
                isMobile ? "w-64" : isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded
            )}
        >
            {isMobile ? (
                <div
                    className={cn(
                        "flex h-14 items-center border-b border-border px-3 gap-2 shrink-0",
                        "justify-between"
                    )}
                >
                    <span className="truncate text-sm font-semibold text-primary select-none">
                        Chef on Pointe
                    </span>
                    <button
                        type="button"
                        onClick={closeMobile}
                        aria-label="Close sidebar"
                        className="flex size-7 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            ) : (
                <SidebarBrand
                    isCollapsed={isCollapsed}
                    isMobile={isMobile}
                    onToggleCollapsed={toggleCollapsed}
                />
            )}

            <div className="flex-1 overflow-y-auto">
                <AdminSidebarNav
                    pathname={pathname}
                    isCollapsed={isCollapsed && !isMobile}
                    items={items}
                    closeMobile={closeMobile}
                />
            </div>

            <SidebarProfile isCollapsed={isCollapsed} isMobile={isMobile} />
        </aside>
    );
}

export default function AdminSidebar() {
    const { isMobileOpen, closeMobile } = useAdminSidebarContext();

    return (
        <>
            <div className="hidden md:block h-svh fixed left-0 top-0 z-30">
                <SidebarPanel />
            </div>

            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <button
                        type="button"
                        aria-label="Close sidebar overlay"
                        className="absolute inset-0 bg-transparent"
                        onClick={closeMobile}
                    />
                    <div className="relative h-full w-64">
                        <SidebarPanel isMobile />
                    </div>
                </div>
            )}
        </>
    );
}
