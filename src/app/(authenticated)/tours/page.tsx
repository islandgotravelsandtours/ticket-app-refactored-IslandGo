import {SearchParams} from "nuqs/server";
import {Suspense} from "react";
import {CardCompact} from "@/components/card-compact";
import {Heading} from "@/components/heading";
import {Spinner} from "@/components/spinner";
import {getAdminOrRedirect} from "@/features/auth/queries/get-admin-or-redirect";
import {TourList} from "@/features/tour/components/tour-list";
import {TourUpsertForm} from "@/features/tour/components/tour-upsert-form";
import {searchParamsCache} from "@/features/tour/search-params";

type ToursPageProps = {
    searchParams: Promise<SearchParams>;
};

const ToursPage = async ({searchParams}: ToursPageProps) => {
    await getAdminOrRedirect();

    return (
        <div className="flex-1 flex flex-col gap-y-8">
            <Heading title="Manage Tours" description="Create, edit and remove tours"/>

            <CardCompact
                title="Create Tour"
                description="Publish a new tour for travelers"
                className="w-full max-w-[420px] self-center"
                content={<TourUpsertForm/>}
            />

            <Suspense fallback={<Spinner/>}>
                <TourList
                    searchParams={searchParamsCache.parse(await searchParams)}
                />
            </Suspense>
        </div>
    );
};

export default ToursPage;