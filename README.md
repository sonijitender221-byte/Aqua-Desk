# AquaDesk

AquaDesk is a clean, multi-tenant SaaS starter for RO water-purifier service businesses. It connects the customer lifecycle from booking and technician assignment through service completion, spare-parts usage, invoicing, payment tracking, AMC renewal and future reminders.

## Included

- Original responsive marketing website
- Business registration with a 14-day Starter trial
- Email/password authentication with bcrypt and signed HTTP-only sessions
- Tenant-isolated PostgreSQL/Prisma data model
- Owner dashboard with live database metrics
- Customer CRM, search, pagination and CSV export
- Multiple purifier units per customer
- Service ticket list, filters, board view, assignment and status timeline
- Technician mobile workflow preview
- Digital service checklist and before/after TDS
- Automatic spare-part deduction on job completion
- Automatic invoice creation and 90-day reminder scheduling
- Technician management and performance metrics
- AMC plans and customer contract activation
- Inventory, stock movements and low-stock alerts
- Invoices, payments and print-to-PDF layout
- Expenses and operational reports
- Complaints, reminders and branch management
- Public service-booking page per business slug
- Subscription plan data and payment-provider-ready configuration
- Docker Compose PostgreSQL configuration
- Seed data and demo account

## Technology

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Zod
- bcryptjs
- jose signed sessions
- Recharts
- Lucide icons

## Start locally

### 1. Requirements

- Node.js 20 or newer
- Docker Desktop, or another PostgreSQL database

### 2. Environment

```bash
cp .env.example .env
```

Set a long random `AUTH_SECRET`. The default Docker database URL already matches `docker-compose.yml`.

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Install and initialise

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo account

- Email: `owner@aquadesk.app`
- Password: `Demo@123`

Public demo booking page after seeding:

- `http://localhost:3000/pureflow-ro-services/book`

## Important workflows to test

1. Log in with the demo account.
2. Create a customer and add a purifier.
3. Create a service ticket and assign a technician.
4. Open the ticket, enter TDS, select a spare part and complete the checklist.
5. Complete the service. AquaDesk will reduce inventory, generate an invoice, update customer/purifier dates and schedule a reminder.
6. Open the invoice and record a UPI or cash payment.
7. Create an AMC plan and activate it for a customer purifier.
8. Submit a booking from the public business URL.
9. Export customers as CSV.

## Production deployment

### Vercel + Neon/Supabase

1. Create a PostgreSQL database in Neon, Supabase or Railway.
2. Add its pooled connection string as `DATABASE_URL`.
3. Add `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL` in the deployment environment.
4. Run `npx prisma db push` and `npm run db:seed` against the production database once.
5. Deploy the repository to Vercel.

For production migrations, create and commit migrations with:

```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## External integrations

The project contains environment placeholders and integration-ready workflows, but it deliberately does not contain real credentials. The following require provider accounts and webhook/API implementation before they can send or charge real users:

- WhatsApp Business API
- SMS provider
- Email provider
- Razorpay recurring subscriptions
- Stripe recurring subscriptions
- Cloudinary or UploadThing uploads
- Google Maps routing/live location
- Phone OTP delivery

The reminder queue, subscription models and public booking workflow are functional without those providers; external delivery and recurring charging are not simulated as successful.

## Security notes

- Every business record is scoped by `businessId`.
- Passwords are hashed with bcrypt.
- Sessions are signed and stored in HTTP-only cookies.
- Secrets are loaded only from environment variables.
- Server actions validate or constrain business ownership before mutations.
- Production deployments should additionally add CSRF origin restrictions, provider webhook signature checks, rate limiting backed by Redis, malware scanning for uploads and automated backups.

## Folder structure

```text
AquaDesk/
├── app/                    Next.js routes, dashboard and public booking
├── components/             Reusable UI and dashboard components
├── lib/                    Database, session, validation and server actions
├── prisma/                 Schema and realistic seed data
├── docs/                   Architecture and API notes
├── docker-compose.yml      Local PostgreSQL
├── .env.example            Environment placeholders
└── README.md               Setup and deployment guide
```

## Licence

Commercial starter code generated for the AquaDesk project. Review third-party dependency licences before resale or redistribution.
