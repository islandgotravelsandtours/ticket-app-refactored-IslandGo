"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {z} from "zod";
import {setCookieByKey} from "@/actions/cookies";
import {ActionState, fromErrorToActionState, toActionState,} from "@/components/form/utils/to-action-state";
import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {isAdmin} from "@/features/auth/utils/is-admin";
import {prisma} from "@/lib/prisma";
import {bookingsPath} from "@/paths";

const createBookingSchema = z.object({
    guests: z.coerce.number().int().min(1).max(20),
});

export const createBooking = async (
    tourId: string,
    _actionState: ActionState,
    formData: FormData
) => {
    const {user} = await getAuthOrRedirect();

    if (isAdmin(user)) {
        return toActionState("ERROR", "Admins can't book tours. Use a customer account.");
    }

    try {
        const {guests} = createBookingSchema.parse({
            guests: formData.get("guests"),
        });

        const tour = await prisma.tour.findUnique({where: {id: tourId}});

        if (!tour) {
            return toActionState("ERROR", "Tour not found");
        }

        const today = new Date().toISOString().split("T")[0];

        if (tour.status !== "OPEN" || tour.departureDate < today) {
            return toActionState("ERROR", "This tour is not open for booking");
        }

        await prisma.booking.create({
            data: {
                tourId,
                userId: user.id,
                guests,
                totalAmount: tour.price * guests,
            },
        });
    } catch (error) {
        return fromErrorToActionState(error, formData);
    }

    revalidatePath(bookingsPath());
    await setCookieByKey("toast", "Booking created. Pay to confirm your seat.");
    redirect(bookingsPath());
};
