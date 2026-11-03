"use server";

import {Prisma} from "@prisma/client";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {ActionState, fromErrorToActionState, toActionState,} from "@/components/form/utils/to-action-state";
import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {prisma} from "@/lib/prisma";
import {deleteAvatar, uploadAvatar} from "@/lib/upload-image";
import {accountProfilePath} from "@/paths";

const schema = z.object({
    fullName: z.string().trim().max(191).optional(),
    username: z.string().trim().min(1, "Is required").max(191),
    email: z.string().trim().min(1, {message: "Is required"}).max(191).email(),
});

// Files can't be sent back to the browser, so only echo the text fields.
const textOnly = (formData: FormData) => {
    const copy = new FormData();
    for (const key of ["fullName", "username", "email"]) {
        const value = formData.get(key);
        if (typeof value === "string") copy.set(key, value);
    }
    return copy;
};

export const updateProfile = async (_actionState: ActionState, formData: FormData) => {
    const {user} = await getAuthOrRedirect();
    let uploadedUrl: string | undefined;

    try {
        const parsed = schema.parse({
            fullName: formData.get("fullName") ?? undefined,
            username: formData.get("username"),
            email: formData.get("email"),
        });

        // New usernames can't contain spaces (that's what Full name is for),
        // but don't block people whose existing username already has one.
        if (parsed.username !== user.username && parsed.username.includes(" ")) {
            return toActionState(
                "ERROR",
                "Username cannot contain spaces. Put your full name in the Full name field.",
                textOnly(formData)
            );
        }

        const data = {
            fullName: parsed.fullName ? parsed.fullName : null,
            username: parsed.username,
            email: parsed.email,
        };

        const file = formData.get("avatar");
        const removeAvatar = formData.get("removeAvatar") === "on";

        // undefined = leave the photo alone, null = remove it, string = new photo
        let avatarUrl: string | null | undefined;

        if (file instanceof File && file.size > 0) {
            uploadedUrl = await uploadAvatar(file);
            avatarUrl = uploadedUrl;
        } else if (removeAvatar) {
            avatarUrl = null;
        }

        const current = await prisma.user.findUnique({
            where: {id: user.id},
            select: {avatarUrl: true},
        });

        await prisma.user.update({
            where: {id: user.id},
            data: {...data, ...(avatarUrl !== undefined ? {avatarUrl} : {})},
        });

        if (avatarUrl !== undefined && current?.avatarUrl) {
            await deleteAvatar(current.avatarUrl);
        }
    } catch (error) {
        // Don't leave a just-uploaded photo behind if saving failed.
        if (uploadedUrl) await deleteAvatar(uploadedUrl);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return toActionState(
                "ERROR",
                "Either email or username is already in use",
                textOnly(formData)
            );
        }

        return fromErrorToActionState(error, textOnly(formData));
    }

    revalidatePath(accountProfilePath());
    revalidatePath("/", "layout");

    return toActionState("SUCCESS", "Profile updated");
};
