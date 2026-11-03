"use server";

import {revalidatePath} from "next/cache";
import {ActionState, fromErrorToActionState, toActionState,} from "@/components/form/utils/to-action-state";
import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {isAdmin} from "@/features/auth/utils/is-admin";
import {prisma} from "@/lib/prisma";
import {bookingsPath} from "@/paths";

export const cancelBooking = async (
    bookingId: string,
    _actionState: ActionState,
    _formData: FormData
) => {
    const {user} = await getAuthOrRedirect();

    try {
        const booking = await prisma.booking.findUnique({where: {id: bookingId}});

        if (!booking) {
            return toActionState("ERROR", "Booking not found");
        }

        const admin = isAdmin(user);

        if (!admin && booking.userId !== user.id) {
            return toActionState("ERROR", "Not authorized");
        }

        // Customers can only cancel unpaid bookings; admins can cancel any.
        if (booking.status === "CANCELLED" || (!admin && booking.status !== "PENDING")) {
            return toActionState("ERROR", "This booking can't be cancelled");
        }

        await prisma.booking.update({
            where: {id: bookingId},
            data: {status: "CANCELLED"},
        });
    } catch (error) {
        return fromErrorToActionState(error);
    }

    revalidatePath(bookingsPath());

    return toActionState("SUCCESS", "Booking cancelled");
};
