import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {isAdmin} from "@/features/auth/utils/is-admin";
import {prisma} from "@/lib/prisma";

// Admins see every booking, customers only their own.
export const getBookings = async () => {
    const {user} = await getAuthOrRedirect();

    return prisma.booking.findMany({
        where: isAdmin(user) ? {} : {userId: user.id},
        orderBy: {createdAt: "desc"},
        include: {
            tour: {
                select: {id: true, title: true, destination: true, departureDate: true, imageUrl: true, images: true},
            },
            user: {select: {username: true}},
        },
    });
};
