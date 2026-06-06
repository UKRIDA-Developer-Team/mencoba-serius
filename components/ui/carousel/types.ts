import type React from "react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";

export type CarouselProps = {
    slides: React.ReactNode[];
    options?: EmblaOptionsType;
    /** Override slide flex-basis. Default: "flex-[0_0_70%] pl-3" */
    slideClassName?: string;
};

export type UseDotButtonReturn = {
    selectedIndex: number;
    scrollSnaps: number[];
    onDotButtonClick: (index: number) => void;
};

export type UseAutoplayReturn = {
    autoplayIsPlaying: boolean;
    toggleAutoplay: () => void;
    onAutoplayButtonClick: (callback: () => void) => void;
};

export type UseAutoplayProgressReturn = {
    showAutoplayProgress: boolean;
};

export type ButtonProps = React.PropsWithChildren<
    React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    >
>;

export type { EmblaCarouselType, EmblaOptionsType };
