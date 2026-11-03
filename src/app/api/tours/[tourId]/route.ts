import {getTour} from "@/features/tour/queries/get-tour";

export async function GET(
    _request: Request,
    {params}: { params: Promise<{ tourId: string }> }
) {
    const {tourId} = await params;
    const tour = await getTour(tourId);

    return Response.json(tour);
}