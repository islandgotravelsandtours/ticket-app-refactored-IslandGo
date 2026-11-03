# Travels & Tours

A full-stack tour listing and discussion app. Hosts publish tours (destination, itinerary,
departure date, price per person, availability status); travelers browse, search, sort,
paginate and ask questions or leave reviews in the comments.

Refactored from the Road to Next "TicketBounty" app: **Ticket -> Tour**, **deadline -> departureDate**,
**bounty -> price**, new **destination** field, and status `OPEN / FULLY_BOOKED / COMPLETED`.

## Stack
Next.js 15 (App Router), React 19, TypeScript, Prisma 5 + PostgreSQL (Supabase), Lucia auth,
Tailwind CSS 3 + shadcn/ui, nuqs, TanStack Query, Zod.

## Features
- Sign up / sign in / sign out (Lucia sessions, argon2 password hashing)
- Tours: create, edit, delete, change status (owner only)
- Search by title **or destination**, sort (newest, oldest, price), pagination
- Comments with infinite scroll, delete own comments
- Light/dark theme, toasts, breadcrumbs, API routes at `/api/tours`

## Setup
```bash
cp .env.example .env        # fill in DATABASE_URL and DIRECT_URL
npm install
npx prisma db push          # adds Tour.destination and the new status values
npm run prisma-seed         # demo users + tours (password: geheimnis)
npm run dev
```

> If you have an existing database from the ticket version, the enum rename
> (`IN_PROGRESS/DONE` -> `FULLY_BOOKED/COMPLETED`) and table rename (`Ticket` -> `Tour`)
> will not carry data over. `prisma db push` will warn you; for a dev DB, accept the reset and reseed.

## Payments (Xendit)
All customer payments are collected by **one IslandGo Xendit account** (the admin's). Customers pay on
Xendit's hosted checkout (GCash, Maya, QR Ph, cards... whatever you enable in the Xendit dashboard); every
attempt is stored as a `Payment` row = the transaction history + receipt.

1. Add to `.env`: `XENDIT_SECRET_KEY`, `XENDIT_CALLBACK_TOKEN`, `APP_URL` (see `.env.example`).
2. Xendit Dashboard > Settings > Webhooks: set the **Invoices paid** and **Invoices expired** URLs to
   `https://<your-domain>/api/xendit/webhook`.
3. `npx prisma db push` (adds/updates the `Payment` table).

Flow: Bookings > **Pay now** -> `startPayment` (amount read from the DB booking) -> Xendit invoice page ->
webhook -> `settleInvoice` re-fetches the invoice from Xendit and marks `Payment` + `Booking` PAID. The receipt
page also re-checks Xendit directly if the webhook is late.
Pages: `/transactions` (customer: own history; admin: all + totals) and `/transactions/[id]` (printable receipt).

## Structure
`src/features/tour` (actions, queries, components), `src/features/comment`, `src/features/auth`,
`src/app/(authenticated)/tours`, `src/app/_navigation`.
