"use client";

import {useActionState} from "react";
import {Form} from "@/components/form/form";
import {SubmitButton} from "@/components/form/submit-button";
import {EMPTY_ACTION_STATE} from "@/components/form/utils/to-action-state";
import {startPayment} from "../actions/start-payment";

// Sends the customer to Xendit's hosted checkout, where they choose GCash,
// Maya, QR Ph, credit/debit card, etc. Payment lands in the IslandGo Xendit account.
const PayForm = ({bookingId}: { bookingId: string }) => {
    const [state, action] = useActionState(startPayment.bind(null, bookingId), EMPTY_ACTION_STATE);

    return (
        <Form action={action} actionState={state}>
            <SubmitButton label="Pay now (GCash, Maya, QR Ph, card)"/>
        </Form>
    );
};

export {PayForm};
