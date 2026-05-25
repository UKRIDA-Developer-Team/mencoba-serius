"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Home, BookOpen, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/public/favicon.png";
import { useCart } from "@/features/guest/components/cart/CartProvider";

const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Catalog", href: "/catalog", icon: BookOpen },
    { label: "Admin", href: "/admin", icon: Shield },
];

export default function HeaderSection() {
    const pathname = usePathname();
    const { totalItems } = useCart();

    const isActivePath = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
            <div className="relative flex items-center h-16 px-4 sm:px-6 md:px-10 max-w-screen-xl mx-auto w-full">

                <Link href="/">
                    <Image src={Logo} alt="Logo Chef On Pointe" width={50} />
                </Link>

                <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:left-auto md:translate-x-0 md:ml-4">
                    <span className="text-base font-semibold tracking-wide text-foreground md:text-lg">
                        Chef On Pointe
                    </span>
                </Link>

                <div className="ml-auto flex items-center gap-1">

                    <nav className="hidden md:flex items-center gap-1 mr-2">
                        {navLinks.map(({ label, href }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                    isActivePath(href) ? "text-primary font-semibold" : "text-foreground"
                                )}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    <Link href="/cart" aria-label="Shopping cart" className="relative flex items-center justify-center w-10 h-10">
                        <ShoppingCart size={22} strokeWidth={1.8} className="text-foreground" />
                        {totalItems > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                </div>
            </div>
        </header>
    );
}
