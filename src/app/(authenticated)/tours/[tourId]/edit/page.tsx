import {notFound} from "next/navigation";
import {Breadcrumbs} from "@/components/breadcrumbs";
import {CardCompact} from "@/components/card-compact";
import {Separator} from "@/components/ui/separator";
import {TourUpsertForm} from "@/features/tour/components/tour-upsert-form";
import {getTour} from "@/features/tour/queries/get-tour";
import {homePath, tourPath} from "@/paths";

type TourEditPageProps = {
    params: Promise<{
        tourId: string;
    }>;
};

const TourEditPage = async ({params}: TourEditPageProps) => {
    const {tourId} = await params;
    const tour = await getTour(tourId);

    const isTourFound = !!tour;

    if (!isTourFound || !tour.isOwner) {
        notFound();
    }

    return (
        <div className="flex-1 flex flex-col gap-y-8">
            <Breadcrumbs
                breadcrumbs={[
                    {title: "Tours", href: homePath()},
                    {title: tour.title, href: tourPath(tour.id)},
                    {title: "Edit"},
                ]}
            />

            <Separator/>

            <div className="flex-1 flex flex-col justify-center items-center">
                <CardCompact
                    title="Edit Tour"
                    description="Edit an existing tour"
                    className="w-full max-w-[420px] animate-fade-from-top"
                    content={<TourUpsertForm tour={tour}/>}
                />
            </div>
        </div>
    );
};

export default TourEditPage;