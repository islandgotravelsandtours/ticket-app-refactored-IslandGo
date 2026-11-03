"use client";

import {Camera} from "lucide-react";
import {useActionState, useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {FieldError} from "@/components/form/field-error";
import {Form} from "@/components/form/form";
import {SubmitButton} from "@/components/form/submit-button";
import {EMPTY_ACTION_STATE} from "@/components/form/utils/to-action-state";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {updateProfile} from "../actions/update-profile";

const MAX_MB = 2;

type ProfileFormProps = {
    fullName: string | null;
    username: string;
    email: string;
    avatarUrl: string | null;
};

const ProfileForm = ({fullName, username, email, avatarUrl}: ProfileFormProps) => {
    const [actionState, action] = useActionState(updateProfile, EMPTY_ACTION_STATE);
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [remove, setRemove] = useState(false);

    // free the temporary preview URL
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            setPreview(null);
            return;
        }

        if (file.size > MAX_MB * 1024 * 1024) {
            toast.error(`Photo must be ${MAX_MB}MB or smaller`);
            e.target.value = "";
            setPreview(null);
            return;
        }

        setRemove(false);
        setPreview(URL.createObjectURL(file));
    };

    const handleSuccess = () => {
        if (fileRef.current) fileRef.current.value = "";
        setPreview(null);
        setRemove(false);
        // tell the header to re-read the user so the new photo shows immediately
        window.dispatchEvent(new Event("auth-changed"));
    };

    const shown = remove ? null : (preview ?? avatarUrl);

    return (
        <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
            <div className="flex items-center gap-x-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={shown ?? undefined} alt="Profile photo" className="object-cover"/>
                    <AvatarFallback className="text-3xl">
                        {(fullName || username)[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-y-2">
                    <Label
                        htmlFor="avatar"
                        className="inline-flex w-fit cursor-pointer items-center gap-x-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                        <Camera className="h-4 w-4"/>
                        {avatarUrl || preview ? "Change photo" : "Upload photo"}
                    </Label>
                    <input
                        ref={fileRef}
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={handleFile}
                    />
                    <p className="text-xs text-muted-foreground">JPG, PNG or WebP, up to {MAX_MB}MB.</p>

                    {avatarUrl && !preview && (
                        <label className="flex items-center gap-x-2 text-sm">
                            <input
                                type="checkbox"
                                name="removeAvatar"
                                checked={remove}
                                onChange={(e) => setRemove(e.target.checked)}
                            />
                            Remove current photo
                        </label>
                    )}
                </div>
            </div>

            <Label htmlFor="fullName">Full name</Label>
            <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                placeholder="e.g. Juan Dela Cruz"
                defaultValue={(actionState.payload?.get("fullName") as string) ?? fullName ?? ""}
            />
            <FieldError actionState={actionState} name="fullName"/>

            <Label htmlFor="username">Username (no spaces)</Label>
            <Input
                id="username"
                name="username"
                autoComplete="username"
                defaultValue={(actionState.payload?.get("username") as string) ?? username}
            />
            <FieldError actionState={actionState} name="username"/>

            <Label htmlFor="email">Email</Label>
            <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={(actionState.payload?.get("email") as string) ?? email}
            />
            <FieldError actionState={actionState} name="email"/>

            <SubmitButton label="Save changes"/>
        </Form>
    );
};

export {ProfileForm};
