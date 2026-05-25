import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { jakartaSans } from "@/lib/fonts";
import { CartProvider } from "@/features/guest/components/cart/CartProvider";

export const metadata: Metadata = {
  title: "Chef On Pointe",
  description: "Artisan pastries, crafted with love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakartaSans.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
