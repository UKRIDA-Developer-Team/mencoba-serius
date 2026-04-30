"use client";

import { cn } from "@/lib/utils"

const PromotionalText = [
    "Floral Design",
    "Custom Cake",
    "Fresh Pastries",
    "Celebration Cakes",
    "Artisan Croissant",
    "Floral Design",
    "Custom Cake",
    "Fresh Pastries",
    "Celebration Cakes",
    "Artisan Croissant"
];

export default function Marquee() {
    return (
        <div className="overflow-hidden bg-primary py-3">
            <div className="flex gap-10">
                {[...PromotionalText, ...PromotionalText].map((item, i) => (
                    <div key={i} className="whitespace-nowrap">
                        <span className="text-white font-bold">{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}