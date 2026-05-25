"use client";

import { Menu } from "lucide-react";
import { useAdminSidebarContext } from "@/features/admin/providers/admin-sidebar-provider";
import { cn } from "@/lib/utils";

export default function AdminHeader() {
    const { openMobile, isCollapsed } = useAdminSidebarContext();

    return (
        <header
            className={cn(
                "fixed top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6 transition-all duration-300 ease-in-out",
                "left-0 right-0 md:left-56 md:right-0",
                isCollapsed && "md:left-16"
            )}
        >
            <button
                type="button"
                onClick={openMobile}
                aria-label="Open sidebar"
                className="inline-flex size-8 items-center justify-center rounded-md border border-border text-foreground/70 hover:bg-muted md:hidden"
            >
                <Menu className="size-4" />
            </button>
            <p className="text-sm font-medium text-foreground/80">Admin</p>
        </header>
    );
}
