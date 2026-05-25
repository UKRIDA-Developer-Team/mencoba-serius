import HeroSection from "@/features/guest/components/layouts/Hero";
import Marquee from "@/components/ui/marquee";
import Products from "@/features/guest/components/layouts/Products";
import Recomendation from "@/features/guest/components/layouts/Recomendation";

export default function Home() {
  return (
    <div className="flex flex-col w-full mx-auto overflow-x-hidden">
      <HeroSection />
      <Marquee />
      <Recomendation />
      <Products />
    </div>
  );
}