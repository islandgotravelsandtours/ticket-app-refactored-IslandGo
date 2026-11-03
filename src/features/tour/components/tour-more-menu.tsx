"use client";

import {Tour, TourStatus} from "@prisma/client";
import {Trash} from "lucide-react";
import {toast} from "sonner";
import {useConfirmDialog} from "@/components/confirm-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {deleteTour} from "../actions/delete-tour";
import {updateTourStatus} from "../actions/update-tour-status";
import {TOUR_STATUS_LABELS} from "../constants";

type TourMoreMenuProps = {
    tour: Tour;
    trigger: React.ReactElement;
};

const TourMoreMenu = ({tour, trigger}: TourMoreMenuProps) => {
    const [deleteButton, deleteDialog] = useConfirmDialog({
        action: deleteTour.bind(null, tour.id),
        trigger: (
            <DropdownMenuItem>
                <Trash className="h-4 w-4"/>
                <span>Delete</span>
            </DropdownMenuItem>
        ),
    });

    const handleUpdateTourStatus = async (value: string) => {
        const promise = updateTourStatus(tour.id, value as TourStatus);

        toast.promise(promise, {
            loading: "Updating status...",
        });

        const result = await promise;

        if (result.status === "ERROR") {
            toast.error(result.message);
        } else if (result.status === "SUCCESS") {
            toast.success(result.message);
        }
    };

    const tourStatusRadioGroupItems = (
        <DropdownMenuRadioGroup
            value={tour.status}
            onValueChange={handleUpdateTourStatus}
        >
            {(Object.keys(TOUR_STATUS_LABELS) as Array<TourStatus>).map((key) => (
                <DropdownMenuRadioItem key={key} value={key}>
                    {TOUR_STATUS_LABELS[key]}
                </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
    );

    return (
        <>
            {deleteDialog}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" side="right">
                    {tourStatusRadioGroupItems}
                    <DropdownMenuSeparator/>
                    {deleteButton}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export {TourMoreMenu};