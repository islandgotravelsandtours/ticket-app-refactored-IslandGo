import {getTours} from "@/features/tour/queries/get-tours";
import {searchParamsCache} from "@/features/tour/search-params";

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);

    const untypedSearchParams = Object.fromEntries(searchParams);
    const typedSearchParams = searchParamsCache.parse(untypedSearchParams);

    const {list, metadata} = await getTours(undefined, typedSearchParams);

    return Response.json({list, metadata});
}