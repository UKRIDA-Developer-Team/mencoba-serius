"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navigationItems = [
    { label: "Home", link: "/", icon: Home },
    { label: "Catalog", link: "/catalog", icon: BookOpen },
];

export default function BottomNavbar() {
    const pathname = usePathname();
    const [isFooterVisible, setIsFooterVisible] = useState(false);

    useEffect(() => {
        const footer = document.querySelector("footer");
        if (!footer) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsFooterVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );

        observer.observe(footer);
        return () => observer.disconnect();
    }, []);

    return (
        <nav
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden transition-transform duration-300",
                isFooterVisible ? "translate-y-full" : "translate-y-0"
            )}
        >
            <div className="flex items-center justify-around h-16">
                {navigationItems.map(({ label, link, icon: Icon }) => {
                    const isActive = pathname === link;
                    return (
                        <Link
                            key={link}
                            href={link}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-full h-full text-xs transition-all duration-150",
                                isActive
                                    ? "text-primary font-semibold opacity-100"
                                    : "text-foreground font-normal opacity-55"
                            )}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}