export const dynamic = "force-dynamic";

import AdminSidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}
