"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarProfileProps = {
    isCollapsed: boolean;
    isMobile: boolean;
};

export function SidebarProfile({ isCollapsed, isMobile }: SidebarProfileProps) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_username");
        router.push("/admin/login");
        router.refresh();
    };
    return (
        <div className="shrink-0 border-t border-border bg-card">
            <div className={cn("p-3", isCollapsed && !isMobile ? "px-2" : "")}>
                <div
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-2 py-2",
                        isCollapsed && !isMobile ? "justify-center" : ""
                    )}
                >
                    <div
                        className={cn(
                            "flex size-8 items-center justify-center rounded-lg text-primary shrink-0 border",
                        )}
                    >
                        <User className="size-4" />
                    </div>
                    {(!isCollapsed || isMobile) && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground select-none">Admin</p>
                            <p className="truncate text-xs text-foreground/60 select-none">Administrator</p>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className={cn(
                        "mt-2 flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-foreground/65 transition-colors hover:bg-muted hover:text-foreground",
                        isCollapsed && !isMobile ? "justify-center" : "w-full"
                    )}
                >
                    <div className={cn("flex size-8 items-center justify-center rounded-lg text-foreground/65 shrink-0 border")}>
                        <LogOut className="size-4" />
                    </div>
                    {(!isCollapsed || isMobile) && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}
