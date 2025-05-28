# SEO-Doctor

SEO-Doctor is a dashboard application for managing digital services and subscriptions. It provides a clean and modern interface for users to track their orders, services, invoices, and payment methods.

## Features

- **User Authentication**: Secure login with Turso SQLite database
- **Dashboard Overview**: Quick overview of recent orders, services, and invoices
- **Order Management**: View and track orders history
- **Service Management**: Manage subscribed services and view their details
- **Invoice Tracking**: Track invoices and payment history
- **Payment Methods**: Securely manage payment methods with Stripe integration
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Database**: Turso SQLite with Drizzle ORM
- **Payments**: Stripe API
- **Authentication**: Custom authentication with Turso

## Getting Started

### Prerequisites

- Node.js 16+ and npm/pnpm
- Turso CLI (for database operations)
- Stripe account (for payment integration)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/seo-doctor.git
   cd seo-doctor
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Turso and Stripe credentials

4. Set up the database:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. Seed the database with test data:
   ```bash
   # Seed only a test user
   pnpm db:seed

   # Seed a test user with services, orders, invoices, and subscriptions
   pnpm db:seed:data

   # Run all seeding operations
   pnpm db:seed:all
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

7. Visit http://localhost:3000 to see the app in action

8. Log in with the test account:
   ```
   Email: test@example.com
   Password: password123
   ```

## Database Setup

SEO-Doctor uses Turso SQLite for data storage. To set up your database:

1. Install the Turso CLI
2. Create a new database:
   ```bash
   turso db create seo-doctor
   ```
3. Get your database URL and auth token:
   ```bash
   turso db show seo-doctor --url
   turso db tokens create seo-doctor
   ```
4. Add these to your `.env` file

## Stripe Integration

This project uses Stripe for payment processing. To set up Stripe:

1. Create a Stripe account and get your API keys
2. Add your publishable key and secret key to `.env`
3. Set up a webhook endpoint for receiving Stripe events:
   - Use Stripe CLI for local testing or deploy to receive real webhook events
   - The webhook endpoint is `/api/webhook`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Next.js team for the amazing framework
- Tailwind CSS for the styling system
- Stripe for payment processing
- Turso for the database solution

## Troubleshooting

### Dynamic APIs in Next.js App Router

When using dynamic APIs in Next.js App Router, make sure to await them before accessing their values:

1. **Cookies**: Always await `cookies()` before accessing its values:
   ```typescript
   // Correct way:
   const cookiesStore = cookies();
   const value = await cookiesStore.get('cookie_name');
   ```

   Our app uses a custom `verifyAuth` function in `utils/auth.ts` that properly handles this.

2. **Route Parameters**: Always await `params` before accessing its properties:
   ```typescript
   // Correct way in route handlers:
   export async function GET(
     request: NextRequest,
     { params }: { params: { id: string } }
   ) {
     const paramsObj = await params;
     const id = paramsObj.id;
     // ...
   }
   ```

Our implementation properly handles both these cases to avoid errors like:

```
Error: Route "/api/route" used `cookies().get('cookie_name')`. `cookies()` should be awaited before using its value.
Error: Route "/api/route/[id]" used `params.id`. `params` should be awaited before using its properties.
```

The code supports both the older synchronous access patterns and the newer asynchronous patterns from Next.js.