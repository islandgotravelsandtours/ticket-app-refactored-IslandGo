"use server";

import {revalidatePath} from "next/cache";
import {fromErrorToActionState, toActionState,} from "@/components/form/utils/to-action-state";
import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {isOwner} from "@/features/auth/utils/is-owner";
import {prisma} from "@/lib/prisma";
import {tourPath} from "@/paths";

export const deleteComment = async (id: string) => {
    const {user} = await getAuthOrRedirect();

    const comment = await prisma.comment.findUnique({
        where: {id},
    });

    if (!comment || !isOwner(user, comment)) {
        return toActionState("ERROR", "Not authorized");
    }

    try {
        await prisma.comment.delete({
            where: {id},
        });
    } catch (error) {
        return fromErrorToActionState(error);
    }

    revalidatePath(tourPath(comment.tourId));

    return toActionState("SUCCESS", "Comment deleted");
};