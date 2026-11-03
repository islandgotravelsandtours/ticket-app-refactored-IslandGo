"use server";

import {randomUUID} from "node:crypto";
import {revalidatePath} from "next/cache";
import {ActionState, fromErrorToActionState, toActionState,} from "@/components/form/utils/to-action-state";
import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {prisma} from "@/lib/prisma";
import {bookingsPath} from "@/paths";

export const payBooking = async (
    bookingId: string,
    _actionState: ActionState,
    _formData: FormData
) => {
    const {user} = await getAuthOrRedirect();

    try {
        const booking = await prisma.booking.findUnique({where: {id: bookingId}});

        if (!booking || booking.userId !== user.id) {
            return toActionState("ERROR", "Not authorized");
        }

        if (booking.status !== "PENDING") {
            return toActionState("ERROR", "This booking can't be paid");
        }

        // TEST PAYMENT: no real money moves here.
        // To go live, create a PayMongo / Stripe checkout session for
        // booking.totalAmount, redirect the customer to it, and only set
        // status "PAID" from the gateway's webhook.
        await prisma.booking.update({
            where: {id: bookingId},
            data: {
                status: "PAID",
                paidAt: new Date(),
                paymentRef: `TEST-${randomUUID().slice(0, 8).toUpperCase()}`,
            },
        });
    } catch (error) {
        return fromErrorToActionState(error);
    }

    revalidatePath(bookingsPath());

    return toActionState("SUCCESS", "Payment received. Booking confirmed!");
};
