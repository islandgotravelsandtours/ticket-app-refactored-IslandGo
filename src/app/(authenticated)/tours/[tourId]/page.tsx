import {notFound} from "next/navigation";
import {Breadcrumbs} from "@/components/breadcrumbs";
import {Separator} from "@/components/ui/separator";
import {getAuth} from "@/features/auth/queries/get-auth";
import {isAdmin} from "@/features/auth/utils/is-admin";
import {BookingForm} from "@/features/booking/components/booking-form";
import {Comments} from "@/features/comment/components/comments";
import {getComments} from "@/features/comment/queries/get-comments";
import {TourItem} from "@/features/tour/components/tour-item";
import {getTour} from "@/features/tour/queries/get-tour";
import {homePath} from "@/paths";

type TourPageProps = {
    params: Promise<{
        tourId: string;
    }>;
};

const TourPage = async ({params}: TourPageProps) => {
    const {tourId} = await params;
    const tourPromise = getTour(tourId);
    const commentsPromise = getComments(tourId);

    const [tour, paginatedComments] = await Promise.all([
        tourPromise,
        commentsPromise,
    ]);

    if (!tour) {
        notFound();
    }

    const {user} = await getAuth();
    const today = new Date().toISOString().split("T")[0];
    const isBookable = tour.status === "OPEN" && tour.departureDate >= today;

    // Only customers can book; admins manage tours instead.
    const booking =
        user && !isAdmin(user) ? (
            isBookable ? (
                <BookingForm tourId={tour.id} price={tour.price}/>
            ) : (
                <p className="text-sm text-muted-foreground">
                    This tour is not open for booking.
                </p>
            )
        ) : null;

    return (
        <div className="flex-1 flex flex-col gap-y-8">
            <Breadcrumbs
                breadcrumbs={[
                    {title: "Tours", href: homePath()},
                    {title: tour.title},
                ]}
            />

            <Separator/>

            <div className="flex justify-center animate-fade-from-top">
                <TourItem
                    tour={tour}
                    isDetail
                    booking={booking}
                    comments={
                        <Comments
                            tourId={tour.id}
                            paginatedComments={paginatedComments}
                        />
                    }
                />
            </div>
        </div>
    );
};

export default TourPage;