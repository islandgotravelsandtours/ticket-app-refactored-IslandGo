"use server";

import {TourStatus} from "@prisma/client";
import {revalidatePath} from "next/cache";
import {fromErrorToActionState, toActionState,} from "@/components/form/utils/to-action-state";
import {getAdminOrRedirect} from "@/features/auth/queries/get-admin-or-redirect";
import {prisma} from "@/lib/prisma";
import {toursPath} from "@/paths";

export const updateTourStatus = async (id: string, status: TourStatus) => {
    await getAdminOrRedirect();

    try {
        await prisma.tour.update({
            where: {
                id,
            },
            data: {
                status,
            },
        });
    } catch (error) {
        return fromErrorToActionState(error);
    }

    revalidatePath(toursPath());

    return toActionState("SUCCESS", "Status updated");
};