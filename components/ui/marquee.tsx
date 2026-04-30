"use client";

const PromotionalText = [
    "Custom Cakes",
    "Fresh Pastries",
    "Made to Order",
    "Floral Designs",
    "Celebration Cakes",
    "Artisan Croissants",
    "Made with Love",
];

function TrackContent({className=""}) {
    return (
        <>
            {PromotionalText.map((item, i) => (
                <span key={i} className={`flex items-center gap-8 px-6 text-white font-bold whitespace-nowrap ${className}`}>
                    {item}
                    <span className="select-none">·</span>
                </span>
            ))}
        </>
    );
}

export default function Marquee() {
    return (
        <div className="overflow-hidden bg-primary py-3 m-auto">
            <div className="flex w-max animate-marquee">
                <span className="item-collection-1 flex items-center">
                    <TrackContent className="item-1"/>
                </span>
                <span className="flex items-center">
                    <TrackContent className="item-2"/>
                </span>
            </div>
        </div>
    );
}