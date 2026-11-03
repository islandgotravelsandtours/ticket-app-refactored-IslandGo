import clsx from "clsx";
import {MapPin, Pencil, Plane} from "lucide-react";
import Link from "next/link";
import {tourEditPath, tourPath} from "@/paths";
import {toCurrencyFromCent} from "@/utils/currency";
import {TourWithMetadata} from "../types";
import {formatDepartureDate, todayString} from "../utils/format-date";

const BADGES = {
    OPEN: {label: "Open for booking", style: "bg-emerald-100 text-emerald-900"},
    FULLY_BOOKED: {label: "Fully booked", style: "bg-amber-100 text-amber-900"},
    COMPLETED: {label: "Completed", style: "bg-slate-200 text-slate-800"},
    DEPARTED: {label: "Departed", style: "bg-slate-200 text-slate-800"},
};

const getBadge = (tour: TourWithMetadata) => {
    if (tour.status === "OPEN" && tour.departureDate < todayString()) {
        return BADGES.DEPARTED;
    }
    return BADGES[tour.status];
};

const TourCard = ({tour}: { tour: TourWithMetadata }) => {
    const badge = getBadge(tour);

    return (
        <article className="relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-teal-600 to-cyan-800">
                {tour.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={tour.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-white/50">
                        <Plane className="h-14 w-14"/>
                    </div>
                )}

                <span
                    className={clsx(
                        "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm",
                        badge.style
                    )}
                >
          {badge.label}
        </span>

                <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-slate-900 shadow">
          {toCurrencyFromCent(tour.price)}
                    <span className="font-normal text-slate-600"> / person</span>
        </span>
            </div>

            <div className="flex flex-1 flex-col gap-y-2 p-4">
                <h3 className="font-display text-lg font-semibold leading-snug">
                    {/* the ::after stretches the link so the whole card is clickable */}
                    <Link
                        href={tourPath(tour.id)}
                        prefetch
                        className="outline-none after:absolute after:inset-0"
                    >
                        {tour.title}
                    </Link>
                </h3>

                {tour.destination ? (
                    <p className="flex items-center gap-x-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0"/>
                        <span className="truncate">{tour.destination}</span>
                    </p>
                ) : null}

                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {tour.content}
                </p>

                <p className="mt-auto pt-2 text-sm font-medium">
                    Departs {formatDepartureDate(tour.departureDate)}
                </p>
            </div>

            {tour.isOwner ? (
                <Link
                    href={tourEditPath(tour.id)}
                    aria-label={`Edit ${tour.title}`}
                    className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-900 shadow hover:bg-white"
                >
                    <Pencil className="h-4 w-4"/>
                </Link>
            ) : null}
        </article>
    );
};

export {TourCard};
