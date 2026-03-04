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


## Stripe SDK v14 → v20 Migration

All breaking type changes from the major Stripe SDK upgrade.

### `discount.coupon` → `discount.source.coupon`
In v20, the `coupon` property moved from the Discount object to `discount.source.coupon`. Additionally, `source.coupon` can be `string | Stripe.Coupon | null`, so it needs a type guard.

**Files fixed:**
- `app/api/invoices/[id]/route.ts` — Both discount mapping blocks (lines ~134 and ~219)
- `lib/discount-utils.ts` — `fetchSubscriptionDiscounts()` discount mapping

### `promotionCode.coupon` → `promotionCode.promotion.coupon`
PromotionCode objects now access the coupon via `.promotion.coupon` instead of `.coupon` directly.

**Files fixed:**
- `app/api/validate-coupon/route.ts` — Coupon validation endpoint

### `promotionCodes.create({ coupon })` → `promotionCodes.create({ promotion: { coupon, type: 'coupon' } })`
The create params for promotion codes now nest the coupon inside a `promotion` object.

**Files fixed:**
- `scripts/required-generate-stripe.ts` — Both SEO70 and SEOFULL promo code creation

### `invoice.subscription` → `invoice.parent.subscription_details.subscription`
The `subscription` property was removed from Invoice. Access it via the `parent` object.

**Files fixed:**
- `app/api/invoices/cancel-payment/route.ts` — Subscription cancellation on invoice cancel
- `app/api/webhook/route.ts` — `payment_intent.succeeded` handler
- `app/api/subscriptions/check-incomplete-payments/route.ts` — Open invoice listing

### `invoice.payment_intent` → `invoice.payments.data[0].payment.payment_intent`
The `payment_intent` property was removed from Invoice. Access it through the `payments` list.

**Files fixed:**
- `app/api/subscriptions/create-stripe-subscription/route.ts` — Multiple blocks: initial invoice pay, error handling invoice retrieve, direct invoice pay
- `app/api/subscriptions/check-payment-status/route.ts` — Payment status checking
- `app/api/subscriptions/retry-payment/route.ts` — Payment retry logic
- `app/api/subscriptions/check-incomplete-payments/route.ts` — Incomplete payment detection

All `expand` paths updated from `['payment_intent']` or `['latest_invoice.payment_intent']` to `['payments.data.payment.payment_intent']` or `['latest_invoice.payments.data.payment.payment_intent']`.

### `invoice.paid` removed
Replaced all `invoice.paid` checks with `invoice.status === 'paid'`.

**Files fixed:**
- `app/api/subscriptions/create-stripe-subscription/route.ts`
- `app/api/subscriptions/check-payment-status/route.ts`
- `app/api/subscriptions/retry-payment/route.ts`
- `app/api/webhook/route.ts`

### `invoice.tax` → `invoice.total_taxes`
The `tax` number property was removed. Tax is now an array of `total_taxes` objects, each with an `amount`. Computed as: `invoice.total_taxes?.reduce((sum, t) => sum + t.amount, 0) ?? 0`.

**Files fixed:**
- `app/api/invoices/[id]/route.ts` — Both formatted invoice blocks

### `subscription.current_period_start/end` → `subscription.items.data[0].current_period_start/end`
Period timestamps moved from the subscription object to individual subscription items.

**Files fixed:**
- `app/api/subscriptions/cancel-stripe-subscription/route.ts` — End date calculation on cancel/reactivate
- `app/api/subscriptions/check-payment-status/route.ts` — Period dates for DB update
- `app/api/subscriptions/create-stripe-subscription/route.ts` — Logger and local subscription record creation
- `app/api/webhook/route.ts` — Subscription update handler


## Files Modified

| File | Change |
|------|--------|
| `app/legal/page.tsx` | Removed privacy tab, added sections to terms/gdpr/cookies |
| `data/layout.ts` | Updated footer infoLinks |
| `app/api/invoices/[id]/route.ts` | Fixed circular type inference, typed empty arrays, Stripe v20 discount/tax migration |
| `app/api/invoices/cancel-payment/route.ts` | Stripe v20: invoice.subscription → parent.subscription_details |
| `app/api/subscriptions/[id]/route.ts` | Fixed invoice insert to match schema, removed orderId |
| `app/api/subscriptions/create-stripe-subscription/route.ts` | Non-null assertion, Stripe v20: payment_intent/period migration |
| `app/api/subscriptions/cancel-stripe-subscription/route.ts` | Stripe v20: current_period_end migration |
| `app/api/subscriptions/check-payment-status/route.ts` | Stripe v20: payment_intent/paid/period migration |
| `app/api/subscriptions/check-incomplete-payments/route.ts` | Stripe v20: payment_intent/subscription migration |
| `app/api/subscriptions/retry-payment/route.ts` | Stripe v20: payment_intent/paid migration |
| `app/api/validate-coupon/route.ts` | Stripe v20: promotionCode.coupon → promotion.coupon |
| `app/api/webhook/route.ts` | Stripe v20: invoice.subscription/paid, subscription period migration |
| `lib/discount-utils.ts` | Stripe v20: discount.coupon → source.coupon |
| `scripts/required-generate-stripe.ts` | Stripe v20: promotionCodes.create params |
| `types/invoice.ts` | Added pending/cancelled/overdue to status type |
| `app/dashboard/invoices/[id]/page.tsx` | Removed stale orderId reference |
| `scripts/test-seed-data.ts` | Removed duplicate null stripeInvoiceId |
