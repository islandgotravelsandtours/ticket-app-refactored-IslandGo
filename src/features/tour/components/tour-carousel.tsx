"use client";

import {ChevronLeft, ChevronRight, MapPin, Plane} from "lucide-react";
import Link from "next/link";
import {useEffect, useState} from "react";
import {tourPath} from "@/paths";

type Slide = {
    id: string;
    title: string;
    destination: string;
    departureDate: string;
    price: string;
    imageUrl: string | null;
};

const GRADIENTS = [
    "from-sky-500 to-indigo-600",
    "from-emerald-500 to-teal-700",
    "from-orange-500 to-rose-600",
    "from-fuchsia-500 to-purple-700",
    "from-cyan-500 to-blue-700",
];

const TourCarousel = ({slides}: { slides: Slide[] }) => {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || slides.length < 2) return;

        const timer = setInterval(
            () => setIndex((i) => (i + 1) % slides.length),
            4000
        );

        return () => clearInterval(timer);
    }, [paused, slides.length]);

    if (!slides.length) return null;

    const go = (n: number) => setIndex((n + slides.length) % slides.length);

    return (
        <div
            className="relative h-80 w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/20 sm:h-96"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {slides.map((slide, i) => (
                <Link
                    key={slide.id}
                    href={tourPath(slide.id)}
                    className={`isolate absolute inset-0 flex flex-col justify-end gap-y-1 bg-gradient-to-br p-6 text-white transition-opacity duration-700 ${
                        GRADIENTS[i % GRADIENTS.length]
                    } ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
                >
                    {slide.imageUrl ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={slide.imageUrl}
                                alt={slide.title}
                                className="absolute inset-0 -z-10 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 -z-10 bg-black/40"/>
                        </>
                    ) : (
                        <Plane className="absolute -right-6 -top-6 h-56 w-56 opacity-20"/>
                    )}
                    <span className="text-sm font-medium opacity-90">Just added</span>
                    <h3 className="text-2xl font-bold leading-tight">{slide.title}</h3>
                    <p className="flex items-center gap-x-1 text-sm">
                        <MapPin className="h-4 w-4"/>
                        {slide.destination}
                    </p>
                    <p className="text-sm opacity-90">
                        Departs {slide.departureDate} · {slide.price} / person
                    </p>
                </Link>
            ))}

            {slides.length > 1 ? (
                <>
                    <button
                        type="button"
                        aria-label="Previous"
                        onClick={() => go(index - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white hover:bg-black/50"
                    >
                        <ChevronLeft/>
                    </button>
                    <button
                        type="button"
                        aria-label="Next"
                        onClick={() => go(index + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white hover:bg-black/50"
                    >
                        <ChevronRight/>
                    </button>

                    <div className="absolute right-4 top-4 flex gap-x-1.5">
                        {slides.map((slide, i) => (
                            <button
                                key={slide.id}
                                type="button"
                                aria-label={`Go to slide ${i + 1}`}
                                onClick={() => go(i)}
                                className={`h-2 rounded-full bg-white transition-all ${
                                    i === index ? "w-6" : "w-2 opacity-50"
                                }`}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
};

export {TourCarousel};
