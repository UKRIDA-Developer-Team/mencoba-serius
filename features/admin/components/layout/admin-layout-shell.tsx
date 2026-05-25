"use client";

import AdminHeader from "@/features/admin/components/header/admin-header";
import AdminSidebar from "@/features/admin/components/sidebar/admin-sidebar";
import { AdminSidebarProvider, useAdminSidebarContext } from "@/features/admin/providers/admin-sidebar-provider";
import { cn } from "@/lib/utils";

function MainContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useAdminSidebarContext();

    return (
        <main
            className={cn(
                "pt-14 h-screen overflow-y-auto transition-all duration-300 ease-in-out",
                isCollapsed ? "md:pl-16" : "md:pl-56",
                "w-full"
            )}
        >
            {children}
        </main>
    );
}

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
    return (
        <AdminSidebarProvider>
            <>
                <AdminSidebar />
                <AdminHeader />
                <MainContent>{children}</MainContent>
            </>
        </AdminSidebarProvider>
    );
}
