import Link from "next/link";
import {Receipt} from "lucide-react";
import {Heading} from "@/components/heading";
import {Placeholder} from "@/components/placeholder";
import {PaymentStatusBadge} from "@/features/payment/components/payment-status-badge";
import {getPayments} from "@/features/payment/queries/get-payments";
import {methodLabel} from "@/lib/xendit";
import {transactionPath} from "@/paths";
import {toCurrencyFromCent} from "@/utils/currency";

const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-PH", {dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila"}).format(d);

const TransactionsPage = async () => {
    const {payments, admin, totals} = await getPayments();

    return (
        <div className="flex-1 flex flex-col gap-y-8">
            <Heading
                title={admin ? "All Transactions" : "Payment History"}
                description={
                    admin
                        ? "Every payment collected through the IslandGo Xendit account"
                        : "Your payments and receipts"
                }
            />

            {admin && (
                <div className="grid gap-4 px-8 sm:grid-cols-2">
                    <Stat label="Paid transactions" value={String(totals._count)}/>
                    <Stat label="Total collected" value={toCurrencyFromCent(totals._sum.amount ?? 0)}/>
                </div>
            )}

            {payments.length ? (
                <div className="overflow-x-auto px-8">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="border-b text-muted-foreground">
                        <tr>
                            <th className="py-2 pr-4 font-medium">Receipt no.</th>
                            <th className="py-2 pr-4 font-medium">Date</th>
                            <th className="py-2 pr-4 font-medium">Tour</th>
                            {admin && <th className="py-2 pr-4 font-medium">Customer</th>}
                            <th className="py-2 pr-4 font-medium">Method</th>
                            <th className="py-2 pr-4 text-right font-medium">Amount</th>
                            <th className="py-2 pr-4 font-medium">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {payments.map((p) => (
                            <tr key={p.id} className="border-b last:border-0">
                                <td className="py-3 pr-4 font-mono">
                                    <Link href={transactionPath(p.id)} className="hover:underline">
                                        {p.referenceNumber}
                                    </Link>
                                </td>
                                <td className="py-3 pr-4">{fmt(p.paidAt ?? p.createdAt)}</td>
                                <td className="py-3 pr-4">{p.booking.tour.title}</td>
                                {admin && <td className="py-3 pr-4">{p.user.username}</td>}
                                <td className="py-3 pr-4">{methodLabel(p.method)}</td>
                                <td className="py-3 pr-4 text-right font-medium">{toCurrencyFromCent(p.amount)}</td>
                                <td className="py-3 pr-4"><PaymentStatusBadge status={p.status}/></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <Placeholder label="No transactions yet" icon={<Receipt/>}/>
            )}
        </div>
    );
};

const Stat = ({label, value}: { label: string; value: string }) => (
    <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);

export default TransactionsPage;
