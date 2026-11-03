import {Prisma} from "@prisma/client";

export type BookingWithDetails = Prisma.BookingGetPayload<{
    include: {
        tour: { select: { id: true; title: true; destination: true; departureDate: true; imageUrl: true; images: true } };
        user: { select: { username: true } };
    };
}>;
