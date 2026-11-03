import {getAuth} from "@/features/auth/queries/get-auth";
import {isAdmin} from "@/features/auth/utils/is-admin";
import {prisma} from "@/lib/prisma";
import {ParsedSearchParams} from "../search-params";

export const getTours = async (
    userId: string | undefined,
    searchParams: ParsedSearchParams
) => {
    const {user} = await getAuth();

    const where = {
        userId,
        OR: [
            {
                title: {
                    contains: searchParams.search,
                    mode: "insensitive" as const,
                },
            },
            {
                destination: {
                    contains: searchParams.search,
                    mode: "insensitive" as const,
                },
            },
        ],
    };

    const skip = searchParams.size * searchParams.page;
    const take = searchParams.size;

    const [tours, count] = await Promise.all([
        prisma.tour.findMany({
            where,
            skip,
            take,
            orderBy: {
                [searchParams.sortKey]: searchParams.sortValue,
            },
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        }),
        prisma.tour.count({
            where,
        }),
    ]);

    return {
        list: tours.map((tour) => ({
            ...tour,
            isOwner: isAdmin(user), // can manage = admins only
        })),
        metadata: {
            count,
            hasNextPage: count > skip + take,
        },
    };
};