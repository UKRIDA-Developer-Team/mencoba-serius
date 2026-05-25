import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HeroSection() {
    return (
        <div className="relative w-full flex items-center justify-center min-h-[80vh] md:min-h-[70vh]">
            <div className="flex flex-col gap-6 md:gap-5 px-6 py-12 md:px-16 max-w-3xl w-full">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-tight">
                    Custom cakes & Pastries Crafted Just for You
                </h1>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl">
                    Every piece is baked to order with the finest ingredients — elegant, personal, and always made with love
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/catalog">
                        <Button className="py-6 px-7 rounded-2xl">
                            Browse The Menu
                        </Button>
                    </Link>
                    <Button className="py-6 px-7 rounded-2xl" variant="outline" disabled>
                        Place a custom order
                    </Button>
                </div>
            </div>
            <Image
                src="/product/banner.jpeg"
                alt="Hero Image"
                width={800}
                height={600}
                className="absolute top-0 right-0 w-full h-full object-cover opacity-40 md:opacity-50"
            />
        </div>
    );
}