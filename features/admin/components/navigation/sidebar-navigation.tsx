"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { SidebarGroupItem, SidebarLinkItem } from "@/features/admin/types/navigation";
import { isLinkActive } from "@/features/admin/utils/sidebar";
import { cn } from "@/lib/utils";

type AdminSidebarNavProps = {
    pathname: string;
    isCollapsed: boolean;
    items: Array<SidebarLinkItem | SidebarGroupItem>;
    closeMobile: () => void;
};

function SidebarLink({
    pathname,
    item,
    isCollapsed,
    closeMobile,
}: {
    pathname: string;
    item: SidebarLinkItem;
    isCollapsed: boolean;
    closeMobile: () => void;
}) {
    const Icon = item.icon;
    const isActive = isLinkActive(pathname, item);

    return (
        <Link
            href={item.href}
            onClick={closeMobile}
            className={cn(
                "flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors",
                isCollapsed ? "justify-center px-2" : "px-3",
                isActive
                    ? "text-primary"
                    : "text-foreground/65 hover:bg-muted hover:text-foreground"
            )}
            title={isCollapsed ? item.label : undefined}
        >
            {Icon ? <Icon className="size-4 shrink-0" /> : null}
            {!isCollapsed && <span>{item.label}</span>}
        </Link>
    );
}

export default function AdminSidebarNav({
    pathname,
    isCollapsed,
    items,
    closeMobile,
}: AdminSidebarNavProps) {
    return (
        <nav className="flex-1 px-2 py-3 space-y-1">
            {items.map((item) => {
                if (item.type === "link") {
                    return (
                        <SidebarLink
                            key={item.id}
                            pathname={pathname}
                            item={item}
                            isCollapsed={isCollapsed}
                            closeMobile={closeMobile}
                        />
                    );
                }

                const GroupIcon = item.icon;
                const hasActiveChild = item.children.some((child) => isLinkActive(pathname, child));

                if (isCollapsed) {
                    return (
                        <div key={item.id} className="space-y-1">
                            {item.children.map((child) => (
                                <SidebarLink
                                    key={child.id}
                                    pathname={pathname}
                                    item={child}
                                    isCollapsed={isCollapsed}
                                    closeMobile={closeMobile}
                                />
                            ))}
                        </div>
                    );
                }

                return (
                    <details
                        key={item.id}
                        open={item.defaultOpen || hasActiveChild}
                        className="group open:border-border/60 rounded-lg"
                    >
                        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm text-foreground/75 hover:bg-muted rounded-lg">
                            <span className="flex items-center gap-3">
                                {GroupIcon ? <GroupIcon className="size-4 shrink-0" /> : null}
                                {item.label}
                            </span>
                            {item.collapsible !== false && (
                                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                            )}
                        </summary>
                        <div className="px-2 pb-2 space-y-1">
                            {item.children.map((child) => (
                                <SidebarLink
                                    key={child.id}
                                    pathname={pathname}
                                    item={child}
                                    isCollapsed={false}
                                    closeMobile={closeMobile}
                                />
                            ))}
                        </div>
                    </details>
                );
            })}
        </nav>
    );
}
