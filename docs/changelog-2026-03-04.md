# Changelog — 2026-03-04


## Legal Pages & Footer Overhaul

### Privacy Tab Removed
- Removed the `privacy` tab entirely from `app/legal/page.tsx`
- Default tab changed from `'privacy'` to `'terms'`
- Only 3 tabs remain: Termeni si conditii, GDPR, Cookies

### Footer Links Updated (`data/layout.ts`)
- Removed "Politici de confidentialitate" link (pointed to deleted privacy tab)
- Added "GDPR" link pointing to `/legal?tab=gdpr`
- Final order: Termeni si conditii → GDPR → Politica cookies → ANPC-SAL → ANPC-SOL

### Terms Tab — New Sections 12-16
- **12. Descrierea serviciilor si obligatiile clientului** — SEO services scope, client must provide access to website/analytics/Search Console, client delays don't create company liability
- **13. Conditii de plata** — Bank transfer or Stripe, RON or EUR per offer, invoices due within 5 business days, non-payment suspends services
- **14. Forta majora** — Neither party liable for force majeure (natural disasters, pandemics, legislation changes, internet outages, cyberattacks), 5 business day notification requirement
- **15. Confidentialitate** — Both parties keep sensitive info confidential, obligation lasts collaboration + 2 years, breach triggers civil liability
- **16. Legatura cu alte politici** — Cross-tab links to Cookies and GDPR policies

### GDPR Tab — New Sections 9-13, Renumbered Contact to 14
- **9. Datele personale pe care le colectam** — Name, email, phone, IP, navigation data, billing data, voluntary form data
- **10. Scopurile prelucrarii datelor** — SEO services, communication, invoicing, Google Analytics, Google Ads remarketing, legal compliance, Stripe fraud prevention
- **11. Servicii terte care prelucreaza date** — Google Analytics (legitimate interest), Google Ads (consent), Stripe (contract execution), explicit no-sell/no-share statement
- **12. Perioada de retentie a datelor** — Account/billing: relationship + 5 years; Analytics: 26 months; Google Ads: consent withdrawal or 540 days; Contact forms: 12 months
- **13. Legatura cu alte politici** — Cross-tab links to Cookies and Terms
- **14. Contactati-ne** — Renumbered from old section 9

### Cookies Tab — Google Ads Added, Sections Renumbered
- Section 2: Changed "doua servicii terte" to "trei servicii terte", added Google Ads entry (conversion measurement, remarketing)
- New section 3: "Utilizarea cookie-urilor de publicitate" — Google Ads as sole advertising service, no-sell/no-share statement
- Section 4: Updated "Nu utilizam alte cookie-uri" to include Google Ads in the list
- Section 5: Added Google Ads disabling consequence (ads won't be personalized)
- Sections renumbered: old 3→4, 4→5, 5→6, 6→7


## Type & Build Error Fixes

These were all pre-existing issues unrelated to the legal pages work.

### `app/api/invoices/[id]/route.ts`
**Problem:** `GET` references itself recursively (line 207), causing TypeScript circular type inference failure.
**Fix:** Added explicit type annotation to the `GET` export:
```ts
export const GET: (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<NextResponse> = withLogging(async (
```
Also typed the empty `items` and `discounts` arrays in `formattedInvoice` to prevent `never[]` inference when they get reassigned later.

### `app/api/subscriptions/[id]/route.ts`
**Problem:** `database.insert(invoices).values(...)` used columns from a removed orders table (`orderId`, `amount`) and was missing required schema fields (`stripeInvoiceId`, `stripeCustomerId`, `amountTotal`, `updatedAt`).
**Fix:** Updated the insert to match the current `invoices` schema. Removed stale `orderId` references from the logger and JSON response.

### `app/api/subscriptions/create-stripe-subscription/route.ts`
**Problem:** `existingSub.stripeSubscriptionId` is `string | null` in the schema, but `stripe.subscriptions.retrieve()` requires `string`. The code already filters for truthy values, but TypeScript doesn't narrow the type through `.filter()`.
**Fix:** Added non-null assertion (`!`) on the retrieve call.

### `types/invoice.ts`
**Problem:** Invoice `status` type was `'draft' | 'open' | 'paid' | 'void' | 'uncollectible'` but the codebase compares against `'pending'`, `'cancelled'`, and `'overdue'` in multiple components.
**Fix:** Extended the type to include all statuses actually used:
```ts
status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible' | 'pending' | 'cancelled' | 'overdue';
```

### `app/dashboard/invoices/[id]/page.tsx`
**Problem:** Referenced `invoice.orderId` which doesn't exist on `InvoiceDetail` — leftover from when the orders table existed.
**Fix:** Removed the entire `orderId` display block.

### `scripts/test-seed-data.ts`
**Problem:** `stripeInvoiceId` was set twice in the same insert — first to a valid test string (line 224), then overridden to `null` (line 240). The schema requires `notNull()`.
**Fix:** Removed the duplicate `stripeInvoiceId: null` line.


## Files Modified

| File | Change |
|------|--------|
| `app/legal/page.tsx` | Removed privacy tab, added sections to terms/gdpr/cookies |
| `data/layout.ts` | Updated footer infoLinks |
| `app/api/invoices/[id]/route.ts` | Fixed circular type inference, typed empty arrays |
| `app/api/subscriptions/[id]/route.ts` | Fixed invoice insert to match schema, removed orderId |
| `app/api/subscriptions/create-stripe-subscription/route.ts` | Non-null assertion on stripeSubscriptionId |
| `types/invoice.ts` | Added pending/cancelled/overdue to status type |
| `app/dashboard/invoices/[id]/page.tsx` | Removed stale orderId reference |
| `scripts/test-seed-data.ts` | Removed duplicate null stripeInvoiceId |
