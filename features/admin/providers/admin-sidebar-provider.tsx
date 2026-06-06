"use client";

import { createContext, useContext, useMemo, useState } from "react";

type AdminSidebarContextValue = {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    toggleCollapsed: () => void;
    openMobile: () => void;
    closeMobile: () => void;
};

const AdminSidebarContext = createContext<AdminSidebarContextValue | null>(null);

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const value = useMemo<AdminSidebarContextValue>(
        () => ({
            isCollapsed,
            isMobileOpen,
            toggleCollapsed: () => setIsCollapsed((prev) => !prev),
            openMobile: () => setIsMobileOpen(true),
            closeMobile: () => setIsMobileOpen(false),
        }),
        [isCollapsed, isMobileOpen]
    );

    return <AdminSidebarContext.Provider value={value}>{children}</AdminSidebarContext.Provider>;
}

export function useAdminSidebarContext() {
    const context = useContext(AdminSidebarContext);
    if (!context) {
        throw new Error("useAdminSidebarContext must be used within AdminSidebarProvider");
    }
    return context;
}
