import type { Metadata } from "next";
import "./globals.css";
import { jakartaSans } from "@/lib/fonts";
import HeaderSection from "@/components/layouts/guests/HeaderSection";
import BottomNavbar from "@/components/layouts/guests/BottomNavbar";

export const metadata: Metadata = {
  title: "Chef On Pointe",
  description: "Buatan kelompok mencoba serius yang kebut semalam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <HeaderSection />
        <main className="flex-1 pt-16 pb-16 md:pb-0">
          {children}
        </main>
        <BottomNavbar />
      </body>
    </html>
  );
}