import HeroSection from "@/components/layouts/guests/Hero";
import Marquee from "@/components/ui/marquee";
import Products from "@/components/layouts/guests/Products";
import Recomendation from "@/components/layouts/guests/Recomendation";

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