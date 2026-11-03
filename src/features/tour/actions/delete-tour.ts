"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {setCookieByKey} from "@/actions/cookies";
import {fromErrorToActionState, toActionState,} from "@/components/form/utils/to-action-state";
import {getAdminOrRedirect} from "@/features/auth/queries/get-admin-or-redirect";
import {prisma} from "@/lib/prisma";
import {toursPath} from "@/paths";

export const deleteTour = async (id: string) => {
    await getAdminOrRedirect();

    try {
        const bookings = await prisma.booking.count({where: {tourId: id}});

        if (bookings > 0) {
            return toActionState(
                "ERROR",
                "This tour has bookings and can't be deleted. Mark it Completed instead."
            );
        }

        await prisma.tour.delete({
            where: {
                id,
            },
        });
    } catch (error) {
        return fromErrorToActionState(error);
    }

    revalidatePath(toursPath());
    await setCookieByKey("toast", "Tour deleted");
    redirect(toursPath());
};