import Link from "next/link";
import {Suspense} from "react";
import {getAuth} from "@/features/auth/queries/get-auth";
import {isAdmin} from "@/features/auth/utils/is-admin";
import {prisma} from "@/lib/prisma";
import {bookingsPath, signUpPath, toursPath} from "@/paths";
import {toCurrencyFromCent} from "@/utils/currency";
import {formatDepartureDate, todayString} from "../utils/format-date";
import {LatestToursCarousel} from "./latest-tours-carousel";

const HomeHero = async () => {
    const {user} = await getAuth();

    // Real numbers from the database: open tours that haven't departed yet.
    const openTours = await prisma.tour.findMany({
        where: {status: "OPEN", departureDate: {gte: todayString()}},
        orderBy: {departureDate: "asc"},
        select: {departureDate: true, price: true},
    });

    const summary = openTours.length
        ? `${openTours.length} ${openTours.length === 1 ? "tour is" : "tours are"} open for booking, from ${toCurrencyFromCent(
            Math.min(...openTours.map((tour) => tour.price))
        )} per person. Next departure: ${formatDepartureDate(openTours[0].departureDate)}.`
        : "New tours are added regularly. Check back soon.";

    const secondary = !user
        ? {href: signUpPath(), label: "Create an account"}
        : isAdmin(user)
            ? {href: toursPath(), label: "Manage tours"}
            : {href: bookingsPath(), label: "My bookings"};

    return (
        <section className="relative isolate overflow-hidden rounded-3xl bg-[radial-gradient(120%_100%_at_0%_0%,#13808c_0%,#0b3f4d_55%,#08242e_100%)] text-white">
            {/* faint island contour lines */}
            <svg
                aria-hidden="true"
                viewBox="0 0 600 600"
                className="pointer-events-none absolute -bottom-48 -left-40 -z-10 h-[680px] w-[680px] text-white/10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
            >
                {[280, 240, 200, 160, 120, 80, 44].map((r, i) => (
                    <ellipse
                        key={r}
                        cx="300"
                        cy="300"
                        rx={r * 1.1}
                        ry={r * 0.8}
                        transform={`rotate(${-18 + i * 3} 300 300)`}
                    />
                ))}
            </svg>

            <div className="grid items-center gap-10 p-8 md:p-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="flex flex-col gap-y-6">
                    <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                        Pick an island.
                        <br/>
                        Book your seats.
                        <br/>
                        Pay and go.
                    </h1>

                    <p className="max-w-md text-lg text-white/80">
                        Guided trips across the Philippines and nearby, with the price per
                        person shown up front.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="#tours"
                            className="rounded-full bg-[#ff6a55] px-6 py-3 font-semibold text-[#2b0f0a] hover:bg-[#ff7d6a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            Browse tours
                        </Link>
                        <Link
                            href={secondary.href}
                            className="rounded-full border border-white/40 px-6 py-3 font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            {secondary.label}
                        </Link>
                    </div>

                    <p className="max-w-md text-sm text-white/70">{summary}</p>
                </div>

                <Suspense fallback={<div className="h-80 rounded-2xl bg-white/10 sm:h-96"/>}>
                    <LatestToursCarousel/>
                </Suspense>
            </div>
        </section>
    );
};

export {HomeHero};
