"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Don't require auth for login page
    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        if (isLoginPage) {
            setIsLoading(false);
            return;
        }

        // Check if user is authenticated
        const token = localStorage.getItem("admin_token");
        
        if (token) {
            setIsAuthenticated(true);
            setIsLoading(false);
        } else {
            // Redirect to login
            router.push("/admin/login");
        }
    }, [router, isLoginPage]);

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

    if (!isLoginPage && !isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
