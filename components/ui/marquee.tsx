"use client";

const promotionalText = [
    "Kue Custom",
    "Pastry Segar",
    "Dibuat Sesuai Pesanan",
    "Desain Floral",
    "Kue Perayaan",
    "Croissant Artisan",
    "Dibuat dengan Cinta",
];

function TrackContent({ className = "" }: { className?: string }) {
    return (
        <>
            {promotionalText.map((item) => (
                <span
                    key={item}
                    className={`flex items-center gap-8 px-6 text-white font-bold whitespace-nowrap ${className}`}
                >
                    {item}
                    <span className="select-none">·</span>
                </span>
            ))}
        </>
    );
}

export default function Marquee() {
    return (
        <div className="overflow-hidden bg-primary py-3 w-full">
            <div className="flex w-max animate-marquee">
                <span className="item-collection-1 flex items-center">
                    <TrackContent className="item-1" />
                </span>
                <span className="flex items-center">
                    <TrackContent className="item-2" />
                </span>
            </div>
        </div>
    );
}