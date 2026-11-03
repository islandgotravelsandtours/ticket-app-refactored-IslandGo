"use client";

import clsx from "clsx";
import {ArrowUpRightFromSquare, MapPin, MoreVertical, Pencil} from "lucide-react";
import Link from "next/link";
import {ImageCarousel} from "@/components/image-carousel";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {tourEditPath, tourPath} from "@/paths";
import {toCurrencyFromCent} from "@/utils/currency";
import {TOUR_ICONS} from "../constants";
import {TourWithMetadata} from "../types";
import {getTourImages} from "../utils/get-tour-images";
import {TourMoreMenu} from "./tour-more-menu";

type TourItemProps = {
    tour: TourWithMetadata;
    isDetail?: boolean;
    booking?: React.ReactNode;
    comments?: React.ReactNode;
};

const TourItem = ({tour, isDetail, booking, comments}: TourItemProps) => {
    const detailButton = (
        <Button variant="outline" size="icon" asChild>
            <Link prefetch href={tourPath(tour.id)}>
                <ArrowUpRightFromSquare className="h-4 w-4"/>
            </Link>
        </Button>
    );

    const editButton = tour.isOwner ? (
        <Button variant="outline" size="icon" asChild>
            <Link prefetch href={tourEditPath(tour.id)}>
                <Pencil className="h-4 w-4"/>
            </Link>
        </Button>
    ) : null;

    const moreMenu = tour.isOwner ? (
        <TourMoreMenu
            tour={tour}
            trigger={
                <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4"/>
                </Button>
            }
        />
    ) : null;

    return (
        <div
            className={clsx("w-full flex flex-col gap-y-4", {
                "max-w-[580px]": isDetail,
                "max-w-[420px]": !isDetail,
            })}
        >
            <div className="flex gap-x-2">
                <Card className="w-full overflow-hidden">
                    <ImageCarousel
                        images={getTourImages(tour)}
                        alt={tour.title}
                        className="aspect-video w-full"
                    />
                    <CardHeader>
                        <CardTitle className="flex gap-x-2">
                            <span>{TOUR_ICONS[tour.status]}</span>
                            <span className="truncate">{tour.title}</span>
                        </CardTitle>
                        {tour.destination ? (
                            <p className="flex items-center gap-x-1 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4"/>
                                {tour.destination}
                            </p>
                        ) : null}
                    </CardHeader>
                    <CardContent>
            <span
                className={clsx("whitespace-break-spaces", {
                    "line-clamp-3": !isDetail,
                })}
            >
              {tour.content}
            </span>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <p className="text-sm text-muted-foreground">
                            Departs {tour.departureDate} · hosted by {tour.user.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {toCurrencyFromCent(tour.price)} / person
                        </p>
                    </CardFooter>
                </Card>

                <div className="flex flex-col gap-y-1">
                    {isDetail ? (
                        <>
                            {editButton}
                            {moreMenu}
                        </>
                    ) : (
                        <>
                            {detailButton}
                            {editButton}
                        </>
                    )}
                </div>
            </div>

            {booking}
            {comments}
        </div>
    );
};

export {TourItem};