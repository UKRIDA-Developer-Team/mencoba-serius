"use client";

import { useRef } from "react";
import type React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDotButton, useAutoplay, useAutoplayProgress, DotButton } from "./hooks";
import type { CarouselProps } from "./types";

export function Carousel({ slides, options, slideClassName = "flex-[0_0_70%] pl-3" }: CarouselProps) {
    const progressNode = useRef<HTMLDivElement>(null);

    const [emblaRef, emblaApi] = useEmblaCarousel(options, [
        Autoplay({ playOnInit: true, delay: 5000 }),
    ]);

    const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);
    const { autoplayIsPlaying, toggleAutoplay, onAutoplayButtonClick } = useAutoplay(emblaApi);
    const { showAutoplayProgress } = useAutoplayProgress(
        emblaApi,
        progressNode as React.RefObject<HTMLElement>
    );

    return (
        <div>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y touch-pinch-zoom">
                    {slides.map((slide, index) => (
                        <div key={index} className={`transform-gpu ${slideClassName}`}>
                            {slide}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex mx-auto max-w-80 justify-between items-center gap-3 mt-5">
                <div className="flex justify-center gap-2">
                    {scrollSnaps.map((_, index) => (
                        <DotButton
                            key={index}
                            onClick={() => onAutoplayButtonClick(() => onDotButtonClick(index))}
                            className={`w-2.5 h-2.5 rounded-full border-2 border-border transition-colors duration-200 ${index === selectedIndex
                                    ? "bg-foreground"
                                    : "bg-transparent hover:bg-muted"
                                }`}
                        />
                    ))}
                </div>

                <div
                    className={`rounded-[1.8rem] border-2 border-border bg-background relative h-2 w-40 max-w-[90%] overflow-hidden transition-opacity duration-300 ease-in-out ${showAutoplayProgress ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div
                        ref={progressNode}
                        className="bg-foreground absolute w-full top-0 bottom-0 -left-full animate-[autoplay-progress_linear_1]"
                        style={{ animationPlayState: showAutoplayProgress ? "running" : "paused" }}
                    />
                </div>

                <Button size="icon" variant="secondary" onClick={toggleAutoplay} type="button">
                    {autoplayIsPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                </Button>
            </div>
        </div>
    );
}
