# Threat Model

## Project Overview

ExpenseAI is a full-stack receipt management application with a React frontend and an Express/Node.js backend backed by PostgreSQL via Drizzle ORM. Users authenticate with Replit Auth, upload receipt images for OpenAI-based extraction, review stored expense data, export CSVs, and manage subscriptions through Stripe. Production scope is the Express API, shared schema/storage code, and the bundled React client served from `dist/public`.

## Assets

- **User accounts and sessions** — authenticated sessions established through Replit Auth and persisted in PostgreSQL. Compromise allows access to private receipts, exports, and billing state.
- **Receipt data and derived AI output** — uploaded receipt images, OCR text, extracted merchant names, amounts, categories, line items, and descriptions. This data may contain sensitive personal and financial information.
- **Billing identifiers and subscription state** — Stripe customer IDs, subscription IDs, payment status, and plan metadata. Tampering can lead to unauthorized premium access or billing abuse.
- **Admin capabilities and user directory data** — admin-only user listings, system stats, role changes, and visibility into other users’ account metadata.
- **Application secrets** — `DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.

## Trust Boundaries

- **Browser to API** — all client input is untrusted. The server must authenticate requests, authorize access to user-specific/admin data, and validate uploads and body/query parameters.
- **API to PostgreSQL** — the API has broad read/write access to user, receipt, activity, session, and subscription tables. Query construction bugs or ownership mistakes can expose or modify other users’ data.
- **API to OpenAI** — uploaded receipt content crosses to a third-party AI service. The application must avoid trusting model output for authorization or unsafe rendering.
- **API to Stripe** — the backend creates customers, payment intents, subscriptions, and consumes webhook events using secret credentials. Webhook authenticity and subscription-state transitions are critical.
- **Authenticated user to admin** — standard users and admins share the same application and database. Admin-only routes must be enforced server-side.
- **Production to dev-only tooling** — `server/vite.ts`, Vite runtime helpers, and development-only frontend behavior are out of scope unless production reachability is demonstrated. The mockup sandbox is not production.

## Scan Anchors

- **Production entry points:** `server/index.ts`, `server/routes.ts`, `server/replitAuth.ts`
- **Highest-risk areas:** receipt upload/processing in `server/routes.ts` + `server/services/*.ts`, storage/query code in `server/storage.ts`, admin APIs in `server/routes.ts`, billing/webhook flows in `server/routes.ts`
- **Public surfaces:** `/api/categories`, `/api/subscription-plans`, auth login/callback/logout routes, static client assets
- **Authenticated surfaces:** most `/api/receipts*`, analytics, activity, export, subscription status/creation
- **Admin surfaces:** `/api/admin/users`, `/api/admin/stats`, `/api/admin/users/:id/role`
- **Usually dev-only:** `server/vite.ts`, local dev banner/script behavior, Vite HMR paths

## Threat Categories

### Spoofing

Users authenticate through Replit OIDC and a server-side session. Protected routes must require a valid authenticated session on every request, and admin routes must independently verify the stored admin role rather than trusting frontend state. Stripe webhooks must only accept verified events signed with the configured webhook secret.

### Tampering

The server accepts user-controlled receipt uploads, search filters, receipt edits, bulk-delete lists, subscription plan selections, and admin role updates. It must validate all request data server-side, ensure billing state transitions cannot be forced through inconsistent webhook/account updates, and prevent users from modifying data outside their own ownership boundary.

### Information Disclosure

Receipt OCR text, extracted expense details, account metadata, and billing identifiers are sensitive. API responses, logs, and admin endpoints must avoid exposing more data than necessary, and all user-scoped queries must enforce ownership server-side. Error handling must not leak secrets, tokens, or internal stack details.

### Denial of Service

Receipt upload and AI analysis are comparatively expensive operations. Public or authenticated endpoints must not allow unbounded file uploads, pathological search parameters, or repeated external-service-triggering requests that can exhaust CPU, memory, database, or third-party API quota.

### Elevation of Privilege

The main privilege boundaries are user-to-user receipt access and user-to-admin management actions. All receipt, activity, export, and admin operations must enforce server-side ownership/role checks, and billing/subscription state must not be manipulable to unlock features or preserve access after cancellation.
