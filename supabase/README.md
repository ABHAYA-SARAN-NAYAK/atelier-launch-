# Atelier Launch — Supabase Backend

Complete backend infrastructure for the Atelier Launch fashion marketplace.

## Architecture

```
supabase/
├── migrations/              # SQL migrations (run in order)
│   ├── 001_create_enums.sql
│   ├── 002_create_tables.sql
│   ├── 003_create_functions.sql
│   ├── 004_create_triggers.sql
│   ├── 005_create_rls_policies.sql
│   ├── 006_create_storage.sql
│   ├── 007_enable_realtime.sql
│   └── 008_create_cron_jobs.sql
├── functions/               # Edge Functions (API layer)
│   ├── _shared/             # Shared utilities
│   │   ├── cors.ts
│   │   ├── supabase.ts
│   │   ├── stripe.ts
│   │   └── email.ts         # Resend + all 8 email templates
│   ├── auth-signup/
│   ├── auth-login/
│   ├── collections/
│   ├── products/
│   ├── designers/
│   ├── follows/
│   ├── cart/
│   ├── checkout/
│   ├── stripe-webhook/
│   ├── orders/
│   ├── analytics/
│   └── upload/
└── seed.sql                 # Test data
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **API keys** from Settings → API

### 2. Run Database Migrations

In the Supabase Dashboard → SQL Editor, run each migration file **in order** (001 → 008):

```sql
-- Copy and paste each .sql file in order
-- 001_create_enums.sql
-- 002_create_tables.sql
-- 003_create_functions.sql
-- 004_create_triggers.sql
-- 005_create_rls_policies.sql
-- 006_create_storage.sql
-- 007_enable_realtime.sql
-- 008_create_cron_jobs.sql (requires pg_cron, Pro plan or higher)
```

Or using Supabase CLI:
```bash
supabase db push --db-url "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### 3. Seed the Database (Optional)

```sql
-- Run seed.sql in the SQL Editor for test data
```

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### 5. Set Up Stripe

1. Create a [Stripe](https://stripe.com) account
2. Get test API keys from the Stripe Dashboard
3. Set secrets in Supabase Dashboard → Settings → Edge Functions → Secrets:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

### 6. Set Up Resend (Email)

1. Create a [Resend](https://resend.com) account (free tier: 100 emails/day)
2. Add your domain or use Resend's test domain
3. Set `RESEND_API_KEY` and `FROM_EMAIL` in Edge Function secrets

### 7. Deploy Edge Functions

Using the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy auth-signup
supabase functions deploy auth-login
supabase functions deploy collections
supabase functions deploy products
supabase functions deploy designers
supabase functions deploy follows
supabase functions deploy cart
supabase functions deploy checkout
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy orders
supabase functions deploy analytics
supabase functions deploy upload
```

> **Note:** `stripe-webhook` must be deployed with `--no-verify-jwt` since Stripe sends unsigned requests.

### 8. Configure Stripe Webhook

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select event: `checkout.session.completed`
4. Copy the webhook signing secret and add it as `STRIPE_WEBHOOK_SECRET`

### 9. Set Edge Function Secrets

In Supabase Dashboard → Settings → Edge Functions → Secrets:

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Your project URL |
| `SUPABASE_ANON_KEY` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (⚠️ never expose) |
| `STRIPE_SECRET_KEY` | Stripe secret test key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key |
| `FROM_EMAIL` | Sender email address |
| `SITE_URL` | Your frontend URL |

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `users` | All users (buyers, students, pro designers) |
| `designer_profiles` | Extended profiles for designers |
| `collections` | Fashion collection drops (72-hour windows) |
| `products` | Individual products within collections |
| `orders` | Purchase orders with commission tracking |
| `follows` | User → Designer follow relationships |
| `cart_items` | Shopping cart |
| `analytics_snapshots` | Daily designer analytics history |

### Commission Model

| User Type | Platform Commission | Designer Payout |
|-----------|-------------------|-----------------|
| Student Designer | 15% | 85% |
| Pro Designer | 10% | 90% |

### Collection Lifecycle

```
draft → live → ended
       ↑ auto-transition when drop_start_date <= NOW()
              ↑ auto-transition when drop_end_date < NOW()
```

## API Reference

See [api-docs.md](./api-docs.md) for full API documentation.

## Testing

1. Run seed data for sample designers, collections, and products
2. Import the Postman collection from `postman-collection.json`
3. Test complete flow: Signup → Create Collection → Add Products → Buy → Fulfill

## Security

- All mutations require authentication
- RLS policies enforce data isolation
- Stripe webhook signatures are verified
- File uploads have MIME type and size validation
- Password requirements: 8+ chars, uppercase, lowercase, number
