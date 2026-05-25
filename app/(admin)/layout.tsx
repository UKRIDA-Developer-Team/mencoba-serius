import AdminLayoutShell from "@/features/admin/components/layout/admin-layout-shell";
import { AdminAuthGuard } from "@/features/admin/components/auth/admin-auth-guard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminAuthGuard>
            <AdminLayoutShell>{children}</AdminLayoutShell>
        </AdminAuthGuard>
    );
}
