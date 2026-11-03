"use client";

import clsx from "clsx";
import {ChevronLeft, ChevronRight, Plane} from "lucide-react";
import {useRef, useState} from "react";

type ImageCarouselProps = {
    images: string[];
    alt: string;
    className?: string;
    imageClassName?: string;
};

// Swipeable on touch (scroll-snap), arrows + dots on desktop.
const ImageCarousel = ({images, alt, className, imageClassName}: ImageCarouselProps) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [index, setIndex] = useState(0);

    if (!images.length) {
        return (
            <div
                className={clsx(
                    "flex items-center justify-center bg-gradient-to-br from-teal-600 to-cyan-800 text-white/50",
                    className
                )}
            >
                <Plane className="h-12 w-12"/>
            </div>
        );
    }

    const goTo = (n: number) => {
        const el = scrollerRef.current;
        if (!el) return;
        const next = (n + images.length) % images.length;
        el.scrollTo({left: next * el.clientWidth, behavior: "smooth"});
    };

    const handleScroll = () => {
        const el = scrollerRef.current;
        if (!el || !el.clientWidth) return;
        setIndex(Math.round(el.scrollLeft / el.clientWidth));
    };

    const hasMany = images.length > 1;

    return (
        <div className={clsx("relative overflow-hidden bg-slate-800", className)}>
            <div
                ref={scrollerRef}
                onScroll={handleScroll}
                className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {images.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={`${src}-${i}`}
                        src={src}
                        alt={hasMany ? `${alt} (${i + 1} of ${images.length})` : alt}
                        loading={i === 0 ? "eager" : "lazy"}
                        className={clsx(
                            "h-full w-full shrink-0 snap-center object-cover",
                            imageClassName
                        )}
                    />
                ))}
            </div>

            {hasMany ? (
                <>
                    <button
                        type="button"
                        aria-label="Previous image"
                        onClick={() => goTo(index - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
                    >
                        <ChevronLeft className="h-5 w-5"/>
                    </button>
                    <button
                        type="button"
                        aria-label="Next image"
                        onClick={() => goTo(index + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
                    >
                        <ChevronRight className="h-5 w-5"/>
                    </button>

                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-x-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Go to image ${i + 1}`}
                                onClick={() => goTo(i)}
                                className={clsx(
                                    "h-1.5 rounded-full bg-white transition-all",
                                    i === index ? "w-5" : "w-1.5 opacity-60"
                                )}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
};

export {ImageCarousel};
