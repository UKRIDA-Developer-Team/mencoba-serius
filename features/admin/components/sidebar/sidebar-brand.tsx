"use client";

import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarBrandProps = {
    isCollapsed: boolean;
    isMobile: boolean;
    onToggleCollapsed: () => void;
};

export function SidebarBrand({ isCollapsed, isMobile, onToggleCollapsed }: SidebarBrandProps) {
    return (
        <div
            className={cn(
                "flex h-14 items-center border-b border-border px-3 gap-2 shrink-0",
                isCollapsed && !isMobile ? "justify-center" : "justify-between"
            )}
        >
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={isCollapsed && !isMobile ? onToggleCollapsed : undefined}
                    className={isCollapsed && !isMobile ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                    title={isCollapsed && !isMobile ? "Expand sidebar" : undefined}
                >
                    <div className="flex size-8 items-center justify-center text-primary-foreground shrink-0 overflow-hidden">
                        <Image
                            src="/favicon.png"
                            alt="Chef on Pointe"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </button>
                {(!isCollapsed || isMobile) && (
                    <span className="truncate text-sm font-semibold text-primary select-none">
                        Chef on Pointe
                    </span>
                )}
            </div>

            {!isMobile && !isCollapsed && (
                <button
                    type="button"
                    onClick={onToggleCollapsed}
                    aria-label="Collapse sidebar"
                    className="flex size-7 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ChevronLeft className="size-4" />
                </button>
            )}
        </div>
    );
}
