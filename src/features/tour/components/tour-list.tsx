import {Placeholder} from "@/components/placeholder";
import {getTours} from "../queries/get-tours";
import {ParsedSearchParams} from "../search-params";
import {TourCard} from "./tour-card";
import {TourPagination} from "./tour-pagination";
import {TourSearchInput} from "./tour-search-input";
import {TourSortSelect} from "./tour-sort-select";

type TourListProps = {
    userId?: string;
    searchParams: ParsedSearchParams;
};

const TourList = async ({userId, searchParams}: TourListProps) => {
    const {list: tours, metadata: tourMetadata} = await getTours(
        userId,
        searchParams
    );

    return (
        <div className="flex w-full flex-1 flex-col gap-y-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-sm">
                    <TourSearchInput placeholder="Search by tour or destination"/>
                </div>
                <div className="w-full sm:w-52">
                    <TourSortSelect
                        options={[
                            {sortKey: "createdAt", sortValue: "desc", label: "Newest"},
                            {sortKey: "createdAt", sortValue: "asc", label: "Oldest"},
                            {sortKey: "price", sortValue: "asc", label: "Price: low to high"},
                            {sortKey: "price", sortValue: "desc", label: "Price: high to low"},
                        ]}
                    />
                </div>
            </div>

            {tours.length ? (
                <div className="grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {tours.map((tour) => (
                        <TourCard key={tour.id} tour={tour}/>
                    ))}
                </div>
            ) : (
                <Placeholder label="No tours match your search"/>
            )}

            <div className="w-full">
                <TourPagination paginatedTourMetadata={tourMetadata}/>
            </div>
        </div>
    );
};

export {TourList};
