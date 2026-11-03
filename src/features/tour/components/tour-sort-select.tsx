"use client";

import {useQueryStates} from "nuqs";
import {SortSelect, SortSelectOption} from "@/components/sort-select";
import {sortOptions, sortParser} from "../search-params";

type TourSortSelectProps = {
    options: SortSelectOption[];
};

const TourSortSelect = ({options}: TourSortSelectProps) => {
    const [sort, setSort] = useQueryStates(sortParser, sortOptions);

    return <SortSelect value={sort} onChange={setSort} options={options}/>;
};

export {TourSortSelect};