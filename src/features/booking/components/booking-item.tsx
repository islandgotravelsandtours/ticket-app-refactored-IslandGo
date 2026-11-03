"use client";

import clsx from "clsx";
import Link from "next/link";
import {useActionState} from "react";
import {Form} from "@/components/form/form";
import {ImageCarousel} from "@/components/image-carousel";
import {SubmitButton} from "@/components/form/submit-button";
import {EMPTY_ACTION_STATE} from "@/components/form/utils/to-action-state";
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {getTourImages} from "@/features/tour/utils/get-tour-images";
import {tourPath} from "@/paths";
import {toCurrencyFromCent} from "@/utils/currency";
import {cancelBooking} from "../actions/cancel-booking";
import {PayForm} from "@/features/payment/components/pay-form";
import {BOOKING_STATUS_LABELS} from "../constants";
import {BookingWithDetails} from "../types";

type BookingItemProps = {
    booking: BookingWithDetails;
    isAdmin: boolean;
};

const BookingItem = ({booking, isAdmin}: BookingItemProps) => {
    const [cancelState, cancelAction] = useActionState(
        cancelBooking.bind(null, booking.id),
        EMPTY_ACTION_STATE
    );

    const canPay = !isAdmin && booking.status === "PENDING";
    const canCancel = isAdmin
        ? booking.status !== "CANCELLED"
        : booking.status === "PENDING";

    return (
        <Card className="w-full max-w-[580px] overflow-hidden">
            <ImageCarousel
                images={getTourImages(booking.tour)}
                alt={booking.tour.title}
                className="aspect-[16/7] w-full"
                imageClassName={clsx({"grayscale opacity-70": booking.status === "CANCELLED"})}
            />
            <CardHeader>
                <CardTitle className="flex justify-between gap-x-2">
                    <Link href={tourPath(booking.tour.id)} className="truncate hover:underline">
                        {booking.tour.title}
                    </Link>
                    <span
                        className={clsx("text-sm font-medium", {
                            "text-yellow-600": booking.status === "PENDING",
                            "text-green-600": booking.status === "PAID",
                            "text-muted-foreground": booking.status === "CANCELLED",
                        })}
                    >
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    {booking.tour.destination} · departs {booking.tour.departureDate}
                </p>
            </CardHeader>
            <CardContent className="text-sm flex flex-col gap-y-1">
                {isAdmin && <p>Customer: {booking.user.username}</p>}
                <p>
                    {booking.guests} guest{booking.guests > 1 ? "s" : ""} ·{" "}
                    <strong>{toCurrencyFromCent(booking.totalAmount)}</strong>
                </p>
                {booking.paymentRef && (
                    <p className="text-muted-foreground">Receipt no.: {booking.paymentRef}</p>
                )}
            </CardContent>
            {(canPay || canCancel) && (
                <CardFooter className="flex flex-wrap gap-2">
                    {canPay && <PayForm bookingId={booking.id}/>}
                    {canCancel && (
                        <Form action={cancelAction} actionState={cancelState}>
                            <SubmitButton label="Cancel" variant="outline"/>
                        </Form>
                    )}
                </CardFooter>
            )}
        </Card>
    );
};

export {BookingItem};
