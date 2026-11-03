"use server";

import {revalidatePath} from "next/cache";
import {z} from "zod";
import {ActionState, fromErrorToActionState, toActionState,} from "@/components/form/utils/to-action-state";
import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {prisma} from "@/lib/prisma";
import {tourPath} from "@/paths";

const createCommentSchema = z.object({
    content: z.string().min(1).max(1024),
});

export const createComment = async (
    tourId: string,
    _actionState: ActionState,
    formData: FormData
) => {
    const {user} = await getAuthOrRedirect();

    let comment;

    try {
        const data = createCommentSchema.parse(Object.fromEntries(formData));

        comment = await prisma.comment.create({
            data: {
                userId: user.id,
                tourId: tourId,
                ...data,
            },
            include: {
                user: true,
            },
        });
    } catch (error) {
        return fromErrorToActionState(error);
    }

    revalidatePath(tourPath(tourId));

    return toActionState("SUCCESS", "Comment created", undefined, {
        ...comment,
        isOwner: true,
    });
};