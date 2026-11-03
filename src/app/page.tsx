import {SearchParams} from "nuqs/server";
import {Suspense} from "react";
import {Spinner} from "@/components/spinner";
import {HomeHero} from "@/features/tour/components/home-hero";
import {TourList} from "@/features/tour/components/tour-list";
import {searchParamsCache} from "@/features/tour/search-params";

type HomePageProps = {
    searchParams: Promise<SearchParams>;
};

const STEPS = [
    {
        title: "Pick a tour",
        text: "Compare destinations, departure dates and the price per person.",
    },
    {
        title: "Book your seats",
        text: "Choose how many guests are coming. Your booking is saved right away.",
    },
    {
        title: "Pay and go",
        text: "Pay to confirm your seats, then join the tour on departure day.",
    },
];

const HomePage = async ({searchParams}: HomePageProps) => {
    const parsedSearchParams = searchParamsCache.parse(await searchParams);

    return (
        <div className="flex flex-1 flex-col gap-y-14">
            <HomeHero/>

            <ol className="grid gap-6 md:grid-cols-3">
                {STEPS.map((step, index) => (
                    <li key={step.title} className="flex gap-x-4">
            <span className="font-display text-4xl font-bold leading-none text-primary/40">
              {index + 1}
            </span>
                        <div>
                            <h2 className="font-display text-lg font-semibold">{step.title}</h2>
                            <p className="text-sm text-muted-foreground">{step.text}</p>
                        </div>
                    </li>
                ))}
            </ol>

            <section id="tours" className="flex scroll-mt-32 flex-col gap-y-6">
                <div>
                    <h2 className="font-display text-3xl font-bold tracking-tight">
                        Upcoming tours
                    </h2>
                    <p className="text-muted-foreground">
                        Search by destination or sort by price.
                    </p>
                </div>

                <Suspense fallback={<Spinner/>}>
                    <TourList searchParams={parsedSearchParams}/>
                </Suspense>
            </section>
        </div>
    );
};

export default HomePage;
