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
