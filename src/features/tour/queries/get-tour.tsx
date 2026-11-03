import {getAuth} from "@/features/auth/queries/get-auth";
import {isAdmin} from "@/features/auth/utils/is-admin";
import {prisma} from "@/lib/prisma";

export const getTour = async (id: string) => {
    const {user} = await getAuth();

    const tour = await prisma.tour.findUnique({
        where: {
            id,
        },
        include: {
            user: {
                select: {
                    username: true,
                },
            },
        },
    });

    if (!tour) {
        return null;
    }

    // isOwner = "can manage" (admins only)
    return {...tour, isOwner: isAdmin(user)};
};