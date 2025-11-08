INCONSISTENCIES CORRECTION

1. CRITICAL: Parts Count Mismatch ---> Change line 5 from "15 logical parts" to "16 logical parts"

2. Alert Limits Not in OpenAPI Specs ---> Add to trading_alerts_openapi.yaml under SubscriptionPlan schema

3. Watchlist Item Limits Not Specified ---> Define explicit limits:

FREE tier: e.g., 5 watchlist items (XAUUSD × 7 timeframes = max 7, so 5 is reasonable)
PRO tier: e.g., 50 watchlist items (10 symbols × 7 timeframes = max 70, so 50 is reasonable)

4. Seed Code Structure Unclear ---> This is the correct one ---> v7_phase_1_policies.md (lines 72-134): Shows seed code as regular folders

Here are the correct one

   docs 
   seed-code/
   ├── market_ai_engine.py          # Flask/MT5 foundation
   ├── saas-starter/                # Next.js backend reference
   │   ├── app/
   │   ├── components/
   │   ├── lib/
   │   └── ...
   └── next-shadcn-dashboard-starter/ # Frontend UI reference
       ├── app/
       ├── components/
       ├── lib/
       └── ...

So I need to fix README.MD ?

===========================================

CRITICAL ISSUES CORRECTION
1. MISSING: Exact MQL5 Indicator Buffer Mapping ---> Include the actual .mq5 indicator files in seed-code/ folder ---> I have finished these (please check out my github repo)

seed-code/
├── mlq5-indicator/           ← NEW!
│   ├── Fractal Diagonal Line_V4.mq5
│   └── Fractal Horizontal Line_V5.mq5
├── next-shadcn-dashboard-starter/
├── saas-starter/
└── market_ai_engine.py


2. BLOCKING: Seed Code Not Present in Repository ---> Verified seed-code/ folder contains:

seed-code/
├── mlq5-indicator/           ← NEW!
│   ├── Fractal Diagonal Line_V4.mq5
│   └── Fractal Horizontal Line_V5.mq5
├── next-shadcn-dashboard-starter/
├── saas-starter/
└── market_ai_engine.py

Therefore, remove step 4 from Phase 1 in the v7_phase_1_policies.md ---> I have finished these (please check out my github repo)


3. API Rate Limits Not Defined ---> Define specific rate limits:

FREE tier: e.g., 60 requests/hour (1 per minute average)
PRO tier: e.g., 300 requests/hour (5 per minute average)
Add these to SubscriptionPlan schema examples
Add to policy documents ---> Please provide me implementation of these


4. Environment Variable List Incomplete ---> Create complete .env.example template in docs showing ALL variables:

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Database
DATABASE_URL=

# MT5 Service
MT5_API_URL=
MT5_LOGIN=
MT5_PASSWORD=
MT5_SERVER=
MT5_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=

# MiniMax M2
OPENAI_API_KEY=
OPENAI_API_BASE=https://api.minimaxi.com/v1

Resolution : we will discuss these later as I am currently not ready for # Auth, # Database, # MT5 Service, # Stripe, and # Email (only # MiniMax M2 is ready ---> I have done this please check out)

===================================================================================

CLARIFICATIONS NEEDED

1. Pricing Information
FREE tier: $0/month (confirmed)
PRO tier: $29/month <---- confirm this
Please provide me implementation of this related to document updates

2. Email Service Choice
Confirm Resend.com is the email provider
Please provide me implementation of this related to document updates

3. Webhook URL Structure
Confirm structure is /api/webhooks/stripe/route.ts per Next.js 15 App Router conventions
Please provide me implementation of this related to document updates

4. Indicators Compilation
Resolution : No user could have MetaTrader 5 MetaEditor access (All users are not allowed to use SaaS with MT5 and MT5 MetaEditor access) Users could not configure symbols, timeframes, paramerters, etc using MT5 or MT5 MetaEditor.
Please provide me implementation of this related to document updates

5. Docker in Development
Resolution : Docker is optional for development (can run Flask with python run.py) but required for Railway deployment
Please provide me implementation of this related to document updates

6. Admin User Creation
Resolution : Add Prisma seed script that creates first admin user
Please provide me implementation of this related to document updates

7. Chart Data Refresh Rate
Resolution : Define explicit refresh strategy in policy docs.
Please provide me implementation of this related to document updates

8. Testing Coverage Requirements
Resolution : make testing optional for MVP with required manual testing checklist.
Please provide me required manual testing checklist for MVP
Please provide me implementation of this related to document updates


 
