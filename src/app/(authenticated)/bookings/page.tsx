import {Heading} from "@/components/heading";
import {Placeholder} from "@/components/placeholder";
import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {isAdmin} from "@/features/auth/utils/is-admin";
import {BookingItem} from "@/features/booking/components/booking-item";
import {getBookings} from "@/features/booking/queries/get-bookings";

const BookingsPage = async () => {
    const {user} = await getAuthOrRedirect();
    const admin = isAdmin(user);
    const bookings = await getBookings();

    return (
        <div className="flex-1 flex flex-col gap-y-8">
            <Heading
                title={admin ? "All Bookings" : "My Bookings"}
                description={
                    admin
                        ? "Every customer booking and its payment status"
                        : "Your reservations. Pay to confirm your seat."
                }
            />

            {bookings.length ? (
                <div className="flex flex-col items-center gap-y-4">
                    {bookings.map((booking) => (
                        <BookingItem key={booking.id} booking={booking} isAdmin={admin}/>
                    ))}
                </div>
            ) : (
                <Placeholder label="No bookings yet"/>
            )}
        </div>
    );
};

export default BookingsPage;
