import {Prisma} from "@prisma/client";

export type TourWithMetadata = Prisma.TourGetPayload<{
    include: {
        user: {
            select: { username: true };
        };
    };
}> & { isOwner: boolean };