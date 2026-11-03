import {randomUUID} from "node:crypto";

const BUCKET = "tour-images";
const AVATAR_FOLDER = "avatars/";
const EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

const config = () => {
    const baseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!baseUrl || !serviceKey) {
        throw new Error(
            "Image upload is not set up. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env"
        );
    }

    return {baseUrl, serviceKey};
};

// Uploads to a PUBLIC Supabase Storage bucket and returns the public URL.
const upload = async (file: File, folder: string, maxSizeMb: number) => {
    const {baseUrl, serviceKey} = config();

    const extension = EXTENSIONS[file.type];

    if (!extension) {
        throw new Error("Image must be a JPG, PNG or WebP file");
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
        throw new Error(`Image must be ${maxSizeMb}MB or smaller`);
    }

    const path = `${folder}${randomUUID()}.${extension}`;

    const response = await fetch(
        `${baseUrl}/storage/v1/object/${BUCKET}/${path}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${serviceKey}`,
                "Content-Type": file.type,
            },
            body: new Uint8Array(await file.arrayBuffer()),
        }
    );

    if (!response.ok) {
        throw new Error("Image upload failed. Check that the tour-images bucket exists.");
    }

    return `${baseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
};

export const uploadTourImage = (file: File) => upload(file, "", 5);

// Profile photos live in the same bucket, under avatars/.
export const uploadAvatar = (file: File) => upload(file, AVATAR_FOLDER, 2);

// Best-effort cleanup of an old profile photo. Only ever touches avatars/.
export const deleteAvatar = async (url: string) => {
    try {
        const {baseUrl, serviceKey} = config();
        const prefix = `${baseUrl}/storage/v1/object/public/${BUCKET}/`;

        if (!url.startsWith(`${prefix}${AVATAR_FOLDER}`)) return;

        await fetch(`${baseUrl}/storage/v1/object/${BUCKET}/${url.slice(prefix.length)}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${serviceKey}`},
        });
    } catch {
        // an orphaned file is harmless; never fail the request over it
    }
};
