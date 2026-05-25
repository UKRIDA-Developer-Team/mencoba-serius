import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { jakartaSans } from "@/lib/fonts";
import { CartProvider } from "@/features/guest/components/cart/CartProvider";

export const metadata: Metadata = {
  title: "Chef On Pointe - Kue Custom & Pastry Artisan",
  description: "Kue custom dan pastry artisan dibuat dengan cinta untuk perayaan Anda. Pesan kue ulang tahun, pernikahan, dan acara spesial lainnya.",
  keywords: "kue custom, pastry, kue ulang tahun, kue pernikahan, kue custom jakarta",
  authors: [{ name: "Chef On Pointe" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    title: "Chef On Pointe - Kue Custom & Pastry Artisan",
    description: "Kue custom dan pastry artisan dibuat dengan cinta untuk perayaan Anda.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakartaSans.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
