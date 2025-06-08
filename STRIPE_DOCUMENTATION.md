# Stripe Integration Documentation

## Overview

This application uses Stripe for secure payment processing and card management. The integration includes card storage, payment processing, and subscription management capabilities.

## Features

### 1. **Card Storage & Management** (`/dashboard/payment-methods`)
- ✅ View all saved cards from Stripe
- ✅ Add new cards using Stripe Elements (secure tokenization)
- ✅ Delete cards
- ✅ Set a default payment method
- ✅ Display card brand icons (Visa, Mastercard, Amex, Discover)
- ✅ Automatic Stripe customer creation for new users

### 2. **Payment Processing** (`/dashboard/checkout`)
- ✅ Select from saved payment methods
- ✅ Process payments with selected card
- ✅ Handle payment errors gracefully
- ✅ Show success confirmation
- ✅ Support for coupon codes and discounts

### 3. **Security Features**
- Card details never touch your server (only tokens)
- Stripe handles all PCI compliance
- Cards are stored securely in Stripe's vault
- Authentication required for all operations
- Secure token-based transactions

## API Endpoints

### `/api/payment-methods`
Manages user payment methods stored in Stripe.

- **GET**: Fetch all cards for the authenticated user
  - Creates Stripe customer if none exists
  - Returns transformed card data with default status

- **POST**: Add a new card using a Stripe token
  - Body: `{ token: string, setAsDefault?: boolean }`
  - Creates Stripe customer if needed
  - Returns the new card details

- **DELETE**: Remove a card from Stripe
  - Query param: `?cardId={id}`
  - Clears default if deleted card was default

- **PATCH**: Set a card as the default payment method
  - Body: `{ cardId: string }`
  - Updates both Stripe and database

### `/api/process-payment`
Handles payment processing with saved cards.

- **POST**: Process a payment using a saved card
  - Body:
    ```json
    {
      "amount": 1000,        // Amount in cents
      "currency": "usd",     // Currency code
      "description": "...",  // Payment description
      "orderId": "...",      // Optional order ID
      "cardId": "...",       // Optional - uses default if not provided
      "metadata": {}         // Additional metadata
    }
    ```
  - Returns charge details and status

- **GET**: Get available payment methods for checkout
  - Returns cards list with default card ID

## Database Schema

### Users Table Additions
```sql
stripeCustomerId TEXT          -- Links user to Stripe customer
defaultPaymentMethodId TEXT    -- Stores the default card ID
```

### Orders Table Additions
```sql
stripePaymentId TEXT          -- Stores the Stripe charge ID for tracking
status TEXT                   -- Now includes 'paid' status
```

## Components

### 1. **StripeCardElement** (`/components/StripeCardElement.tsx`)
Secure card input component using Stripe Elements.

```tsx
<StripeCardElement
  onSuccess={(cardId) => {
    // Handle successful card addition
  }}
  onCancel={() => {
    // Handle cancellation
  }}
  setAsDefault={false}
/>
```

Features:
- Secure card input using Stripe Elements
- Real-time validation
- Tokenizes card details client-side
- Handles errors and loading states
- Option to set as default

### 2. **PaymentMethodSelector** (`/components/PaymentMethodSelector.tsx`)
Payment method selection and processing component.

```tsx
<PaymentMethodSelector
  amount={1000}              // Amount in cents
  currency="USD"
  onPayment={async (cardId) => {
    // Process payment with selected card
  }}
/>
```

Features:
- Lists saved payment methods
- Shows card brand icons
- Pre-selects default card
- Processes payments with selected card
- Handles loading and error states

## Implementation Details

### Adding Stripe Elements to Payment Methods Page

The payment methods page uses dynamic imports for Stripe Elements:

```tsx
const StripeCardElement = dynamic(
  () => import('@/components/StripeCardElement'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);
```

### Payment Flow

1. **Adding a Card**:
   - User navigates to Payment Methods page
   - Clicks "Adaugă Metodă de Plată"
   - Stripe Elements form appears
   - User enters card details
   - Card is tokenized client-side
   - Token sent to server
   - Server creates card in Stripe
   - Card appears in user's list

2. **Making a Payment**:
   - User proceeds to checkout
   - PaymentMethodSelector loads saved cards
   - User selects a card (default pre-selected)
   - Clicks "Plătește acum"
   - Payment processed through Stripe
   - Success/error message displayed
   - Order updated with payment ID

### Error Handling

The integration includes comprehensive error handling:

- Network errors
- Stripe API errors
- Card decline errors
- Authentication errors
- Validation errors

Example error response:
```json
{
  "error": "Your card was declined",
  "type": "card_error",
  "code": "card_declined"
}
```

## Environment Variables

Required environment variables:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...                    # Server-side key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...   # Client-side key
```

## Testing

### Test Card Numbers

Use these test card numbers in development:

| Brand | Number | CVC | Expiry |
|-------|--------|-----|---------|
| Visa | 4242 4242 4242 4242 | Any 3 digits | Any future date |
| Mastercard | 5555 5555 5555 4444 | Any 3 digits | Any future date |
| American Express | 3782 822463 10005 | Any 4 digits | Any future date |
| Discover | 6011 1111 1111 1117 | Any 3 digits | Any future date |

### Testing Scenarios

1. **Successful Payment**: Use any test card above
2. **Card Declined**: Use `4000 0000 0000 0002`
3. **Insufficient Funds**: Use `4000 0000 0000 9995`
4. **Invalid CVC**: Use `4000 0000 0000 0127`

## Security Best Practices

1. **Never log or store card details** - Only use Stripe tokens
2. **Always use HTTPS** in production
3. **Validate amounts server-side** before processing
4. **Use webhook signatures** to verify Stripe events
5. **Implement rate limiting** on payment endpoints
6. **Log all payment attempts** for auditing

## Troubleshooting

### Common Issues

1. **"Stripe is not defined"**
   - Ensure Stripe.js is loaded before using Elements
   - Check that publishable key is set

2. **"No such customer"**
   - Customer ID might be from wrong environment
   - Check test vs live keys match

3. **"Card declined"**
   - In test mode, use approved test cards
   - Check card requirements (3D Secure, etc.)

4. **CORS errors**
   - Stripe Elements must be served over HTTPS in production
   - Check domain is added to Stripe dashboard

## Future Enhancements

1. **Webhook Integration**
   - Handle payment confirmations
   - Update order status automatically
   - Send email notifications

2. **Subscription Management**
   - Create recurring subscriptions
   - Handle plan changes
   - Manage billing cycles

3. **Enhanced Security**
   - 3D Secure authentication implemented
   - Add fraud detection rules
   - Enable radar for fraud prevention

4. **Additional Features**
   - Support for multiple currencies
   - Invoice generation and download
   - Payment history and receipts
   - Refund processing

## Migration Notes

When migrating from development to production:

1. Update environment variables to use live keys
2. Ensure all test data is cleared
3. Set up webhooks for production endpoint
4. Configure allowed domains in Stripe dashboard
5. Enable appropriate security features

## Stripe Product Generation Script

### Overview
The application includes a script to programmatically generate Stripe products, prices, and coupons for the two main services: GMB MAX and GOOGLE ORGANIC.

### Script Location
`scripts/generate-stripe-products.ts`

### What it Creates

1. **Products:**
   - **GMB MAX**: €1000/month subscription for Google Maps optimization
   - **GOOGLE ORGANIC**: €1000/month subscription for Google organic search optimization

2. **Prices:**
   - Monthly recurring prices for each product (€1000/month)

3. **Coupons:**
   - **SEO70**: 70% discount for the first 3 months

### Usage

Run the script using:
```bash
pnpm stripe:generate-products
```

### Prerequisites

- Ensure `STRIPE_SECRET_KEY` is set in your `.env` file
- Use test mode Stripe key for development/testing
- Use live mode Stripe key for production

### Output

The script will:
1. Create products, prices, and coupons in your Stripe account
2. Generate `data/payment.ts` with all the IDs
3. Display the created IDs in the console

### Generated File Structure

The script:
1. **Updates `.env`** with Stripe IDs:
```env
STRIPE_PRODUCT_GMB_MAX=prod_...
STRIPE_PRODUCT_GOOGLE_ORGANIC=prod_...
STRIPE_PRICE_GMB_MAX_MONTHLY=price_...
STRIPE_PRICE_GOOGLE_ORGANIC_MONTHLY=price_...
STRIPE_COUPON_SEO70=SEO70
```

2. **Creates `data/payment.ts`** that reads from environment variables:
```typescript
export const stripeIds = {
    products: {
        gmbMax: process.env.STRIPE_PRODUCT_GMB_MAX!,
        googleOrganic: process.env.STRIPE_PRODUCT_GOOGLE_ORGANIC!
    },
    prices: {
        gmbMaxMonthly: process.env.STRIPE_PRICE_GMB_MAX_MONTHLY!,
        googleOrganicMonthly: process.env.STRIPE_PRICE_GOOGLE_ORGANIC_MONTHLY!
    },
    coupons: {
        SEO70: process.env.STRIPE_COUPON_SEO70!
    }
}
```

Plus helper functions:
- `getPriceIdByServiceId(serviceId: number)`: Get price ID for a service
- `getProductIdByServiceId(serviceId: number)`: Get product ID for a service

### Important Notes

1. **Run Once Per Environment**: Only run this script once per Stripe account (test/live)
2. **Coupon ID**: The coupon ID 'SEO70' is hardcoded - if it already exists, the script will fail
3. **Regeneration**: If you need to regenerate, delete the existing products in Stripe dashboard first
4. **Service IDs**: The script uses service IDs 1 (GMB MAX) and 2 (GOOGLE ORGANIC) from `data/services.ts`
5. **Security**: Stripe IDs are now stored in environment variables, not hardcoded in git
6. **Production Setup**: Remember to add the environment variables to your production environment

### Integration with Application

After running the script, the generated IDs can be used throughout the application:
- In subscription creation flows
- For applying the SEO70 coupon during checkout
- For matching services to their Stripe products

## 3D Secure Implementation

### Overview

This application implements 3D Secure (3DS) authentication for subscription payments using Stripe's Strong Customer Authentication (SCA) requirements. The implementation handles the complete flow from subscription creation through payment confirmation without requiring webhooks.

### Implementation Flow

#### 1. Subscription Creation (`create-stripe-subscription/route.ts`)

**Configuration:**
```typescript
const subscriptionParams = {
    customer: stripeCustomerId,
    items: [{ price: priceId }],
    default_payment_method: paymentMethodId,
    payment_behavior: 'default_incomplete',
    payment_settings: {
        payment_method_options: {
            card: {
                request_three_d_secure: 'any'
            }
        }
    }
};
```

**Key Features:**
- Uses `payment_behavior: 'default_incomplete'` to ensure manual payment confirmation
- Configures `request_three_d_secure: 'any'` to trigger 3DS when required
- Creates subscription in incomplete state when authentication is needed

#### 2. Payment Intent Handling

**Invoice Payment Process:**
```typescript
// Pay the invoice directly to create payment intent
const paidInvoice = await stripe.invoices.pay(invoice.id, {
    payment_method: paymentMethodId,
    expand: ['payment_intent']
});
```

**3D Secure Error Handling:**
```typescript
if (paymentError.code === 'invoice_payment_intent_requires_action') {
    // Retrieve payment intent with client_secret for frontend confirmation
    const updatedInvoice = await stripe.invoices.retrieve(invoice.id, {
        expand: ['payment_intent']
    });
    
    requiresAction = true;
    clientSecret = paymentIntent.client_secret;
}
```

#### 3. Multiple Payment Intent Retrieval Strategies

When 3D Secure is required, the backend implements fallback logic:

1. **Primary**: Retrieve updated invoice after payment attempt
2. **Secondary**: Retrieve updated subscription with latest invoice
3. **Fallback**: Search recent payment intents for the customer

```typescript
// Fallback strategy
const recentPaymentIntents = await stripe.paymentIntents.list({
    customer: stripeCustomerId,
    limit: 5
});

const requiresActionPI = recentPaymentIntents.data.find(pi => 
    pi.status === 'requires_action' && pi.client_secret
);
```

#### 4. Frontend 3D Secure Confirmation (`MultiSubscriptionCheckout.tsx`)

**State Management:**
```typescript
const [processing3DS, setProcessing3DS] = useState(false);
const [stripe, setStripe] = useState(null);
```

**Payment Confirmation:**
```typescript
const handle3DSecureAuthentication = async (subscriptionsRequiring3DS) => {
    for (const subscription of subscriptionsRequiring3DS) {
        const confirmResult = await stripe.confirmCardPayment(
            subscription.clientSecret
        );
        
        if (confirmResult.error) {
            throw new Error(confirmResult.error.message);
        }
    }
    
    // Verify payment completion
    await verifyPaymentCompletion(subscriptionsRequiring3DS);
};
```

#### 5. Payment Verification Without Webhooks

**Manual Status Check (`check-payment-status/route.ts`):**
```typescript
const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice.payment_intent']
});

// Check if payment succeeded but subscription still incomplete
if (stripeSubscription.status === 'incomplete' && paymentIntentStatus === 'succeeded') {
    shouldUpdate = true;
    newStatus = 'active';
}
```

**Database Update:**
```typescript
await db.update(subscriptions)
    .set({
        status: newStatus,
        startDate: currentPeriodStart,
        endDate: currentPeriodEnd,
        updatedAt: new Date().toISOString(),
    })
    .where(eq(subscriptions.id, localSubscription.id));
```

### Status Flow

1. **Initial State**: `subscription.status = 'incomplete'`, `requiresAction = true`
2. **3D Secure Popup**: User completes authentication via Stripe's secure popup
3. **Confirmation**: `confirmCardPayment` confirms the payment intent
4. **Verification**: Backend checks Stripe status and updates local database
5. **Completion**: Subscription status updated to `'active'`

### Error Handling

**Backend Error Types:**
- `invoice_payment_intent_requires_action`: 3D Secure required
- `card_declined`: Payment method declined
- `insufficient_funds`: Card has insufficient funds

**Frontend Error Handling:**
```typescript
if (confirmResult.error) {
    logger.error('Payment confirmation failed', {
        error: confirmResult.error
    });
    throw new Error(confirmResult.error.message || 'Autentificarea 3D Secure a eșuat');
}
```

### Security Considerations

1. **Client Secret Security**: Payment intent client secrets are only provided to authenticated users
2. **Subscription Ownership**: Verification APIs check subscription ownership before updates
3. **Payment Method Validation**: Payment methods are attached to customers before use
4. **Secure Confirmation**: All payment confirmations happen through Stripe's secure infrastructure

### Testing 3D Secure

**Test Cards for 3D Secure:**
- `4000 0027 6000 3184`: Requires 3D Secure authentication
- `4000 0000 0000 3220`: 3D Secure authentication required, but will be declined

**Testing Flow:**
1. Create subscription with 3D Secure test card
2. Verify `requiresAction = true` in response
3. Use `client_secret` to trigger `confirmCardPayment`
4. Complete 3D Secure challenge in popup
5. Verify subscription becomes active

### Comprehensive Logging

**Backend Logging Tracks:**
- Subscription creation steps
- Payment intent status changes
- 3D Secure requirements and confirmations
- Invoice payment attempts
- Error conditions and fallback strategies

**Frontend Logging Tracks:**
- Payment confirmation attempts
- 3D Secure popup interactions
- Verification API calls
- State transitions and errors

### Key Implementation Benefits

1. **No Webhook Dependency**: Works without webhook configuration
2. **Robust Fallback Logic**: Multiple strategies to retrieve payment intents
3. **Real-time Verification**: Manual status checking ensures immediate updates
4. **Comprehensive Error Handling**: Graceful handling of all 3D Secure scenarios
5. **Security Compliance**: Meets SCA requirements for European payments

## Support

For issues or questions:
- Stripe Documentation: https://stripe.com/docs
- API Reference: https://stripe.com/docs/api
- Testing Guide: https://stripe.com/docs/testing
