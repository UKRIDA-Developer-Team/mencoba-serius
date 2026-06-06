import type { Metadata } from "next";
import HeroSection from "@/features/guest/components/layouts/Hero";
import Marquee from "@/components/ui/marquee";
import Products from "@/features/guest/components/layouts/Products";
import Recomendation from "@/features/guest/components/layouts/Recomendation";
import Testimonial from "@/features/guest/components/layouts/Testimonial";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Beranda - Kue Custom & Pastry Artisan | Chef On Pointe",
  description: "Pesan kue custom dan pastry artisan untuk ulang tahun, pernikahan, anniversary, dan acara spesial Anda. Dibuat dengan bahan berkualitas tinggi.",
};

export default function Home() {
  return (
    <div className="flex flex-col w-full mx-auto overflow-x-hidden">
      <HeroSection />
      <Marquee />
      <Recomendation />
      <Products />
      <Testimonial />
    </div>
  );
}