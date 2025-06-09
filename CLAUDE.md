### Project

Project Scope: Customer & Admin Portal with Stripe Integration
The core objective is to build or refine a web application that allows users to manage their accounts and services, while providing an administrator with the tools to oversee users and their billing. A key technical goal is to conduct a full code review and refactoring to ensure seamless synchronization between the user interface, the Turso database, and Stripe.

Key Features
1. User Account & Portal
Users must have a self-service portal with the following capabilities:

Account Management: Create an account, log in, change password, and permanently delete their account.
Service Purchasing: The ability to browse and buy available services.
Billing Center: Access to a complete history of their invoices and the ability to manage saved payment methods.
Direct Admin Support: A built-in chat feature to communicate directly with the site administrator.

2. Administrator Dashboard
The administrator requires a secure dashboard with the following functionalities:

User Oversight: View a comprehensive list of all registered users on the platform.
Centralized Invoice Management: Access all invoices for all users, with the ability to filter the invoice list by a specific user.
Admin-User Communication: A chat interface to receive and respond to user messages.
Admin Role Assignment: The administrator role will be set manually in the database, not through the application's UI.

3. Technical & Financial Requirements
Payment Gateway: All payments must be processed through Stripe.
Database: The application must use Turso as its database.
Currency & Localization:
The entire user-facing application must be in Romanian.
All prices and invoices displayed in the app's interface must be in Euros (EUR).
All payment transactions processed by Stripe must be in Romanian Leu (RON).



### Guidelines

+ use pnpm
+ use 'import db from '@/database';' to import the database
+ use 4 spaces for indentation
+ after imports use three blank lines
+ import order: libraries, files outside the directory of the file, files in the same directory, files in subdirectories
+ add a blank line at the end of the file
+ the user interface must be in Romanian
+ Stripe IDs are stored in environment variables for security, not hardcoded in git
+ all the prices are always in EUR



## Setup Scripts

**data/services.ts** is the source of truth for all services.

### Complete Setup (recommended):
- `pnpm initialize` - Runs complete setup: db:generate → db:migrate → required:generate-stripe → required:seed-database

### Individual Required Scripts (if running manually):
1. `pnpm db:generate` - Generate database schema
2. `pnpm db:migrate` - Run database migrations
3. `pnpm required:generate-stripe` - Creates Stripe products/prices from data/services.ts and updates .env
4. `pnpm required:seed-database` - Seeds database with services from data/services.ts

### Test Scripts (for development/testing):
- `pnpm test:seed-user` - Seeds test user data
- `pnpm test:seed-admin` - Seeds test admin data
- `pnpm test:seed-data` - Seeds test data
