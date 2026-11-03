import Link from "next/link";
import {notFound} from "next/navigation";
import {Heading} from "@/components/heading";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {PaymentStatusBadge} from "@/features/payment/components/payment-status-badge";
import {ReceiptActions} from "@/features/payment/components/receipt-actions";
import {getPayment} from "@/features/payment/queries/get-payments";
import {reconcilePayment} from "@/features/payment/settle";
import {methodLabel} from "@/lib/xendit";
import {bookingsPath, transactionsPath} from "@/paths";
import {toCurrencyFromCent} from "@/utils/currency";

const fmt = (d: Date | null) =>
    d
        ? new Intl.DateTimeFormat("en-PH", {dateStyle: "long", timeStyle: "short", timeZone: "Asia/Manila"}).format(d)
        : "—";

type Props = { params: Promise<{ paymentId: string }> };

const ReceiptPage = async ({params}: Props) => {
    const {paymentId} = await params;

    // Ownership check first, then ask Xendit directly if it's still pending
    // (covers a webhook that hasn't arrived yet).
    if (!(await getPayment(paymentId))) notFound();
    await reconcilePayment(paymentId);
    const payment = await getPayment(paymentId);
    if (!payment) notFound();

    const {booking} = payment;
    const rows: [string, string][] = [
        ["Receipt no.", payment.referenceNumber],
        ["Date", fmt(payment.paidAt ?? payment.createdAt)],
        ["Customer", `${payment.user.username} (${payment.user.email})`],
        ["Tour", `${booking.tour.title} — ${booking.tour.destination}`],
        ["Departure", booking.tour.departureDate],
        ["Guests", String(booking.guests)],
        ["Payment method", methodLabel(payment.method)],
        ...(payment.gatewayPaymentId ? [["Gateway payment ID", payment.gatewayPaymentId] as [string, string]] : []),
        ...(payment.failureReason ? [["Note", payment.failureReason] as [string, string]] : []),
    ];

    return (
        <div className="flex-1 flex flex-col gap-y-8">
            <Heading title="Payment Receipt" description="Keep this for your records"/>

            <div className="flex flex-col items-center gap-y-4 px-4">
                {payment.status === "PENDING" && (
                    <p className="max-w-[580px] rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm print:hidden">
                        Waiting for the payment gateway to confirm your payment. This page updates automatically — please
                        don&apos;t close it.
                    </p>
                )}

                <Card className="w-full max-w-[580px]">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>IslandGo</span>
                            <PaymentStatusBadge status={payment.status}/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-y-3 text-sm">
                        <dl className="flex flex-col gap-y-2">
                            {rows.map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-x-4">
                                    <dt className="text-muted-foreground">{k}</dt>
                                    <dd className="text-right font-medium break-all">{v}</dd>
                                </div>
                            ))}
                        </dl>
                        <div className="flex justify-between border-t pt-3 text-base">
                            <span className="font-semibold">Amount {payment.status === "PAID" ? "paid" : "due"}</span>
                            <span className="font-bold">{toCurrencyFromCent(payment.amount)}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-x-2 print:hidden">
                    <ReceiptActions pending={payment.status === "PENDING"}/>
                    <Button asChild variant="outline">
                        <Link href={transactionsPath()}>All transactions</Link>
                    </Button>
                    <Button asChild>
                        <Link href={bookingsPath()}>My bookings</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptPage;
