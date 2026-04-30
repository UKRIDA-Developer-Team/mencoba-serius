import HeroSection from "@/components/layouts/guests/Hero";
import Marquee from "@/components/ui/marquee";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center md:w-5xl mx-auto border-x border-success overflow-hidden">
      <HeroSection />
      <Marquee />
    </div>
  );
}