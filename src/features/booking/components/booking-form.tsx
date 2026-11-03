"use client";

import {useActionState, useState} from "react";
import {FieldError} from "@/components/form/field-error";
import {Form} from "@/components/form/form";
import {SubmitButton} from "@/components/form/submit-button";
import {EMPTY_ACTION_STATE} from "@/components/form/utils/to-action-state";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {toCurrencyFromCent} from "@/utils/currency";
import {createBooking} from "../actions/create-booking";

type BookingFormProps = {
    tourId: string;
    price: number;
};

const BookingForm = ({tourId, price}: BookingFormProps) => {
    const [actionState, action] = useActionState(
        createBooking.bind(null, tourId),
        EMPTY_ACTION_STATE
    );
    const [guests, setGuests] = useState(1);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Book this tour</CardTitle>
                <CardDescription>Reserve your seats, then pay to confirm.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form action={action} actionState={actionState}>
                    <Label htmlFor="guests">Number of guests</Label>
                    <Input
                        id="guests"
                        name="guests"
                        type="number"
                        min={1}
                        max={20}
                        value={guests}
                        onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                    />
                    <FieldError actionState={actionState} name="guests"/>

                    <p className="text-sm">
                        Total: <strong>{toCurrencyFromCent(price * guests)}</strong>
                    </p>

                    <SubmitButton label="Book now"/>
                </Form>
            </CardContent>
        </Card>
    );
};

export {BookingForm};
