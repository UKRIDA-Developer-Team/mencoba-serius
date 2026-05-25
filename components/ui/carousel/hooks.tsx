"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type {
    ButtonProps,
    EmblaCarouselType,
    UseDotButtonReturn,
    UseAutoplayReturn,
    UseAutoplayProgressReturn,
} from "./types";

// Strict subset of the autoplay plugin API we actually use.
interface AutoplayApi {
    isPlaying(): boolean;
    play(): void;
    stop(): void;
    reset(): void;
    timeUntilNext(): number | null;
    options: { stopOnInteraction?: boolean };
}

// Event union for Embla built-ins + autoplay plugin events we subscribe to.
type EmblaEvent =
    | "reInit"
    | "select"
    | "autoplay:play"
    | "autoplay:stop"
    | "autoplay:timerset"
    | "autoplay:timerstopped";

// EmblaCarouselType widened to accept plugin events via .on() / .off().
type EmblaCarouselWithPluginEvents = EmblaCarouselType & {
    on(event: EmblaEvent, cb: () => void): EmblaCarouselType;
    off(event: EmblaEvent, cb: () => void): EmblaCarouselType;
};

function getAutoplay(emblaApi: EmblaCarouselType | undefined): AutoplayApi | undefined {
    return emblaApi?.plugins()?.autoplay as AutoplayApi | undefined;
}

function restartAnimation(node: HTMLElement, name: string, durationMs: number): void {
    node.style.animationName = "none";
    void node.offsetWidth;
    node.style.animationName = name;
    node.style.animationDuration = `${durationMs}ms`;
}

export function useDotButton(
    emblaApi: EmblaCarouselType | undefined
): UseDotButtonReturn {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onDotButtonClick = useCallback(
        (index: number) => emblaApi?.scrollTo(index),
        [emblaApi]
    );

    const onInit = useCallback((api: EmblaCarouselType) => {
        setScrollSnaps(api.scrollSnapList());
    }, []);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setSelectedIndex(api.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        // emblaApi ready = "init" already fired; sync state directly.

        // eslint-disable-next-line react-hooks/set-state-in-effect
        onInit(emblaApi);
        onSelect(emblaApi);
        emblaApi.on("reInit", onInit);
        emblaApi.on("reInit", onSelect);
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("reInit", onInit);
            emblaApi.off("reInit", onSelect);
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi, onInit, onSelect]);

    return { selectedIndex, scrollSnaps, onDotButtonClick };
}

export function useAutoplay(
    emblaApi: EmblaCarouselType | undefined
): UseAutoplayReturn {
    const [autoplayIsPlaying, setAutoplayIsPlaying] = useState(false);

    const onAutoplayButtonClick = useCallback(
        (callback: () => void) => {
            const autoplay = getAutoplay(emblaApi);
            if (!autoplay) return;
            // Call methods directly to preserve `this` context.
            if (autoplay.options.stopOnInteraction === false) {
                autoplay.reset();
            } else {
                autoplay.stop();
            }
            callback();
        },
        [emblaApi]
    );

    const toggleAutoplay = useCallback(() => {
        const autoplay = getAutoplay(emblaApi);
        if (!autoplay) return;
        // Call methods directly to preserve `this` context.
        if (autoplay.isPlaying()) {
            autoplay.stop();
        } else {
            autoplay.play();
        }
    }, [emblaApi]);

    useEffect(() => {
        const autoplay = getAutoplay(emblaApi);
        if (!autoplay) return;
        const api = emblaApi as EmblaCarouselWithPluginEvents;

        const onPlay = () => setAutoplayIsPlaying(true);
        const onStop = () => setAutoplayIsPlaying(false);
        const onReInit = () => setAutoplayIsPlaying(autoplay.isPlaying());

        // "autoplay:play" already fired; sync initial state directly.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAutoplayIsPlaying(autoplay.isPlaying());

        api.on("autoplay:play", onPlay);
        api.on("autoplay:stop", onStop);
        api.on("reInit", onReInit);
        return () => {
            api.off("autoplay:play", onPlay);
            api.off("autoplay:stop", onStop);
            api.off("reInit", onReInit);
        };
    }, [emblaApi]);

    return { autoplayIsPlaying, toggleAutoplay, onAutoplayButtonClick };
}

export function useAutoplayProgress<ProgressElement extends HTMLElement>(
    emblaApi: EmblaCarouselType | undefined,
    progressNode: React.RefObject<ProgressElement>
): UseAutoplayProgressReturn {
    const [showAutoplayProgress, setShowAutoplayProgress] = useState(false);
    const animationName = useRef("");

    const startProgress = useCallback(
        // eslint-disable-next-line react-hooks/preserve-manual-memoization
        (timeUntilNext: number | null) => {
            const node = progressNode.current;
            if (!node || timeUntilNext === null) return;
            if (!animationName.current) {
                animationName.current = window.getComputedStyle(node).animationName;
            }
            restartAnimation(node, animationName.current, timeUntilNext);
            setShowAutoplayProgress(true);
        },
        [progressNode]
    );

    useEffect(() => {
        const autoplay = getAutoplay(emblaApi);
        if (!autoplay) return;
        const api = emblaApi as EmblaCarouselWithPluginEvents;

        const onTimerSet = () => startProgress(autoplay.timeUntilNext());
        const onTimerStop = () => setShowAutoplayProgress(false);

        api.on("autoplay:timerset", onTimerSet);
        api.on("autoplay:timerstopped", onTimerStop);

        // "autoplay:timerset" already fired; sync initial progress directly.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        startProgress(autoplay.timeUntilNext());

        return () => {
            api.off("autoplay:timerset", onTimerSet);
            api.off("autoplay:timerstopped", onTimerStop);
        };
    }, [emblaApi, startProgress]);

    return { showAutoplayProgress };
}

export function DotButton({ children, ...props }: ButtonProps) {
    return (
        <button type="button" {...props}>
            {children}
        </button>
    );
}
