"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {z} from "zod";
import {setCookieByKey} from "@/actions/cookies";
import {ActionState, fromErrorToActionState, toActionState,} from "@/components/form/utils/to-action-state";
import {getAdminOrRedirect} from "@/features/auth/queries/get-admin-or-redirect";
import {prisma} from "@/lib/prisma";
import {uploadTourImage} from "@/lib/upload-image";
import {tourPath, toursPath} from "@/paths";
import {toCent} from "@/utils/currency";
import {getTourImages, MAX_TOUR_IMAGES} from "../utils/get-tour-images";

const upsertTourSchema = z.object({
    title: z.string().min(1).max(191),
    destination: z.string().min(1).max(191),
    content: z.string().min(1).max(1024),
    departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Is required"),
    price: z.coerce.number().positive(),
    // optional: image links, one per line
    imageUrls: z
        .string()
        .default("")
        .transform((value) => value.split(/\s+/).filter(Boolean))
        .pipe(
            z.array(
                z
                    .string()
                    .max(2048, "URL is too long")
                    .refine((url) => {
                        try {
                            const {protocol} = new URL(url);
                            return protocol === "https:" || protocol === "http:";
                        } catch {
                            return false;
                        }
                    }, "Each image link must be a valid http(s) URL")
            )
        ),
});

// Files can't be sent back to the browser, so drop them from the returned payload.
const withoutFiles = (formData: FormData) => {
    const copy = new FormData();
    formData.forEach((value, key) => {
        if (typeof value === "string") copy.append(key, value);
    });
    return copy;
};

export const upsertTour = async (
    id: string | undefined,
    _actionState: ActionState,
    formData: FormData
) => {
    const {user} = await getAdminOrRedirect();

    try {
        const data = upsertTourSchema.parse({
            title: formData.get("title"),
            destination: formData.get("destination"),
            content: formData.get("content"),
            departureDate: formData.get("departureDate"),
            price: formData.get("price"),
            imageUrls: formData.get("imageUrls") ?? undefined,
        });

        // Images already on the tour (minus any the admin ticked "Remove" on).
        const current = id
            ? await prisma.tour.findUnique({
                where: {id},
                select: {images: true, imageUrl: true},
            })
            : null;
        const removed = new Set(
            formData.getAll("removeImages").filter((v) => typeof v === "string")
        );
        const kept = current
            ? getTourImages(current).filter((url) => !removed.has(url))
            : [];

        const files = formData
            .getAll("images")
            .filter((f): f is File => f instanceof File && f.size > 0);

        // Check the total BEFORE uploading anything.
        if (kept.length + files.length + data.imageUrls.length > MAX_TOUR_IMAGES) {
            throw new Error(
                `A tour can have up to ${MAX_TOUR_IMAGES} images (${kept.length} kept + ${files.length} files + ${data.imageUrls.length} links).`
            );
        }

        const uploaded: string[] = [];
        for (const file of files) {
            uploaded.push(await uploadTourImage(file));
        }

        // Order: kept first, then new uploads, then pasted links. First = cover.
        const images = Array.from(new Set([...kept, ...uploaded, ...data.imageUrls]));

        const {imageUrls, ...tourData} = data;
        void imageUrls;

        const dbData = {
            ...tourData,
            price: toCent(tourData.price),
            images,
            imageUrl: images[0] ?? null, // cover used by cards and the home page
        };

        await prisma.tour.upsert({
            where: {id: id || ""},
            update: dbData,
            create: {...dbData, userId: user.id},
        });
    } catch (error) {
        return fromErrorToActionState(error, withoutFiles(formData));
    }

    revalidatePath(toursPath());

    if (id) {
        await setCookieByKey("toast", "Tour updated");
        redirect(tourPath(id));
    }

    return toActionState("SUCCESS", "Tour created");
};