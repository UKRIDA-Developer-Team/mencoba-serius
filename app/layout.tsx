import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { jakartaSans } from "@/lib/fonts";
import HeaderSection from "@/components/layouts/guests/HeaderSection";
import BottomNavbar from "@/components/layouts/guests/BottomNavbar";
import Footer from "@/components/layouts/guests/Footer";

export const metadata: Metadata = {
  title: "Chef On Pointe",
  description: "Orang orang stress gini nih",
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
        <Footer />
      </body>
    </html>
  );
}