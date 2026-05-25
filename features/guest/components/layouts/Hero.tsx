import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HeroSection() {
    return (
        <main className="relative w-full flex items-center justify-center min-h-[80vh] md:min-h-[70vh]">
            <Image
                src="/product/banner.webp"
                alt="Custom cakes and pastries display with various baked goods arranged artfully"
                width={800}
                height={600}
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/87" aria-hidden="true" />
            <div className="relative z-10 flex flex-col gap-6 md:gap-5 px-6 py-12 md:px-16 max-w-3xl w-full">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-tight">
                    Kue & Pastry Custom Dibuat Khusus untuk Anda
                </h1>
                <p className="text-primary text-sm sm:text-base leading-relaxed max-w-xl">
                    Setiap produk dipanggang sesuai pesanan dengan bahan berkualitas terbaik — elegan, personal, dan selalu dibuat dengan cinta
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/catalog">
                        <Button className="py-6 px-7 rounded-2xl">
                            Lihat Menu
                        </Button>
                    </Link>
                    <Button className="py-6 px-7 rounded-2xl" variant="outline" disabled>
                        Pesan Custom
                    </Button>
                </div>
            </div>
        </main>
    );
}