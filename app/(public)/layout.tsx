import React from "react";
import HeaderSection from "@/features/guest/components/layouts/HeaderSection";
import BottomNavbar from "@/features/guest/components/layouts/BottomNavbar";
import Footer from "@/features/guest/components/layouts/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderSection />
      <main className="flex-1 pt-16 pb-16 md:pb-0">
        {children}
      </main>
      <BottomNavbar />
      <Footer />
    </>
  );
}
