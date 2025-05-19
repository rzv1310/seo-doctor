# MiniDash

MiniDash is a dashboard application for managing digital services and subscriptions. It provides a clean and modern interface for users to track their orders, services, invoices, and payment methods.

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
   git clone https://github.com/yourusername/minidash.git
   cd minidash
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
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

MiniDash uses Turso SQLite for data storage. To set up your database:

1. Install the Turso CLI
2. Create a new database:
   ```bash
   turso db create minidash
   ```
3. Get your database URL and auth token:
   ```bash
   turso db show minidash --url
   turso db tokens create minidash
   ```
4. Add these to your `.env.local` file

## Stripe Integration

This project uses Stripe for payment processing. To set up Stripe:

1. Create a Stripe account and get your API keys
2. Add your publishable key and secret key to `.env.local`
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