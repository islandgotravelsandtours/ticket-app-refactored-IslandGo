"use client";

import {Tour} from "@prisma/client";
import {useActionState, useRef} from "react";
import {DatePicker, ImperativeHandleFromDatePicker,} from "@/components/data-picker";
import {FieldError} from "@/components/form/field-error";
import {Form} from "@/components/form/form";
import {SubmitButton} from "@/components/form/submit-button";
import {EMPTY_ACTION_STATE} from "@/components/form/utils/to-action-state";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {fromCent} from "@/utils/currency";
import {upsertTour} from "../actions/upsert-tour";
import {getTourImages, MAX_TOUR_IMAGES} from "../utils/get-tour-images";

type TourUpsertFormProps = {
    tour?: Tour;
};

const TourUpsertForm = ({tour}: TourUpsertFormProps) => {
    const [actionState, action] = useActionState(
        upsertTour.bind(null, tour?.id),
        EMPTY_ACTION_STATE
    );

    const datePickerImperativeHandleRef =
        useRef<ImperativeHandleFromDatePicker>(null);

    const currentImages = tour ? getTourImages(tour) : [];

    const handleSuccess = () => {
        datePickerImperativeHandleRef.current?.reset();
    };

    return (
        <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
            <Label htmlFor="title">Title</Label>
            <Input
                id="title"
                name="title"
                type="text"
                defaultValue={
                    (actionState.payload?.get("title") as string) ?? tour?.title
                }
            />
            <FieldError actionState={actionState} name="title"/>

            <Label htmlFor="destination">Destination</Label>
            <Input
                id="destination"
                name="destination"
                type="text"
                placeholder="e.g. Palawan, Philippines"
                defaultValue={
                    (actionState.payload?.get("destination") as string) ??
                    tour?.destination
                }
            />
            <FieldError actionState={actionState} name="destination"/>

            <Label htmlFor="content">Itinerary &amp; details</Label>
            <Textarea
                id="content"
                name="content"
                defaultValue={
                    (actionState.payload?.get("content") as string) ?? tour?.content
                }
            />
            <FieldError actionState={actionState} name="content"/>

            <div className="flex gap-x-2 mb-1">
                <div className="w-1/2">
                    <Label htmlFor="departureDate">Departure date</Label>
                    <DatePicker
                        id="departureDate"
                        name="departureDate"
                        defaultValue={
                            (actionState.payload?.get("departureDate") as string) ??
                            tour?.departureDate
                        }
                        imperativeHandleRef={
                            datePickerImperativeHandleRef as React.RefObject<ImperativeHandleFromDatePicker>
                        }
                    />
                    <FieldError actionState={actionState} name="departureDate"/>
                </div>
                <div className="w-1/2">
                    <Label htmlFor="price">Price per person ($)</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        step=".01"
                        defaultValue={
                            (actionState.payload?.get("price") as string) ??
                            (tour?.price ? fromCent(tour?.price) : "")
                        }
                    />
                    <FieldError actionState={actionState} name="price"/>
                </div>
            </div>

            <Label htmlFor="images">Tour images (up to {MAX_TOUR_IMAGES})</Label>
            {currentImages.length ? (
                <div className="grid grid-cols-2 gap-2">
                    {currentImages.map((url, i) => (
                        <label
                            key={url}
                            className="relative block cursor-pointer overflow-hidden rounded-md border"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={url}
                                alt={`Current image ${i + 1}`}
                                className="h-24 w-full object-cover"
                            />
                            {i === 0 ? (
                                <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                                    Cover
                                </span>
                            ) : null}
                            <span className="flex items-center gap-x-1.5 bg-muted px-2 py-1 text-xs">
                                <input type="checkbox" name="removeImages" value={url}/>
                                Remove
                            </span>
                        </label>
                    ))}
                </div>
            ) : null}
            <Input
                id="images"
                name="images"
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
            />
            <p className="text-xs text-muted-foreground">
                JPG, PNG or WebP, up to 5MB each. Select several files at once. The
                first image is the cover. Max {MAX_TOUR_IMAGES} total, including
                current images you keep.
            </p>

            <Label htmlFor="imageUrls">Image links (optional)</Label>
            <Textarea
                id="imageUrls"
                name="imageUrls"
                rows={3}
                placeholder={"https://example.com/photo-1.jpg\nhttps://example.com/photo-2.jpg"}
                defaultValue={(actionState.payload?.get("imageUrls") as string) ?? ""}
            />
            <FieldError actionState={actionState} name="imageUrls"/>
            <p className="text-xs text-muted-foreground">
                One link per line. Files and links share the same limit.
            </p>

            <SubmitButton label={tour ? "Edit" : "Create"}/>
        </Form>
    );
};

export {TourUpsertForm};