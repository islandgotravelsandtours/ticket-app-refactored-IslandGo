import {timingSafeEqual} from "node:crypto";

// Server-only Xendit helpers (Invoice API = hosted checkout page).
// All payments go to the single IslandGo Xendit account (XENDIT_SECRET_KEY).
// Which methods appear (GCash, Maya, QR Ph, cards...) is set in the Xendit
// dashboard under Settings > Payment methods.

const API = "https://api.xendit.co";

const METHOD_LABELS: Record<string, string> = {
    GCASH: "GCash",
    PAYMAYA: "Maya",
    MAYA: "Maya",
    GRABPAY: "GrabPay",
    SHOPEEPAY: "ShopeePay",
    QRPH: "QR Ph",
    CREDIT_CARD: "Credit / Debit card",
    CARDS: "Credit / Debit card",
    EWALLET: "E-wallet",
    QR_CODE: "QR code",
    DIRECT_DEBIT: "Direct debit",
    DIRECT_BANK_TRANSFER: "Bank transfer",
};

export const methodLabel = (id?: string | null) =>
    id ? (METHOD_LABELS[id.toUpperCase()] ?? id) : "—";

const authHeader = () => {
    const key = process.env.XENDIT_SECRET_KEY;
    if (!key) throw new Error("Payments are not configured (missing XENDIT_SECRET_KEY).");
    return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
};

export type XenditInvoice = {
    id: string;
    external_id: string;
    status: string; // PENDING | PAID | SETTLED | EXPIRED
    amount: number; // pesos (major units)
    currency?: string;
    invoice_url: string;
    paid_at?: string;
    payment_method?: string;
    payment_channel?: string;
    payment_id?: string;
};

const call = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`${API}${path}`, {
        ...init,
        cache: "no-store",
        headers: {"Content-Type": "application/json", Authorization: authHeader(), ...init?.headers},
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(json?.message ?? `Xendit error (${res.status})`);
    }
    return json as T;
};

export const createInvoice = (input: {
    externalId: string; // our Payment.referenceNumber
    amountCentavos: number;
    description: string;
    successUrl: string;
    failureUrl: string;
    customer: { name: string; email: string };
}) =>
    call<XenditInvoice>("/v2/invoices", {
        method: "POST",
        body: JSON.stringify({
            external_id: input.externalId,
            amount: input.amountCentavos / 100, // Xendit takes pesos, we store centavos
            currency: "PHP",
            description: input.description,
            payer_email: input.customer.email,
            customer: {given_names: input.customer.name, email: input.customer.email},
            invoice_duration: 86400, // checkout link valid for 24h
            success_redirect_url: input.successUrl,
            failure_redirect_url: input.failureUrl,
        }),
    });

export const getInvoice = (id: string) => call<XenditInvoice>(`/v2/invoices/${encodeURIComponent(id)}`);

// Xendit authenticates webhooks with a static token in the x-callback-token header.
export const verifyCallbackToken = (received: string | null) => {
    const expected = process.env.XENDIT_CALLBACK_TOKEN;
    if (!expected || !received) return false;
    const a = Buffer.from(expected);
    const b = Buffer.from(received);
    return a.length === b.length && timingSafeEqual(a, b);
};
