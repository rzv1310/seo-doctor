# SEO Doctor

A modern SaaS dashboard for SEO services with Stripe subscriptions, real-time chat, and comprehensive user management.

## 🚀 Quick Start

```bash
# Clone and install
git clone [repository-url]
cd seo-doctor
pnpm install

# Set up environment variables
cp .env.example .env  # Then fill in your credentials

# Initialize everything (database + Stripe)
pnpm initialize

# Start development
pnpm dev
```

Visit http://localhost:3000

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: [Turso](https://turso.tech) (SQLite) + Drizzle ORM
- **Payments**: [Stripe](https://stripe.com) (subscriptions, invoices, payment methods)
- **Email**: Nodemailer (SMTP)
- **UI**: TailwindCSS + Custom components
- **Auth**: Custom JWT implementation

## 📋 Features

- **Authentication**: Secure login/register with password reset
- **Subscription Management**: Stripe-powered recurring payments
- **Real-time Chat**: Admin-user messaging system
- **Invoice System**: Automated invoice generation and tracking
- **Payment Methods**: Secure card management via Stripe
- **Admin Dashboard**: User management and support tools
- **Responsive Design**: Mobile-first approach

## 🔧 Environment Variables

Create `.env` file with:

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://[database].turso.io
TURSO_AUTH_TOKEN=your-token

# Authentication
AUTH_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Database Setup

### Turso Setup
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create seo-doctor

# Get credentials
turso db show seo-doctor --url
turso db tokens create seo-doctor
```

## 💳 Stripe Setup

1. Create Stripe account and get API keys
2. Set up webhook endpoint:
   ```bash
   # For local development
   stripe listen --forward-to localhost:3000/api/webhook
   ```
3. Products are auto-generated from `data/services.ts` via `pnpm required:generate-stripe`

## Initialize
```bash
pnpm initialize
```

## 📦 Scripts

### Setup
- `pnpm initialize` - Complete setup (DB + Stripe + Seeds)
- `pnpm required:generate-stripe` - Generate Stripe products
- `pnpm required:seed-database` - Seed services

### Development
- `pnpm dev` - Start dev server
- `pnpm build` - Build for production
- `pnpm lint` - Run linter

### Testing
- `pnpm test:seed-user` - Create test user
- `pnpm test:seed-admin` - Create admin user
- `pnpm test:seed-data` - Create test data

### Database
- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Apply migrations
- `pnpm db:drop` - Drop all tables

## 🚀 Deployment

Environment variables needed:
- All from `.env` file
- Set `NODE_ENV=production`

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 📁 Project Structure

```
├── app/              # Next.js app router pages
├── components/       # React components
├── context/         # React contexts (Auth, Cart, Dashboard)
├── data/            # Static data and configurations
├── database/        # Database schema and connection
├── hooks/           # Custom React hooks
├── lib/             # Utilities (auth, stripe, logger)
├── scripts/         # Setup and maintenance scripts
└── types/           # TypeScript types
```

## 🔐 Security

- Environment variables for sensitive data
- Stripe webhook signature verification
- HTTP-only cookies for authentication
- CSRF protection via SameSite cookies
- Input validation and sanitization

## 🧪 Test Accounts

After running `pnpm test:seed-user`:
- **User**: test@example.com / password123
- **Admin**: admin@example.com / admin123 (if using `test:seed-admin`)

## 📝 Development Notes

- **Source of Truth**: `data/services.ts` defines all services
- **Stripe IDs**: Stored in env vars, not hardcoded
- **UI Language**: Romanian (as per requirements)
- **Code Style**: 4 spaces, specific import order (see CLAUDE.md)

## 🐛 Troubleshooting

### Database Connection Issues
- Verify Turso credentials in `.env`
- Check if database is active: `turso db list`

### Stripe Webhook Errors
- Ensure webhook secret is correct
- Verify endpoint URL matches Stripe dashboard
- Check webhook signature with Stripe CLI

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
