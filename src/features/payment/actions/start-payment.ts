"use server";

import {randomBytes} from "node:crypto";
import {redirect} from "next/navigation";
import {ActionState, fromErrorToActionState, toActionState} from "@/components/form/utils/to-action-state";
import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {createInvoice} from "@/lib/xendit";
import {prisma} from "@/lib/prisma";
import {bookingsPath} from "@/paths";

const referenceNumber = () => {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `IG-${d}-${randomBytes(3).toString("hex").toUpperCase()}`;
};

export const startPayment = async (
    bookingId: string,
    _actionState: ActionState,
    _formData: FormData
): Promise<ActionState> => {
    const {user} = await getAuthOrRedirect();

    let checkoutUrl: string;

    try {
        // Amount comes from the DB booking, never from the client.
        const booking = await prisma.booking.findUnique({
            where: {id: bookingId},
            include: {tour: {select: {title: true}}},
        });

        if (!booking || booking.userId !== user.id) {
            return toActionState("ERROR", "Not authorized");
        }
        if (booking.status !== "PENDING") {
            return toActionState("ERROR", "This booking can't be paid");
        }
        if (booking.totalAmount <= 0) {
            return toActionState("ERROR", "Invalid booking amount");
        }

        const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

        // Supersede any earlier unfinished attempt for this booking.
        await prisma.payment.updateMany({
            where: {bookingId, status: "PENDING"},
            data: {status: "CANCELLED", failureReason: "Replaced by a new payment attempt"},
        });

        const payment = await prisma.payment.create({
            data: {
                referenceNumber: referenceNumber(),
                amount: booking.totalAmount,
                bookingId,
                userId: user.id,
            },
        });

        const invoice = await createInvoice({
            externalId: payment.referenceNumber,
            amountCentavos: payment.amount,
            description: `IslandGo – ${booking.tour.title} (${booking.guests} guest${booking.guests > 1 ? "s" : ""})`,
            successUrl: `${appUrl}/transactions/${payment.id}?returned=1`,
            failureUrl: `${appUrl}/transactions/${payment.id}?returned=1`,
            customer: {name: user.username, email: user.email},
        });

        await prisma.payment.update({
            where: {id: payment.id},
            data: {invoiceId: invoice.id},
        });

        checkoutUrl = invoice.invoice_url;
    } catch (error) {
        return fromErrorToActionState(error);
    }

    redirect(checkoutUrl);
};
