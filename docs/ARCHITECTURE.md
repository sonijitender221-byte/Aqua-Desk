# AquaDesk architecture

## Tenancy

`Business` is the tenant root. Customer, ticket, technician, AMC, inventory, invoice, payment, expense, complaint, reminder and audit records carry `businessId`. Server actions obtain the current `businessId` from the signed session rather than trusting form input.

## Authentication

- Registration creates a business, owner user, main branch and Starter trial.
- Passwords use bcrypt cost 12.
- A signed JWT is stored in the `aquadesk_session` HTTP-only cookie.
- Middleware redirects unauthenticated dashboard requests.
- `requireSession()` is also called inside protected server components/actions.

## Core completion transaction

Completing a service runs one database transaction:

1. Load tenant-owned service ticket.
2. Validate spare-part availability.
3. Deduct stock and record inventory movement.
4. Generate invoice and line items.
5. Complete ticket and create status history.
6. Update customer and purifier service dates/TDS.
7. Increment technician performance.
8. Create the next-service reminder.

This prevents partially completed operational records.

## Provider boundaries

Payment, messaging, maps and file upload credentials are environment variables. Add provider adapters under `lib/integrations/` and call them from a queue/worker in production. Do not block the service-completion transaction on external API delivery.
