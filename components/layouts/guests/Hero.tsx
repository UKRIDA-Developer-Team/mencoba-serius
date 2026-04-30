"use client";

import { useEffect, useState } from "react";
import {Button} from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Greetings = [
    "Good Morning",
    "Good Afternoon",
    "Good Evening",
    "Good Night",
];


export default function HeroSection() {
    const [greeting, setGreeting] = useState("Good Morning");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting("Good Morning");
        } else if (hour < 18) {
            setGreeting("Good Afternoon");
        } else {
            setGreeting("Good Evening");
        }
    }, []);

    return (
        <div
            className="relative w-full overflow-hidden flex items-center justify-center md:w-5xl m-auto min-h-screen"
        >
            <div className="flex flex-col gap-10 md:gap-5 p-9">
                <h1 className="text-3xl font-bold text-primary">
                    Custom cakes & Pastries Crafted Just for You
                </h1>
                <p className="text-gray-600">
                    Every piece is baked to order with the finest ingredients — elegant, personal, and always made with love
                </p>
                <div className="flex gap-10">
                    <Button className="py-6 px-7 rounded-2xl">
                        Browse The Menu
                    </Button>
                    <Button className="py-6 px-7 rounded-2xl" variant="outline">
                        Place a custom order
                    </Button>
                </div>
            </div>
        </div>
    );
}