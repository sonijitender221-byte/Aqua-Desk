# AquaDesk API notes

## Existing routes

### `GET /api/health`

Returns application and database status.

### `GET /api/export/customers`

Authenticated CSV export scoped to the current business.

## Server-action mutations

The current application uses Next.js server actions for first-party dashboard mutations:

- Authentication and registration
- Customer and purifier creation
- Service creation, assignment, status updates and completion
- Technician creation
- Inventory creation and adjustment
- AMC plan/contract creation
- Invoice creation and payment recording
- Complaint, reminder, branch, expense and settings mutations
- Public service booking

## Recommended external REST API

For mobile apps or third-party clients, expose versioned handlers under `/api/v1` and reuse the validation and tenant-guard functions. Suggested resources:

- `/api/v1/customers`
- `/api/v1/purifiers`
- `/api/v1/services`
- `/api/v1/technicians`
- `/api/v1/amcs`
- `/api/v1/inventory`
- `/api/v1/invoices`
- `/api/v1/payments`

Use bearer tokens with tenant and role claims, rate limiting, idempotency keys for financial writes, pagination cursors and audit logs.
