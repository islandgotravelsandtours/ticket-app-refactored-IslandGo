export const MAX_TOUR_IMAGES = 4;

// Falls back to the old single imageUrl so tours created before the
// carousel update keep their picture.
export const getTourImages = (tour: {
    images?: string[] | null;
    imageUrl?: string | null;
}) => {
    if (tour.images?.length) return tour.images;
    return tour.imageUrl ? [tour.imageUrl] : [];
};
