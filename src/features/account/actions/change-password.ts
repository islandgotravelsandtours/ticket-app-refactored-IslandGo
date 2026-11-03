"use server";

import {hash, verify} from "@node-rs/argon2";
import {cookies} from "next/headers";
import {z} from "zod";
import {ActionState, fromErrorToActionState, toActionState,} from "@/components/form/utils/to-action-state";
import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {lucia} from "@/lib/lucia";
import {prisma} from "@/lib/prisma";

const schema = z
    .object({
        currentPassword: z.string().min(1, "Is required").max(191),
        newPassword: z.string().min(6, "Must be at least 6 characters").max(191),
        confirmPassword: z.string().min(1, "Is required").max(191),
    })
    .superRefine(({currentPassword, newPassword, confirmPassword}, ctx) => {
        if (newPassword !== confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords do not match",
                path: ["confirmPassword"],
            });
        }
        if (newPassword && newPassword === currentPassword) {
            ctx.addIssue({
                code: "custom",
                message: "New password must be different from the current one",
                path: ["newPassword"],
            });
        }
    });

// Never echo passwords back to the browser (no payload on any return below).
export const changePassword = async (_actionState: ActionState, formData: FormData) => {
    const {user} = await getAuthOrRedirect();

    try {
        const {currentPassword, newPassword} = schema.parse({
            currentPassword: formData.get("currentPassword"),
            newPassword: formData.get("newPassword"),
            confirmPassword: formData.get("confirmPassword"),
        });

        const record = await prisma.user.findUnique({
            where: {id: user.id},
            select: {passwordHash: true},
        });

        if (!record || !(await verify(record.passwordHash, currentPassword))) {
            return {
                status: "ERROR",
                message: "",
                fieldErrors: {currentPassword: ["Current password is incorrect"]},
                timestamp: Date.now(),
            } satisfies ActionState;
        }

        await prisma.user.update({
            where: {id: user.id},
            data: {passwordHash: await hash(newPassword)},
        });

        // Sign out every other device, then keep this one signed in.
        await lucia.invalidateUserSessions(user.id);
        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        (await cookies()).set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );
    } catch (error) {
        return fromErrorToActionState(error);
    }

    return toActionState("SUCCESS", "Password changed. Other devices were signed out.");
};
