# IslandGo 🏝️

A full-stack travel and tours booking platform built for Filipino travelers. Admins publish tours, customers browse, book seats, and pay online through GCash, Maya, QR Ph, or card via Xendit, and every payment is saved as a printable receipt.

> Started as a refactor of the *Road to Next* "TicketBounty" app: **Ticket → Tour**, **deadline → departureDate**, **bounty → price**, plus a new booking and payment flow.

## Features

**For travelers**
- Browse upcoming tours, search by title or destination, sort by newest, oldest, or price, and paginate
- Book seats by choosing the number of guests (1 to 20)
- Pay on Xendit's hosted checkout (GCash, Maya, QR Ph, cards, and any other method enabled in your Xendit dashboard)
- "My Bookings" and "Payment History" pages, plus a printable receipt for each transaction
- Ask questions or leave reviews in tour comments (infinite scroll, delete your own)
- Account profile (with avatar upload) and password change

**For admins**
- Create, edit, delete, and change the status of tours (`OPEN`, `FULLY_BOOKED`, `COMPLETED`)
- Upload tour images (JPG, PNG, WebP, up to 5 MB) or paste image links
- View all bookings and all transactions, with totals

**General**
- Light and dark theme, toasts, breadcrumbs
- Role-based navigation (`ADMIN` and `CUSTOMER`)
- REST routes at `/api/tours` and a Xendit webhook at `/api/xendit/webhook`

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15 (App Router, Turbopack), React 19, TypeScript |
| Database | PostgreSQL (Supabase) with Prisma 5 |
| Auth | Lucia sessions, argon2 password hashing |
| UI | Tailwind CSS 3, shadcn/ui (Radix), lucide-react, sonner |
| State and data | TanStack Query, nuqs (URL search params), Zod validation |
| Payments | Xendit Invoice API (hosted checkout) |
| Storage | Supabase Storage (public `tour-images` bucket) |
| Hosting | Netlify (`@netlify/plugin-nextjs`) |

## Getting Started

### Prerequisites
- Node.js 22 (see `.nvmrc`)
- A PostgreSQL database (Supabase works great)
- A Xendit account (use `xnd_development_...` keys for testing)
- A Supabase Storage public bucket named `tour-images`

### Setup

```bash
git clone <your-repo-url>
cd islandgo
cp .env.example .env     # then fill in the values below
npm install              # also runs `prisma generate`
npx prisma db push       # create the tables
npm run prisma-seed      # optional: demo data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Pooled Postgres connection (app runtime) |
| `DIRECT_URL` | Direct or session-mode connection (migrations, `db push`) |
| `SUPABASE_URL` | Supabase project URL (image uploads) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, never expose it) |
| `XENDIT_SECRET_KEY` | Xendit API key with Money-in write permission |
| `XENDIT_CALLBACK_TOKEN` | Xendit webhook verification token |
| `APP_URL` | Public base URL of the app (used for payment redirects) |
| `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin account details |

> ⚠️ Never commit `.env`. It's already covered by `.gitignore`.

## Payments (Xendit)

All payments go to a single IslandGo Xendit account.

1. Add `XENDIT_SECRET_KEY`, `XENDIT_CALLBACK_TOKEN`, and `APP_URL` to `.env`.
2. In **Xendit Dashboard → Settings → Webhooks**, set the **Invoices paid** and **Invoices expired** URLs to:
   `https://<your-domain>/api/xendit/webhook`
3. Choose which payment methods customers see in **Settings → Payment methods**.

**Flow:** Book a tour → **Pay now** → `startPayment` creates a Xendit invoice (the amount always comes from the database, never the client) → customer pays on Xendit → webhook fires → `settleInvoice` re-checks the invoice with Xendit and marks the `Payment` and `Booking` as `PAID`. The receipt page also re-checks Xendit directly if the webhook is late.

## Project Structure

```
src/
├── app/                  # Routes (App Router)
│   ├── (authenticated)/  # tours, bookings, transactions, account
│   ├── api/              # /api/tours, /api/xendit/webhook
│   ├── sign-in, sign-up, password-forgot
│   └── _navigation/      # header, sidebar, account menu
├── features/             # Feature modules (actions, queries, components)
│   ├── tour/  booking/  payment/  comment/  auth/  account/
├── components/           # Shared components + shadcn/ui
├── lib/                  # prisma, lucia, xendit, image upload helpers
└── paths.ts              # Central route helpers
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` / `lint-fix` | ESLint |
| `npm run type` | TypeScript type check |
| `npm run prisma-seed` | Seed demo data |

## Deployment (Netlify)

The repo includes a `netlify.toml` that builds with `npm run build` and uses the Next.js plugin. Add all the environment variables above in **Site settings → Environment variables**, set `APP_URL` to your live domain, and point the Xendit webhooks to it.

## Author

 by **Flo** (flosimpledev).
