"use client";

import {useActionState, useRef} from "react";
import {FieldError} from "@/components/form/field-error";
import {Form} from "@/components/form/form";
import {SubmitButton} from "@/components/form/submit-button";
import {EMPTY_ACTION_STATE} from "@/components/form/utils/to-action-state";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {changePassword} from "../actions/change-password";

const PasswordForm = () => {
    const [actionState, action] = useActionState(changePassword, EMPTY_ACTION_STATE);
    const fieldsRef = useRef<HTMLDivElement>(null);

    // clear the three fields after a successful change
    const handleSuccess = () => {
        fieldsRef.current?.querySelectorAll("input").forEach((input) => {
            input.value = "";
        });
    };

    return (
        <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
            <div ref={fieldsRef} className="flex flex-col gap-y-4">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                />
                <FieldError actionState={actionState} name="currentPassword"/>

                <Label htmlFor="newPassword">New password</Label>
                <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                />
                <FieldError actionState={actionState} name="newPassword"/>

                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                />
                <FieldError actionState={actionState} name="confirmPassword"/>
            </div>

            <SubmitButton label="Change password"/>
        </Form>
    );
};

export {PasswordForm};
