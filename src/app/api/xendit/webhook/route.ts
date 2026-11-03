import {NextRequest, NextResponse} from "next/server";
import {settleInvoice} from "@/features/payment/settle";
import {verifyCallbackToken} from "@/lib/xendit";

export const runtime = "nodejs";

// Xendit Dashboard > Settings > Webhooks > "Invoices paid" and "Invoices expired":
//   URL: https://<your-domain>/api/xendit/webhook
// Copy the account's "Webhook verification token" into XENDIT_CALLBACK_TOKEN.
export async function POST(req: NextRequest) {
    if (!process.env.XENDIT_CALLBACK_TOKEN) {
        console.error("XENDIT_CALLBACK_TOKEN is not set — refusing webhook.");
        return new NextResponse("Server misconfigured", {status: 500});
    }

    if (!verifyCallbackToken(req.headers.get("x-callback-token"))) {
        return new NextResponse("Invalid token", {status: 401});
    }

    let body: { id?: string };
    try {
        body = await req.json();
    } catch {
        return new NextResponse("Invalid JSON", {status: 400});
    }

    try {
        // The body only tells us which invoice changed; settleInvoice re-fetches the truth from Xendit.
        if (body?.id) await settleInvoice(body.id);
    } catch (error) {
        // 5xx makes Xendit retry; settleInvoice is idempotent.
        console.error("Webhook processing error:", error);
        return new NextResponse("Processing error", {status: 500});
    }

    return NextResponse.json({received: true});
}
