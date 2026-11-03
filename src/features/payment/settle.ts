import {prisma} from "@/lib/prisma";
import {getInvoice} from "@/lib/xendit";

// The ONLY code that may mark a payment PAID. We never trust the webhook body:
// it only tells us WHICH invoice to look at, then we ask Xendit directly for
// its real status and amount. Idempotent: safe to run any number of times.
export const settleInvoice = async (invoiceId: string) => {
    const payment = await prisma.payment.findUnique({where: {invoiceId}});
    if (!payment || payment.status === "PAID") return payment;

    const invoice = await getInvoice(invoiceId);

    if (invoice.status === "PAID" || invoice.status === "SETTLED") {
        // Never accept a payment whose amount differs from what we billed.
        if (Math.round(invoice.amount * 100) !== payment.amount) {
            console.error(`Payment ${payment.id}: amount mismatch (${payment.amount} vs ${invoice.amount})`);
            return prisma.payment.update({
                where: {id: payment.id},
                data: {status: "FAILED", failureReason: "Amount mismatch — contact support"},
            });
        }

        return prisma.$transaction(async (tx) => {
            const claimed = await tx.payment.updateMany({
                where: {id: payment.id, status: {not: "PAID"}},
                data: {
                    status: "PAID",
                    paidAt: invoice.paid_at ? new Date(invoice.paid_at) : new Date(),
                    method: invoice.payment_channel ?? invoice.payment_method ?? null,
                    gatewayPaymentId: invoice.payment_id ?? null,
                    failureReason: null,
                },
            });

            if (claimed.count > 0) {
                await tx.booking.update({
                    where: {id: payment.bookingId},
                    data: {status: "PAID", paidAt: new Date(), paymentRef: payment.referenceNumber},
                });
            }

            return tx.payment.findUnique({where: {id: payment.id}});
        });
    }

    if (invoice.status === "EXPIRED") {
        return prisma.payment.updateMany({
            where: {id: payment.id, status: "PENDING"},
            data: {status: "CANCELLED", failureReason: "Checkout expired"},
        }).then(() => prisma.payment.findUnique({where: {id: payment.id}}));
    }

    return payment;
};

// Webhooks can lag, so for a still-PENDING payment ask Xendit directly.
// Safe to call on every receipt view.
export const reconcilePayment = async (paymentId: string) => {
    const payment = await prisma.payment.findUnique({where: {id: paymentId}});
    if (!payment || payment.status !== "PENDING" || !payment.invoiceId) return payment;

    try {
        return (await settleInvoice(payment.invoiceId)) ?? payment;
    } catch (error) {
        console.error("Payment reconcile failed:", error);
        return payment;
    }
};
