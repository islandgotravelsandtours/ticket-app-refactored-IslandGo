import clsx from "clsx";
import {PaymentStatus} from "@prisma/client";

const LABELS: Record<PaymentStatus, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
    CANCELLED: "Cancelled",
};

const PaymentStatusBadge = ({status}: { status: PaymentStatus }) => (
    <span
        className={clsx("rounded-full px-2 py-0.5 text-xs font-medium", {
            "bg-yellow-500/15 text-yellow-600": status === "PENDING",
            "bg-green-500/15 text-green-600": status === "PAID",
            "bg-red-500/15 text-red-600": status === "FAILED",
            "bg-muted text-muted-foreground": status === "CANCELLED",
        })}
    >
        {LABELS[status]}
    </span>
);

export {PaymentStatusBadge};
