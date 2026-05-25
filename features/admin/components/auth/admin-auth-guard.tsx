"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthPage = pathname?.includes("/auth/");

    useEffect(() => {
        if (isAuthPage) {
            setIsLoading(false);
            return;
        }

        // For protected pages, check token
        const token = localStorage.getItem("admin_token");
        
        if (token) {
            setIsAuthenticated(true);
            setIsLoading(false);
        } else {
            // Redirect to login
            router.replace("/login");
        }
    }, [router, isAuthPage]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Allow render for auth pages and authenticated users
    if (isAuthPage || isAuthenticated) {
        return <>{children}</>;
    }

    // Should not reach here, but return null as fallback
    return null;
}
