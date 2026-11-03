"use client";

import {useQueryState, useQueryStates} from "nuqs";
import {useEffect, useRef} from "react";
import {Pagination} from "@/components/pagination";
import {PaginatedData} from "@/types/pagination";
import {paginationOptions, paginationParser, searchParser,} from "../search-params";
import {TourWithMetadata} from "../types";

type TourPaginationProps = {
    paginatedTourMetadata: PaginatedData<TourWithMetadata>["metadata"];
};

const TourPagination = ({
                              paginatedTourMetadata,
                          }: TourPaginationProps) => {
    const [pagination, setPagination] = useQueryStates(
        paginationParser,
        paginationOptions
    );

    const [search] = useQueryState("search", searchParser);
    const prevSearch = useRef(search);

    useEffect(() => {
        if (search === prevSearch.current) return;
        prevSearch.current = search;

        setPagination({...pagination, page: 0});

        // add more reactive effects here once needed ...
    }, [search, pagination, setPagination]);

    return (
        <Pagination
            pagination={pagination}
            onPagination={setPagination}
            paginatedMetadata={paginatedTourMetadata}
        />
    );
};

export {TourPagination};