import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {isAdmin} from "@/features/auth/utils/is-admin";
import {prisma} from "@/lib/prisma";

const include = {
    booking: {
        select: {
            guests: true,
            tour: {select: {id: true, title: true, destination: true, departureDate: true}},
        },
    },
    user: {select: {username: true, email: true}},
} as const;

export type PaymentWithDetails = Awaited<ReturnType<typeof getPayments>>["payments"][number];

// Admin sees every transaction; a customer only their own.
export const getPayments = async () => {
    const {user} = await getAuthOrRedirect();
    const admin = isAdmin(user);
    const where = admin ? {} : {userId: user.id};

    const [payments, totals] = await Promise.all([
        prisma.payment.findMany({where, orderBy: {createdAt: "desc"}, include}),
        prisma.payment.aggregate({
            where: {...where, status: "PAID"},
            _sum: {amount: true},
            _count: true,
        }),
    ]);

    return {payments, admin, totals};
};

export const getPayment = async (paymentId: string) => {
    const {user} = await getAuthOrRedirect();
    const payment = await prisma.payment.findUnique({where: {id: paymentId}, include});

    if (!payment || (!isAdmin(user) && payment.userId !== user.id)) return null;
    return payment;
};
