import {prisma} from "@/lib/prisma";
import {toCurrencyFromCent} from "@/utils/currency";
import {TourCarousel} from "./tour-carousel";

const LatestToursCarousel = async () => {
    const tours = await prisma.tour.findMany({
        orderBy: {createdAt: "desc"},
        take: 5,
        select: {
            id: true,
            title: true,
            destination: true,
            departureDate: true,
            price: true,
            imageUrl: true,
        },
    });

    return (
        <TourCarousel
            slides={tours.map((tour) => ({
                ...tour,
                price: toCurrencyFromCent(tour.price),
            }))}
        />
    );
};

export {LatestToursCarousel};
