import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Login — Chef On Pointe",
    description: "Login to Chef On Pointe admin control center.",
};

export default function AdminLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
