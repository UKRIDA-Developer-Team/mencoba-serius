import AdminLayoutShell from "@/features/admin/components/layout/admin-layout-shell";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
