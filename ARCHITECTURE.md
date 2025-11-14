# Trading Alerts SaaS - System Architecture

## 1. System Overview

**What the Project Does:**

Trading Alerts SaaS is a web application that enables traders to monitor multiple financial markets (Forex, Crypto, Indices, Commodities) and set automated alerts based on fractal-based support and resistance levels. The system integrates with MetaTrader 5 (MT5) to fetch real-time market data and provides a tiered subscription model (FREE and PRO) with varying levels of access. Additionally, it operates as a **2-sided marketplace** with an affiliate marketing program that allows partners to promote the platform and earn commissions.

**Key Features:**
- Real-time market data visualization from MT5
- Fractal-based support/resistance detection with multi-point trendlines
- Automated alert system when price approaches key levels
- Watchlist management for favorite symbol/timeframe combinations
- Tiered access control (FREE: 5 symbols × 3 timeframes, PRO: 15 symbols × 9 timeframes)
- Subscription management with Stripe integration
- Responsive dashboard built with Next.js 15 and shadcn/ui
- **Affiliate Marketing Program** (2-sided marketplace)
  * Affiliates can register and generate unique referral codes
  * Earn 20% commission on referred PRO subscriptions
  * Dedicated affiliate portal with analytics and payment tracking
  * Admin dashboard for managing affiliates and commission approvals

**Technical Indicators:**
- **Fractal Horizontal Lines V5** (Peak-to-Peak and Bottom-to-Bottom trendlines)
- **Fractal Diagonal Lines V4** (Mixed Peak-Bottom ascending/descending trendlines)

---

## 2. Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Charts:** Recharts or lightweight-charts
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

### Backend (Next.js)
- **API Routes:** Next.js 15 serverless functions
- **Authentication:** NextAuth.js v5
- **Database ORM:** Prisma 5
- **Validation:** Zod
- **API Contract:** OpenAPI 3.0 (trading_alerts_openapi.yaml)

### Backend (Flask Microservice)
- **Framework:** Flask 3.x
- **Language:** Python 3.11
- **MT5 Integration:** MetaTrader5 Python package
- **API Contract:** OpenAPI 3.0 (flask_mt5_openapi.yaml)
- **Production Server:** Gunicorn

### Database
- **Primary Database:** PostgreSQL 15
- **Hosting:** Railway
- **ORM:** Prisma (TypeScript)
- **Migrations:** Prisma Migrate

### External Services
- **MT5 Terminal:** MetaTrader 5 (Windows/Linux VPS)
- **Payments:** Stripe
- **Email:** Resend
- **Deployment:** Vercel (Next.js), Railway (PostgreSQL + Flask)

### AI Development
- **Model:** MiniMax M2 (via OpenAI-compatible API)
- **Validation:** Claude Code
- **Autonomous Builder:** Aider

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      USERS (Browsers)                            │
│    FREE Tier  |  PRO Tier  |  AFFILIATES  |  ADMINS            │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (Edge Network)                         │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │           NEXT.JS 15 APPLICATION (SSR + API)               │ │
│  │                                                            │ │
│  │  Frontend:                    Backend API:                │ │
│  │  ├─ Server Components         ├─ /api/alerts             │ │
│  │  ├─ Client Components         ├─ /api/fractals           │ │
│  │  ├─ Dashboard UI              ├─ /api/users              │ │
│  │  ├─ Charts                    ├─ /api/watchlist          │ │
│  │  ├─ Forms                     ├─ /api/auth (NextAuth)    │ │
│  │  ├─ Affiliate Portal          ├─ /api/affiliate/*        │ │
│  │  └─ Admin Dashboard           ├─ /api/admin/affiliates/* │ │
│  │                               └─ /api/webhooks (Stripe)  │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────┬──────────────────────────┬───────────────────────────┘
            │                          │
            │                          │
    ┌───────▼──────────────┐      ┌────────▼─────────────────┐
    │  PostgreSQL DB   │      │  Flask MT5 Service  │
    │   (Railway)      │      │    (Railway)        │
    │                  │      │                     │
    │ - Users          │      │ - MT5 Integration   │
    │ - Alerts         │      │ - Fractal Detection │
    │ - Watchlists     │      │ - Trendline Calc    │
    │ - Subscriptions  │      │ - Tier Validation   │
    │ - Affiliates     │      └─────────┬───────────┘
    │ - AffiliateCodes │                │
    │ - Commissions    │                │ MT5 API
    └──────────────────┘                ▼
                              ┌─────────────────────┐
                              │   MT5 Terminal      │
                              │   (VPS/Local)       │
                              │                     │
                              │ - Market Data       │
                              │ - Price Feeds       │
                              │ - Fractal Indicators│
                              └─────────────────────┘

    External Services:
    ├─ Stripe (Payments + Commissions) ─┐
    └─ Resend (Email) ──────────────┐  │
                                    │  │
                                ┌───▼──▼──────┐
                                │  Webhooks    │
                                │  (Vercel)    │
                                │  - Track refs│
                                │  - Calc comm.│
                                └──────────────┘
```

---

## 4. Component Breakdown

### 4.1 Frontend (Next.js - Vercel)

**Location:** `app/` directory

**Responsibilities:**
- Server-side rendering (SSR) for SEO and performance
- Client-side interactivity (forms, real-time updates)
- User authentication UI (login, register, profile)
- Dashboard with charts, alerts, watchlists
- Tier-aware UI (disable PRO features for FREE users)

**Key Files:**
```
app/
├── (marketing)/
│   ├── page.tsx                 # Homepage
│   ├── pricing/page.tsx         # Pricing page
│   └── layout.tsx               # Marketing layout
├── dashboard/
│   ├── page.tsx                 # Dashboard home (Server Component)
│   ├── layout.tsx               # Dashboard layout with nav
│   ├── alerts/
│   │   ├── page.tsx             # Alerts list
│   │   └── [id]/page.tsx        # Alert detail
│   ├── charts/
│   │   └── page.tsx             # Live charts with fractals
│   ├── watchlist/
│   │   └── page.tsx             # Watchlist management
│   └── settings/
│       └── page.tsx             # User settings
├── api/                         # API Routes (serverless functions)
│   ├── alerts/route.ts
│   ├── fractals/[symbol]/[timeframe]/route.ts
│   ├── auth/[...nextauth]/route.ts
│   └── webhooks/stripe/route.ts
└── layout.tsx                   # Root layout

components/
├── ui/                          # shadcn/ui primitives
├── alerts/
│   ├── alert-form.tsx           # Create/edit alert (Client Component)
│   ├── alert-card.tsx           # Display alert
│   └── alert-list.tsx           # List of alerts
├── charts/
│   ├── fractal-chart.tsx        # Chart with fractal indicators
│   └── trendline-overlay.tsx   # Trendline visualization
└── dashboard/
    └── nav.tsx                  # Dashboard navigation
```

**Tech Notes:**
- Default to **Server Components** (async, fetch data directly)
- Use **Client Components** (`'use client'`) only when needed (state, events, hooks)
- Data fetching: Server Components fetch directly, Client Components use `/api` routes
- Real-time updates: Polling (not WebSocket for MVP)

---

### 4.1.1 Affiliate Portal & Admin Dashboard (Part 17)

**Location:** `app/affiliate/` and `app/admin/` directories

**Responsibilities:**
- Affiliate registration, login, and code generation
- Affiliate analytics dashboard (referred users, earnings, payment status)
- Admin management of affiliates (approval, suspension)
- Commission tracking and approval workflow
- Separate authentication system for affiliates (not NextAuth)

**Key Files:**
```
app/
├── affiliate/
│   ├── register/page.tsx          # Affiliate registration form
│   ├── login/page.tsx              # Affiliate login (separate from user login)
│   ├── dashboard/page.tsx          # Affiliate analytics dashboard
│   ├── codes/page.tsx              # Generate and manage referral codes
│   ├── earnings/page.tsx           # Commission tracking and payment requests
│   └── layout.tsx                  # Affiliate portal layout
├── admin/
│   ├── affiliates/
│   │   ├── page.tsx                # List all affiliates
│   │   ├── [id]/page.tsx           # Affiliate detail and management
│   │   ├── pending/page.tsx        # Pending affiliate approvals
│   │   └── commissions/page.tsx    # Commission approval workflow
│   └── layout.tsx                  # Admin layout
└── api/
    ├── affiliate/
    │   ├── auth/
    │   │   ├── register/route.ts   # Affiliate registration endpoint
    │   │   └── login/route.ts      # Affiliate JWT login
    │   ├── codes/
    │   │   ├── route.ts            # Generate/list affiliate codes
    │   │   └── [code]/route.ts     # Code validation and usage
    │   ├── dashboard/route.ts      # Affiliate analytics data
    │   └── earnings/route.ts       # Commission history
    └── admin/
        └── affiliates/
            ├── route.ts            # List/create affiliates
            ├── [id]/route.ts       # Update/delete affiliate
            ├── [id]/approve/route.ts    # Approve affiliate
            ├── [id]/suspend/route.ts    # Suspend affiliate
            └── commissions/
                ├── route.ts        # List commissions
                └── [id]/approve/route.ts # Approve commission payout

components/
├── affiliate/
│   ├── affiliate-code-generator.tsx  # Crypto-secure code generation UI
│   ├── affiliate-stats-cards.tsx     # Analytics cards (referrals, earnings)
│   ├── earnings-table.tsx            # Commission history table
│   └── payment-request-form.tsx      # Request payout form
└── admin/
    ├── affiliate-approval-card.tsx   # Approve/reject affiliate
    ├── affiliate-list-table.tsx      # Admin affiliate management table
    ├── commission-approval-queue.tsx # Commission approval UI
    └── affiliate-accounting-report.tsx # Accounting-style reports
```

**Authentication Pattern (Separate from User Auth):**
```typescript
// Affiliate authentication uses separate JWT (not NextAuth)
// Pattern 7: Separate JWT for affiliates

// lib/auth/affiliate-jwt.ts
import jwt from 'jsonwebtoken';

const AFFILIATE_JWT_SECRET = process.env.AFFILIATE_JWT_SECRET!; // Separate secret

export function generateAffiliateToken(affiliateId: string, email: string) {
  return jwt.sign(
    { affiliateId, email, type: 'affiliate' },
    AFFILIATE_JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyAffiliateToken(token: string) {
  try {
    return jwt.verify(token, AFFILIATE_JWT_SECRET) as AffiliateJWTPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid affiliate token');
  }
}

// Middleware for affiliate routes
export async function affiliateAuthMiddleware(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) throw new UnauthorizedError('No token provided');

  const payload = verifyAffiliateToken(token);
  return payload;
}
```

**Affiliate Code Generation (Crypto-Secure):**
```typescript
// Pattern 8: Crypto-secure affiliate code generation
import crypto from 'crypto';

export function generateAffiliateCode(prefix: string = 'REF'): string {
  // Crypto-secure random bytes (not Math.random)
  const randomBytes = crypto.randomBytes(8);
  const code = randomBytes.toString('base64url').toUpperCase().slice(0, 12);
  return `${prefix}-${code}`;
}
```

**Commission Calculation (Webhook-Only):**
```typescript
// Pattern 9: Commission calculation only in Stripe webhook
// app/api/webhooks/stripe/route.ts

export async function POST(req: Request) {
  const event = await stripe.webhooks.constructEvent(/* ... */);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Check for affiliate referral in metadata
    const affiliateCode = session.metadata?.affiliate_code;

    if (affiliateCode) {
      // Find affiliate code in database
      const code = await prisma.affiliateCode.findUnique({
        where: { code: affiliateCode },
        include: { affiliate: true }
      });

      if (code && code.affiliate.status === 'APPROVED') {
        // Calculate 20% commission
        const subscriptionAmount = session.amount_total / 100; // cents to dollars
        const commissionAmount = subscriptionAmount * 0.20;

        // Create commission record (pending approval)
        await prisma.commission.create({
          data: {
            affiliateId: code.affiliateId,
            userId: session.client_reference_id,
            subscriptionId: session.subscription,
            amount: commissionAmount,
            status: 'PENDING',
            stripeChargeId: session.payment_intent
          }
        });

        // Increment affiliate code usage count
        await prisma.affiliateCode.update({
          where: { id: code.id },
          data: { usageCount: { increment: 1 } }
        });
      }
    }
  }

  return Response.json({ received: true });
}
```

**Tech Notes:**
- Separate authentication system for affiliates (JWT, not NextAuth)
- Crypto-secure code generation (`crypto.randomBytes`, not `Math.random`)
- Commission calculation ONLY in Stripe webhook (single source of truth)
- Accounting-style reports for admin (Pattern 10)
- All commission payouts require admin approval

---

### 4.2 Backend API (Next.js API Routes - Vercel)

**Location:** `app/api/` directory

**Responsibilities:**
- RESTful API endpoints for frontend
- Authentication and authorization (NextAuth.js)
- Tier validation before data access
- Database operations via Prisma
- Business logic layer
- Webhook handlers (Stripe)

**API Structure:**
```typescript
// Standard pattern for ALL API routes:
export async function GET(req: Request) {
  try {
    // 1. Authentication
    const session = await getServerSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Tier validation (if applicable)
    const userTier = session.user.tier || 'FREE';
    validateChartAccess(userTier, symbol, timeframe);

    // 3. Business logic
    const data = await fetchFractalData();

    // 4. Response matching OpenAPI schema
    return Response.json(data);
  } catch (error) {
    // 5. Error handling
    console.error('Error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Key Endpoints:**
- `GET /api/alerts` - Fetch user's alerts
- `POST /api/alerts` - Create new alert (with tier validation)
- `GET /api/fractals/{symbol}/{timeframe}` - Fetch fractal data from MT5
- `GET /api/users/me` - Get current user profile
- `POST /api/webhooks/stripe` - Handle Stripe payment events

**Tech Notes:**
- All endpoints defined in `docs/trading_alerts_openapi.yaml`
- Auto-generated TypeScript types in `lib/api-client/`
- Tier validation uses `lib/tier/validation.ts`
- Database operations use `lib/db/` utilities

---

### 4.3 Business Logic Layer

**Location:** `lib/` directory

**Responsibilities:**
- Pure business logic (no HTTP, no UI)
- Tier validation utilities
- Database operation wrappers
- Shared utilities and helpers
- Custom React hooks

**Key Modules:**
```
lib/
├── tier/
│   ├── validation.ts            # Tier access validation
│   └── constants.ts             # Tier limits and rules
├── db/
│   ├── prisma.ts                # Prisma client singleton
│   ├── alerts.ts                # Alert CRUD operations
│   ├── users.ts                 # User CRUD operations
│   └── watchlist.ts             # Watchlist CRUD operations
├── utils/
│   ├── date-helpers.ts          # Date formatting (date-fns)
│   └── error-handlers.ts        # Custom error classes
└── hooks/
    ├── use-alerts.ts            # Client-side alert data hook
    └── use-session.ts           # Wrapper for useSession
```

**Separation of Concerns:**
- `lib/tier/` → Tier validation (used by API routes)
- `lib/db/` → Database operations (used by API routes)
- `lib/utils/` → Pure utilities (used everywhere)
- `lib/hooks/` → React hooks (used by Client Components)

---

### 4.4 Database Layer (Prisma + PostgreSQL)

**Location:** `prisma/schema.prisma`

**Responsibilities:**
- Data persistence
- Relational data modeling
- Type-safe database queries
- Migrations

**Schema Overview:**
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String   // Hashed with bcrypt
  name          String?
  tier          String   @default("FREE")  // "FREE" or "PRO"
  role          String   @default("USER")  // "USER" or "ADMIN"
  isActive      Boolean  @default(true)
  emailVerified DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  alerts        Alert[]
  watchlistItems WatchlistItem[]
  subscription  Subscription?
}

model Alert {
  id          String   @id @default(cuid())
  userId      String
  symbol      String
  timeframe   String
  condition   String   // "price_near_fractal_horizontal", "price_near_fractal_diagonal", etc.
  targetPrice Double?  // Optional target price for alert
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  triggeredAt DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isActive])
}

model WatchlistItem {
  id        String   @id @default(cuid())
  userId    String
  symbol    String
  timeframe String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, symbol, timeframe])
  @@index([userId])
}

model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  stripeCustomerId  String   @unique
  stripePriceId     String
  stripeCurrentPeriodEnd DateTime
  status            String   // "active", "canceled", "past_due"
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  commissions Commission[]
}

// Affiliate Marketing Models (Part 17)

model Affiliate {
  id              String   @id @default(cuid())
  email           String   @unique
  password        String   // Hashed with bcrypt
  companyName     String?
  contactName     String
  status          String   @default("PENDING")  // "PENDING", "APPROVED", "SUSPENDED", "REJECTED"
  totalEarnings   Float    @default(0.0)
  totalReferrals  Int      @default(0)
  paymentEmail    String?  // PayPal or bank email for payouts
  taxId           String?  // Tax ID for 1099 reporting
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  affiliateCodes  AffiliateCode[]
  commissions     Commission[]

  @@index([status])
  @@index([email])
}

model AffiliateCode {
  id          String   @id @default(cuid())
  affiliateId String
  code        String   @unique  // Crypto-secure generated code (e.g., "REF-ABC123XYZ")
  usageCount  Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  affiliate   Affiliate @relation(fields: [affiliateId], references: [id], onDelete: Cascade)
  commissions Commission[]

  @@index([affiliateId])
  @@index([code])
}

model Commission {
  id              String   @id @default(cuid())
  affiliateId     String
  userId          String?  // User who subscribed (optional if subscription deleted)
  subscriptionId  String?  // Stripe subscription ID
  codeId          String   // Which affiliate code was used
  amount          Float    // Commission amount (20% of subscription)
  status          String   @default("PENDING")  // "PENDING", "APPROVED", "PAID", "REJECTED"
  stripeChargeId  String?  // Stripe payment intent ID for audit trail
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  affiliate       Affiliate @relation(fields: [affiliateId], references: [id], onDelete: Cascade)
  affiliateCode   AffiliateCode @relation(fields: [codeId], references: [id])
  subscription    Subscription? @relation(fields: [subscriptionId], references: [id])

  @@index([affiliateId])
  @@index([status])
  @@index([createdAt])
}
```

**Migration Workflow:**
1. Update `prisma/schema.prisma`
2. Local: `npx prisma migrate dev --name description`
3. Railway: `DATABASE_URL=[Railway] npx prisma migrate deploy`
4. Verify: `npx prisma studio`

---

### 4.5 Flask MT5 Service (Railway)

**Location:** `mt5-service/` directory

**Responsibilities:**
- Connect to MetaTrader 5 terminal
- Fetch real-time market data
- Calculate fractal indicators (using MQL5 indicators)
- Calculate trendlines (horizontal and diagonal)
- Validate tier access (double-check)
- Serve fractal data via REST API

**Structure:**
```
mt5-service/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── routes/
│   │   └── fractals.py          # /api/fractals routes
│   ├── services/
│   │   ├── mt5_connector.py     # MT5 connection logic
│   │   └── fractal_calculator.py # Fractal detection logic
│   └── middleware/
│       └── tier_validator.py    # Tier validation
├── indicators/
│   ├── Fractal_Horizontal_Line_V5.mq5
│   └── Fractal_Diagonal_Line_V4.mq5
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Container config
├── .env.example
└── run.py                       # Entry point
```

**Key Endpoint:**
```python
# GET /api/fractals/{symbol}/{timeframe}
@fractals_bp.route('/api/fractals/<symbol>/<timeframe>', methods=['GET'])
@validate_tier_access  # Tier validation middleware
def get_fractals(symbol: str, timeframe: str):
    """Fetch fractal data from MT5"""
    try:
        # Fetch raw market data
        ohlcv_data = fetch_mt5_data(symbol, timeframe)
        
        # Calculate fractals using indicator logic
        horizontal_lines = calculate_horizontal_fractals(ohlcv_data)
        diagonal_lines = calculate_diagonal_fractals(ohlcv_data)
        
        return jsonify({
            'symbol': symbol,
            'timeframe': timeframe,
            'horizontal_lines': horizontal_lines,
            'diagonal_lines': diagonal_lines,
            'metadata': {
                'fetchedAt': datetime.utcnow().isoformat(),
                'source': 'MT5'
            }
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch fractal data'}), 500
```

**Fractal Detection:**
- **Horizontal Lines:** Peak-to-Peak and Bottom-to-Bottom multi-point trendlines
  - Detects fractals using 108-bar pattern (configurable)
  - Connects 3+ fractal points in near-horizontal lines
  - Displays angles (positive for ascending, negative for descending)
  
- **Diagonal Lines:** Mixed Peak-Bottom trendlines
  - Ascending support (Bottom → Peak)
  - Descending resistance (Peak → Bottom)
  - Requires alternating peak/bottom touches
  - Minimum 4 touches with proper alternation

**Why Separate Service:**
- MT5 Python library requires Python (Next.js is JavaScript)
- MQL5 indicators need MT5 terminal connection
- Isolates MT5 connection from main app
- Can scale independently
- Easier to debug MT5-specific issues

---

## 5. Data Flow

### 5.1 User Creates an Alert

```
1. USER clicks "Create Alert" button in dashboard
   │
   ▼
2. FRONTEND (components/alerts/alert-form.tsx - Client Component)
   - Displays form with tier-aware symbol/timeframe dropdowns
   - FREE users see 5 symbols (BTCUSD, EURUSD, USDJPY, US30, XAUUSD) × 3 timeframes (H1, H4, D1)
   - PRO users see all 15 symbols × 9 timeframes
   - User fills: symbol=XAUUSD, timeframe=H1, condition="price_near_fractal"
   - Client-side validation with Zod
   - On submit: fetch('/api/alerts', { method: 'POST', body: {...} })
   │
   ▼
3. API LAYER (app/api/alerts/route.ts)
   - Receives POST /api/alerts request
   - Step 1: Authentication check (getServerSession)
     * If no session → return 401 Unauthorized
   - Step 2: Input validation with Zod
     * Validate symbol, timeframe, condition
     * If invalid → return 400 Bad Request
   - Step 3: Tier validation
     * Get user's tier from session (FREE or PRO)
     * Call validateChartAccess(tier, symbol, timeframe)
     * If FREE user tries AUDJPY (PRO-only) → return 403 Forbidden
   - Step 4: Check alert count limit
     * Count user's existing alerts
     * FREE tier: max 5 alerts
     * PRO tier: max 20 alerts
     * If limit reached → return 403 Forbidden
   - Step 5: Create alert in database
     * Call prisma.alert.create({ data: {...} })
   - Step 6: Return created alert (matching OpenAPI schema)
     * Return 201 Created with alert object
   │
   ▼
4. BUSINESS LOGIC (lib/tier/validation.ts)
   - validateChartAccess(tier, symbol, timeframe)
   - Checks if tier can access symbol (FREE: 5 symbols, PRO: 15 symbols)
   - Checks if tier can access timeframe (FREE: 3 TFs, PRO: 9 TFs)
   - If violation → throw ForbiddenError
   │
   ▼
5. DATABASE LAYER (Prisma)
   - prisma.alert.create({
       data: {
         userId: session.user.id,
         symbol: 'XAUUSD',
         timeframe: 'H1',
         condition: 'price_near_fractal_horizontal',
         isActive: true,
       }
     })
   - PostgreSQL on Railway receives INSERT statement
   - Returns created alert object with id, createdAt, etc.
   │
   ▼
6. API LAYER returns response to FRONTEND
   - Response.json(alert, { status: 201 })
   │
   ▼
7. FRONTEND receives response
   - Form shows success message
   - Redirects to /dashboard/alerts
   - Alert appears in list
```

---

### 5.2 User Views Live Chart with Fractals

```
1. USER navigates to /dashboard/charts?symbol=XAUUSD&timeframe=H1
   │
   ▼
2. FRONTEND (app/dashboard/charts/page.tsx - Server Component)
   - Fetches initial data on server-side
   - Passes to FractalChart Client Component
   │
   ▼
3. FRONTEND (components/charts/fractal-chart.tsx - Client Component)
   - Displays chart with initial fractal data
   - Sets up polling interval (60s for FREE, 30s for PRO)
   - Every N seconds: fetch('/api/fractals/XAUUSD/H1')
   │
   ▼
4. API LAYER (app/api/fractals/[symbol]/[timeframe]/route.ts)
   - Receives GET /api/fractals/XAUUSD/H1
   - Step 1: Authentication (getServerSession)
   - Step 2: Tier validation (validateChartAccess)
   - Step 3: Call Flask MT5 service
     * fetch('http://flask-service/api/fractals/XAUUSD/H1', {
         headers: { 'X-User-Tier': userTier }
       })
   │
   ▼
5. FLASK MT5 SERVICE (mt5-service/app/routes/fractals.py)
   - Receives GET /api/fractals/XAUUSD/H1
   - Middleware validates tier (double-check security)
   - Calls MT5 connector: fetch_fractal_data('XAUUSD', 'H1')
   │
   ▼
6. MT5 CONNECTOR (mt5-service/app/services/fractal_calculator.py)
   - Connects to MT5 terminal (local or VPS)
   - Fetches XAUUSD H1 candles (OHLCV data)
   - Detects fractals using 108-bar pattern
   - Calculates horizontal trendlines:
     * Peak-to-Peak lines (resistance)
     * Bottom-to-Bottom lines (support)
   - Calculates diagonal trendlines:
     * Ascending support (Bottom → Peak)
     * Descending resistance (Peak → Bottom)
   - Returns fractal data with trendlines
   │
   ▼
7. FLASK returns data to Next.js API
   - JSON response with horizontal and diagonal lines
   │
   ▼
8. API LAYER returns data to FRONTEND
   - Response.json({ 
       symbol, 
       timeframe, 
       horizontal_lines: [...], 
       diagonal_lines: [...],
       metadata 
     })
   │
   ▼
9. FRONTEND updates chart
   - FractalChart component receives new data
   - Updates chart visualization with:
     * Red lines for resistance (peak-to-peak, descending)
     * Green lines for support (bottom-to-bottom, ascending)
     * Labels showing touches, bar length, angles
   - Shows "Last updated: X seconds ago"
   - Cycle repeats every N seconds
```

---

### 5.3 Affiliate Referral and Commission Flow

```
1. AFFILIATE registers and generates unique code
   │
   ▼
2. AFFILIATE shares referral link: yourapp.com/register?ref=REF-ABC123XYZ
   │
   ▼
3. NEW USER clicks referral link
   - Referral code stored in session/cookie
   - User proceeds to registration
   │
   ▼
4. NEW USER subscribes to PRO tier
   - Proceeds to Stripe checkout
   - Affiliate code attached to Stripe session metadata
   │
   ▼
5. STRIPE processes payment successfully
   - Sends webhook to /api/webhooks/stripe
   │
   ▼
6. WEBHOOK HANDLER (app/api/webhooks/stripe/route.ts)
   - Verifies Stripe signature
   - Extracts affiliate_code from session.metadata
   - Validates affiliate code exists and affiliate is APPROVED
   │
   ▼
7. COMMISSION CALCULATION (ONLY in webhook)
   - Calculate 20% of subscription amount
   - Create Commission record (status: PENDING)
   - Link to: affiliateId, userId, subscriptionId, codeId
   - Increment affiliateCode.usageCount
   - Update affiliate.totalReferrals
   │
   ▼
8. ADMIN reviews commission in /admin/affiliates/commissions
   - Verifies subscription is legitimate
   - Checks for fraud patterns
   - Approves or rejects commission
   │
   ▼
9. COMMISSION APPROVED
   - Update commission.status = "APPROVED"
   - Update affiliate.totalEarnings += commission.amount
   - Send email notification to affiliate
   │
   ▼
10. AFFILIATE requests payout via /affiliate/earnings
    - Admin processes payment (external to system)
    - Update commission.status = "PAID"
    - Record commission.paidAt timestamp
```

**Key Security Notes:**
- Commission calculation ONLY happens in Stripe webhook (single source of truth)
- Affiliate code stored in Stripe metadata (tamper-proof)
- All commissions require admin approval before payout
- Separate JWT authentication for affiliates (not NextAuth)
- Crypto-secure code generation prevents guessing

---

## 6. Authentication Flow

### 6.1 User Registration

```
1. User fills registration form (/register)
   ↓
2. POST /api/auth/register
   ↓
3. Validate input (email, password, name)
   ↓
4. Hash password with bcrypt
   ↓
5. Create user in database (default tier: FREE, role: USER)
   ↓
6. Send verification email (Resend)
   ↓
7. Return success (auto-login or redirect to /login)
```

### 6.2 User Login (NextAuth.js)

```
1. User submits login form
   ↓
2. NextAuth.js CredentialsProvider
   ↓
3. Validate email + password against database
   ↓
4. If valid: Create JWT session
   ↓
5. Store session in secure cookie
   ↓
6. Redirect to /dashboard
```

### 6.3 Session Management

**NextAuth.js Configuration:**
```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,  // Include tier in session
          role: user.role,
        };
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tier = user.tier;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.tier = token.tier;
      session.user.role = token.role;
      return session;
    }
  }
};
```

**Protected Routes (Middleware):**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
```

---

### 6.4 Affiliate Authentication Flow (Separate from Users)

**Why Separate:** Affiliates are NOT users of the platform; they are partners who promote it. They need different authentication, permissions, and data access.

```
1. Affiliate registers at /affiliate/register
   ↓
2. POST /api/affiliate/auth/register
   ↓
3. Create Affiliate record (status: PENDING)
   ↓
4. Admin approves affiliate at /admin/affiliates/[id]/approve
   ↓
5. Affiliate.status = "APPROVED"
   ↓
6. Affiliate logs in at /affiliate/login
   ↓
7. POST /api/affiliate/auth/login
   ↓
8. Validate email + password (bcrypt)
   ↓
9. Generate JWT token (separate secret: AFFILIATE_JWT_SECRET)
   ↓
10. Return { token, affiliate: { id, email, status, totalEarnings } }
   ↓
11. Client stores token in localStorage
   ↓
12. All affiliate API requests include: Authorization: Bearer <token>
   ↓
13. Server validates with verifyAffiliateToken(token)
```

**Key Differences from User Auth:**
- **Separate JWT secret:** `AFFILIATE_JWT_SECRET` (not NextAuth)
- **Separate session storage:** Token in localStorage (not httpOnly cookie)
- **No NextAuth:** Manual JWT implementation
- **Different permissions:** Affiliates can ONLY access `/api/affiliate/*` routes
- **Approval required:** Affiliates must be approved by admin before login works

**Middleware Protection:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // User dashboard routes (NextAuth)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const session = await getServerSession();
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
  }

  // Affiliate portal routes (JWT)
  if (request.nextUrl.pathname.startsWith('/affiliate')) {
    const token = request.cookies.get('affiliate_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/affiliate/login', request.url));

    try {
      verifyAffiliateToken(token);
    } catch {
      return NextResponse.redirect(new URL('/affiliate/login', request.url));
    }
  }

  // Admin routes (NextAuth with role check)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
```

---

## 7. Tier System

### 7.1 Tier Definitions

| Feature | FREE Tier | PRO Tier |
|---------|-----------|----------|
| **Price** | $0/month | $29/month |
| **Symbols** | 5 (BTCUSD, EURUSD, USDJPY, US30, XAUUSD) | 15 (AUDJPY, AUDUSD, BTCUSD, ETHUSD, EURUSD, GBPJPY, GBPUSD, NDX100, NZDUSD, US30, USDCAD, USDCHF, USDJPY, XAGUSD, XAUUSD) |
| **Timeframes** | 3 (H1, H4, D1) | 9 (M5, M15, M30, H1, H2, H4, H8, H12, D1) |
| **Chart Combinations** | 15 (5 × 3) | 135 (15 × 9) |
| **Max Alerts** | 5 | 20 |
| **Max Watchlist Items** | 5 | 50 |
| **API Rate Limit** | 60 req/hour (1 per minute) | 300 req/hour (5 per minute) |
| **Chart Update Interval** | 60 seconds | 30 seconds |

### 7.2 Tier Enforcement

**Backend Validation (CRITICAL):**
```typescript
// lib/tier/validation.ts
export function validateChartAccess(tier: UserTier, symbol: string, timeframe: string) {
  // Validate symbol
  const allowedSymbols = tier === 'PRO' ? PRO_SYMBOLS : FREE_SYMBOLS;
  if (!allowedSymbols.includes(symbol)) {
    throw new ForbiddenError(`${tier} tier cannot access ${symbol}`);
  }

  // Validate timeframe
  const allowedTimeframes = tier === 'PRO' ? PRO_TIMEFRAMES : FREE_TIMEFRAMES;
  if (!allowedTimeframes.includes(timeframe)) {
    throw new ForbiddenError(`${tier} tier cannot access ${timeframe} timeframe`);
  }
}

// lib/tier/constants.ts
export const FREE_SYMBOLS = ['BTCUSD', 'EURUSD', 'USDJPY', 'US30', 'XAUUSD'];
export const FREE_TIMEFRAMES = ['H1', 'H4', 'D1'];

export const PRO_SYMBOLS = [
  'AUDJPY', 'AUDUSD', 'BTCUSD', 'ETHUSD', 'EURUSD', 
  'GBPJPY', 'GBPUSD', 'NDX100', 'NZDUSD', 'US30', 
  'USDCAD', 'USDCHF', 'USDJPY', 'XAGUSD', 'XAUUSD'
];
export const PRO_TIMEFRAMES = ['M5', 'M15', 'M30', 'H1', 'H2', 'H4', 'H8', 'H12', 'D1'];
```

**Used in:**
- Next.js API routes: `app/api/fractals/[symbol]/[timeframe]/route.ts`
- Flask MT5 service: `mt5-service/app/middleware/tier_validator.py`

**Frontend UI (User Experience):**
```typescript
// components/charts/symbol-selector.tsx
<Select>
  {SYMBOLS.map(symbol => (
    <SelectItem
      value={symbol.value}
      disabled={!canAccessSymbol(userTier, symbol.value)}
    >
      {symbol.label}
      {symbol.proOnly && userTier === 'FREE' && ' 🔒 PRO'}
    </SelectItem>
  ))}
</Select>
```

---

## 8. Fractal Indicator System

### 8.1 Fractal Detection Algorithm

**Base Pattern (108-Bar Fractals):**
- Uses configurable N-bar pattern (default: 35 bars = 17 bars each side)
- **Upper Fractal (Peak):** High[i] must be highest among surrounding bars
- **Lower Fractal (Bottom):** Low[i] must be lowest among surrounding bars

**Code Pattern (from MQL5):**
```cpp
bool IsUpperFractal(const double &high[], int index, int side_bars) {
   double center_high = high[index];
   
   // Check left side
   for(int i = 1; i <= side_bars; i++)
      if(center_high <= high[index - i])
         return false;
   
   // Check right side
   for(int i = 1; i <= side_bars; i++)
      if(center_high < high[index + i])
         return false;
   
   return true;
}
```

### 8.2 Horizontal Trendlines (Fractal Horizontal Line V5)

**Purpose:** Connect fractals at similar price levels

**Algorithm:**
1. **Detect fractals** using 108-bar pattern
2. **Find multi-point lines:**
   - Connect 3+ peaks (Peak-to-Peak resistance)
   - Connect 3+ bottoms (Bottom-to-Bottom support)
3. **Tolerance:** ±1.5% or 1.5× ATR
4. **Angle calculation:** ATR-normalized (preserves sign)
   - Positive angle = ascending
   - Negative angle = descending
5. **Scoring system:**
   - Fractals touched × 25 points
   - Slope quality × 15 points
   - Line length × 10 points
   - Proximity to current price × 50 points
6. **Display:** Top 3 peak lines + top 3 bottom lines

**Alert Conditions:**
- Price approaches fractal peak + nearby trendline
- Price approaches fractal bottom + nearby trendline

### 8.3 Diagonal Trendlines (Fractal Diagonal Line V4)

**Purpose:** Detect trendline channels with alternating peaks/bottoms

**Algorithm:**
1. **Detect fractals** using same 108-bar pattern
2. **Find diagonal lines:**
   - **Ascending Support:** Bottom → Peak (positive slope)
   - **Descending Resistance:** Peak → Bottom (negative slope)
3. **Mixed touch requirement:**
   - Minimum 4 total touches
   - At least 2 peaks AND 2 bottoms
   - Maximum 2 consecutive same-type touches (alternating pattern)
4. **Angle filtering:** 2° to 45° (configurable)
5. **Display:** Top 3 ascending + top 3 descending lines

**Alert Conditions:**
- Price approaches diagonal support line
- Price approaches diagonal resistance line

### 8.4 Performance Optimizations

Both indicators include advanced optimizations:

1. **Slope Filter:** Pre-filters invalid slopes before full calculation
2. **Spatial Grid:** 20×20 grid indexes fractals by location for faster lookup
3. **Line Cache:** Caches calculated lines when fractal map unchanged
4. **Early Exit:** Stops searching after finding N high-quality lines

**Performance Impact:**
- 60-80% reduction in calculation time
- Caching prevents redundant recalculation
- Spatial indexing reduces O(n²) to O(n log n)

---

## 9. Deployment Architecture

### 9.1 Production Environment

```
┌──────────────────────────────────────────────────────────┐
│                  VERCEL (Next.js)                         │
│  - Auto-deploy from GitHub main branch                   │
│  - Serverless functions for API routes                   │
│  - Edge runtime for middleware                           │
│  - Environment variables: NEXTAUTH_SECRET, DATABASE_URL  │
└──────────┬───────────────────────────┬─────────────────────┘
           │                        │
           ▼                        ▼
┌──────────────────┐      ┌──────────────────────┐
│  RAILWAY         │      │  RAILWAY             │
│  PostgreSQL      │      │  Flask MT5 Service   │
│                  │      │                      │
│  - Production DB │      │  - Docker container  │
│  - Auto backups  │      │  - Python 3.11       │
│  - Migrations    │      │  - MT5 connection    │
└──────────────────┘      └──────────┬───────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  MT5 Terminal        │
                          │  (Windows VPS)       │
                          │                      │
                          │  - Broker: [Your]    │
                          │  - Real-time data    │
                          │  - Fractal Indicators│
                          └──────────────────────┘
```

### 9.2 Deployment Steps

**1. Next.js (Vercel):**
```bash
# Connect GitHub repo to Vercel
# Configure environment variables:
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=[generated-secret]
DATABASE_URL=[Railway PostgreSQL URL]
FLASK_MT5_URL=https://your-flask-service.railway.app
STRIPE_SECRET_KEY=[Stripe secret]
RESEND_API_KEY=[Resend API key]

# Vercel auto-deploys on push to main
git push origin main
```

**2. PostgreSQL (Railway):**
```bash
# Already deployed in Phase 2
# Run migrations:
DATABASE_URL=[Railway URL] npx prisma migrate deploy
```

**3. Flask MT5 Service (Railway):**
```bash
# Push to Railway
railway up

# Configure environment variables:
MT5_SERVER=[broker server]
MT5_LOGIN=[MT5 account]
MT5_PASSWORD=[MT5 password]
FLASK_API_KEY=[same as Next.js]
```

**4. MT5 Terminal Setup:**
```
1. Install MT5 on Windows VPS or local machine
2. Copy indicator files to MT5 Indicators folder:
   - Fractal_Horizontal_Line_V5.mq5
   - Fractal_Diagonal_Line_V4.mq5
3. Compile indicators in MetaEditor
4. Connect Flask service to MT5 terminal
5. Test indicator data retrieval
```

---

## 10. AI Development with MiniMax M2

### 10.1 Policy-Driven Development

**Workflow:**
```
1. Create 6 Policy Documents (Phase 1)
   - 01-approval-policies.md
   - 02-quality-standards.md
   - 03-architecture-rules.md
   - 04-escalation-triggers.md
   - 05-coding-patterns.md
   - 06-aider-instructions.md

2. Configure Aider with MiniMax M2
   - .aider.conf.yml loads all policies
   - MiniMax M2 API for cost-effective building

3. Autonomous Building (Phase 3)
   - Aider builds files following policies
   - Auto-validates with Claude Code
   - Auto-approves if quality standards met
   - Auto-fixes common issues
   - Escalates complex decisions to human

4. Human Role
   - Handles escalations (1-2 per part)
   - Makes architectural decisions
   - Tests completed features
   - Updates policies based on learnings
```

### 10.2 Cost-Effectiveness

**MiniMax M2 vs Alternatives:**
- MiniMax M2: ~80% cheaper than Claude/GPT-4
- Quality: Sufficient for code generation with validation
- Validation: Claude Code ensures quality regardless of model
- Result: 170+ files built at fraction of cost

---

## 11. Seed Code Foundation

### 11.1 Reference Repositories

**1. market_ai_engine.py (Flask/MT5 Reference):**
- **What:** Python Flask server with MT5 integration
- **Used for:** Part 6 (Flask MT5 Service)
- **Reference patterns:**
  * Flask route structure
  * MT5 connection handling
  * Indicator data fetching
  * Error handling in Python

**2. nextjs/saas-starter (Backend/Auth Reference):**
- **What:** Next.js SaaS template with auth, database, payments
- **Used for:** Parts 5 (Auth), 7 (API Routes), 12 (E-commerce), **Part 17 (Affiliate Marketing)**
- **Reference patterns:**
  * NextAuth.js configuration
  * Prisma database patterns
  * Stripe payment integration
  * API route structure
  * Middleware patterns
  * **Stripe webhook handling (critical for commission calculation)**

**3. next-shadcn-dashboard-starter (Frontend/UI Reference):**
- **What:** Next.js dashboard with shadcn/ui components
- **Used for:** Parts 8-14 (All UI components), **Part 17 (Affiliate Portal & Admin Dashboard)**
- **Reference patterns:**
  * Dashboard layout structure
  * shadcn/ui component usage
  * Chart components (Recharts)
  * Form patterns (React Hook Form)
  * Navigation structure
  * Responsive design
  * **Analytics dashboards (for affiliate earnings tracking)**
  * **Admin management interfaces (for affiliate approval workflow)**

### 11.2 How Aider Uses Seed Code

**Aider references seed code as:**
- **Inspiration** (not copy/paste)
- **Pattern reference** (adapt to our requirements)
- **Best practices** (proven approaches)

**Always adapted for:**
- Our OpenAPI contracts
- Our tier system (FREE: 5×3, PRO: 15×9)
- Our specific business logic (fractal-based alerts)
- Our quality standards

---

## 12. Security Considerations

### 12.1 Authentication & Authorization

- ✅ NextAuth.js for session management
- ✅ JWT-based sessions (secure, httpOnly cookies)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Protected routes with middleware
- ✅ API routes check session on every request

### 12.2 Tier Security

- ✅ Backend validation on ALL tier-restricted endpoints
- ✅ Double validation (Next.js + Flask)
- ✅ Frontend disables UI (UX), backend enforces (security)
- ✅ Never trust client-provided tier information

### 12.3 Input Validation

- ✅ Zod schemas validate all user inputs
- ✅ OpenAPI specs define valid request shapes
- ✅ Prisma prevents SQL injection
- ✅ React automatically escapes XSS

### 12.4 Secrets Management

- ✅ All secrets in environment variables
- ✅ .env files gitignored
- ✅ .env.example with placeholders
- ✅ No secrets in logs or error messages

---

## Summary

This architecture enables:
- ✅ **Scalability:** Serverless Next.js, independent Flask service
- ✅ **Security:** Multi-layer validation, NextAuth.js + separate affiliate JWT, Prisma
- ✅ **Performance:** Server Components, edge runtime, polling, optimized indicators
- ✅ **Maintainability:** TypeScript, OpenAPI contracts, Prisma
- ✅ **Cost-Effectiveness:** Vercel free tier, Railway affordable, MiniMax M2 AI
- ✅ **Developer Experience:** Policy-driven AI development, 80% autonomous building
- ✅ **Trading Accuracy:** Advanced fractal detection with multi-point trendlines
- ✅ **2-Sided Marketplace:** Affiliate marketing program with commission tracking
- ✅ **Revenue Growth:** 20% commission model incentivizes partner promotion

**Project Scale:** 17 Parts, **237 files total** (170 core + **67 affiliate/admin**)

**Next Steps:** Proceed to Phase 2 (CI/CD & Database Foundation) or Phase 3 (Autonomous Building with Aider + MiniMax M2).