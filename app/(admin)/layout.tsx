import type { Metadata } from "next";
import AdminLayoutShell from "@/features/admin/components/layout/admin-layout-shell";
import { AdminAuthGuard } from "@/features/admin/components/auth/admin-auth-guard";

export const metadata: Metadata = {
    title: "Admin — Chef On Pointe",
    description: "Admin control center for Chef On Pointe.",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminAuthGuard>
            {children}
        </AdminAuthGuard>
    );
}
