# V5 Project Structure Division - 16 Logical Parts

## Overview

The V5 project structure is divided into **16 logical parts** that can be built systematically. Each part represents a cohesive set of files and folders.

---

## PART 1: Foundation & Root Configuration

**Scope:** Root-level configuration files

**Folders & Files:**
```
trading-alerts-saas/
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── .env.local (gitignored)
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── README.md
```

**Key Changes from V4:**
- ✅ `next.config.js` - Updated for Next.js 15
- ✅ `package.json` - Next.js 15, React 19 dependencies
- ✅ `.env.example` - 2-tier system variables

**File Count:** ~12 files

---

## PART 2: Database Schema & Migrations

**Scope:** Database layer with Prisma

**Folders & Files:**
```
prisma/
├── schema.prisma
├── seed.ts              # ← Seeds initial admin user
└── migrations/

lib/db/
├── prisma.ts
└── seed.ts              # ← Admin creation script
Create new file: docs/admin-seed-instructions.md
```

# Admin User Creation Guide

## During Development (Part 2: Database)

After creating Prisma schema, create seed script:

**File:** `prisma/seed.ts`

typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create first admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tradingalerts.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      tier: 'PRO',
      emailVerified: new Date(),
      isActive: true,
    },
  });
  
  console.log('✅ Admin user created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
Add to package.json:

{
  "scripts": {
    "db:seed": "ts-node prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
Run after first migration:

# Create database
npx prisma migrate dev --name init

# Seed admin user
pnpm db:seed

# Or with custom credentials
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=SecurePass123! pnpm db:seed
Default Credentials (CHANGE IN PRODUCTION):

Email: admin@davintrade.com
Password: ChangeMe123!
Role: ADMIN
Tier: PRO
First Login:

Go to /login
Login with admin credentials
Change password in Settings
You now have admin access to /admin dashboard

**Key Changes from V4:**
- ✅ `schema.prisma` - 2 tiers (FREE/PRO), WatchlistItem model
- ✅ Remove ENTERPRISE enum
- ✅ Add WatchlistItem model for symbol+timeframe

**File Count:** ~4 files + migrations folder

---

## PART 3: Type Definitions

**Scope:** TypeScript types for V5

**Folders & Files:**
```
types/
├── index.ts
├── indicator.ts
├── alert.ts
├── user.ts
├── tier.ts          # NEW in V5
└── api.ts
```

**Key Changes from V4:**
- ✅ Add `tier.ts` - Tier types and constants
- ✅ Update `user.ts` - Remove ENTERPRISE
- ✅ Update all types for 2-tier system

**File Count:** ~6 files

---

## PART 4: Tier System & Constants

**Scope:** Core tier management system (NEW in V5)

**Folders & Files:**
```
lib/tier/
├── constants.ts     # NEW - TIER_SYMBOLS, TIMEFRAMES
├── middleware.ts    # NEW - Tier access control
└── validator.ts     # NEW - Symbol access validation

lib/config/
└── plans.ts         # Updated for 2 tiers
```

**Key Changes from V5:**
- ✅ NEW folder: `lib/tier/`
- ✅ Timeframes: M5, H12 added; FREE tier limited to 3 timeframes (H1, H4, D1)
- ✅ Symbol lists per tier: FREE (5 symbols), PRO (15 symbols)
- ✅ Access validation functions for BOTH symbols AND timeframes
- ✅ PRO-only timeframes: M5, M15, M30, H2, H8, H12
- ✅ 5 new symbols added: AUDJPY, GBPJPY, NZDUSD, USDCAD, USDCHF

**File Count:** ~4 files

---

## PART 5: Authentication System

**Scope:** Complete auth system

**Folders & Files:**
```
app/(auth)/
├── layout.tsx
├── login/page.tsx
├── register/page.tsx
├── verify-email/page.tsx
├── forgot-password/page.tsx
└── reset-password/page.tsx

app/api/auth/
├── [...nextauth]/route.ts
├── register/route.ts
├── verify-email/route.ts
├── forgot-password/route.ts
└── reset-password/route.ts

components/auth/
├── register-form.tsx
├── login-form.tsx
├── forgot-password-form.tsx
└── social-auth-buttons.tsx

lib/auth/
├── auth-options.ts      # Updated: tier in JWT
├── session.ts           # Updated: tier in session
└── permissions.ts       # NEW: Tier permissions

middleware.ts            # NextAuth + tier checks
```

**Key Changes from V4:**
- ✅ Default new users to FREE tier
- ✅ Add tier to JWT and session
- ✅ NEW: `permissions.ts` for tier-based access

**File Count:** ~17 files

---

## PART 6: Flask MT5 Service

**Scope:** Complete Flask microservice

**Folders & Files:**
```
mt5-service/
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── __init__.py
│   │   └── indicators.py    # Updated: tier validation
│   ├── services/
│   │   ├── __init__.py
│   │   ├── mt5_service.py   # Updated: tier checks, H2/H8
│   │   └── tier_service.py  # NEW: Tier validation
│   └── utils/
│       ├── __init__.py
│       ├── helpers.py
│       └── constants.py     # NEW: Timeframes, symbols
├── indicators/
│   ├── README.md
│   ├── Fractal Horizontal Line_V5.mq5
│   └── Fractal Diagonal Line_V4.mq5
├── tests/
│   └── test_indicators.py
├── Dockerfile
├── .dockerignore
├── requirements.txt
├── run.py
├── .env
└── .env.example
```

**Key Changes from V5:**
- ✅ NEW: `tier_service.py`
- ✅ Updated timeframe mapping: M5, H12 added; 9 total timeframes (M5, M15, M30, H1, H2, H4, H8, H12, D1)
- ✅ Tier validation for BOTH symbols AND timeframes before reading indicators
- ✅ Tier parameter in all functions
- ✅ FREE tier validation: 5 symbols × 3 timeframes only
- ✅ PRO tier validation: 15 symbols × 9 timeframes
- ✅ 5 new symbols in MT5 symbol mapping: AUDJPY, GBPJPY, NZDUSD, USDCAD, USDCHF

**File Count:** ~15 files

---

## PART 7: Indicators API & Tier Routes

**Scope:** Next.js API routes for indicators and tier checking

**Folders & Files:**
```
app/api/tier/
├── symbols/route.ts         # NEW: Get allowed symbols
├── check/[symbol]/route.ts  # NEW: Check symbol access
└── combinations/route.ts    # NEW: Symbol+timeframe combos

app/api/indicators/
├── route.ts
└── [symbol]/[timeframe]/route.ts  # Updated: tier validation

lib/api/
└── mt5-client.ts           # Flask API client
```

**Key Changes from V4:**
- ✅ NEW folder: `app/api/tier/`
- ✅ Tier validation in indicators API
- ✅ Symbol access checking before Flask call

**File Count:** ~6 files

---

## PART 8: Dashboard & Layout Components

**Scope:** Main dashboard and layout

**Folders & Files:**
```
app/(dashboard)/
├── layout.tsx              # Updated: Show tier badge
└── dashboard/page.tsx      # Updated: Tier-based stats

components/layout/
├── header.tsx              # Updated: Show tier
├── sidebar.tsx             # Updated: Tier-based menu
├── mobile-nav.tsx
└── footer.tsx

components/dashboard/
├── stats-card.tsx
├── recent-alerts.tsx
└── watchlist-widget.tsx    # Updated: Symbol+timeframe
```

**Key Changes from V4:**
- ✅ Show user tier in header
- ✅ Tier-based navigation items
- ✅ Dashboard stats per tier

**File Count:** ~9 files

---

## PART 9: Charts & Visualization

**Scope:** Trading charts and TradingView integration

**Folders & Files:**
```
app/(dashboard)/charts/
├── page.tsx                # Updated: Tier-filtered symbols
└── [symbol]/[timeframe]/page.tsx  # Updated: Tier check

components/charts/
├── trading-chart.tsx       # Updated: Load from tier-allowed
├── indicator-overlay.tsx
├── chart-controls.tsx
└── timeframe-selector.tsx  # Updated: H2, H8; no M1, M5

hooks/
├── use-indicators.ts       # Updated: Tier validation
└── use-auth.ts
```

**Key Changes from V5:**
- ✅ Timeframe selector: M5, H12 added; FREE tier limited to H1, H4, D1
- ✅ Symbol selector shows tier-allowed symbols (FREE: 5 symbols, PRO: 15 symbols)
- ✅ Chart page validates BOTH symbol AND timeframe access
- ✅ PRO-only timeframes: M5, M15, M30, H2, H8, H12

**File Count:** ~8 files

---

## PART 10: Watchlist System (NEW Structure)

**Scope:** Symbol+Timeframe watchlist management

**Folders & Files:**
```
app/(dashboard)/watchlist/
└── page.tsx                # NEW: Symbol+timeframe UI

app/api/watchlist/
├── route.ts                # Updated: Symbol+timeframe model
├── [id]/route.ts           # Updated: Delete item
└── reorder/route.ts        # NEW: Reorder items

components/watchlist/
├── symbol-selector.tsx     # NEW: Tier-filtered selector
├── timeframe-grid.tsx      # NEW: Timeframe selection
└── watchlist-item.tsx      # NEW: Shows symbol+timeframe

hooks/
└── use-watchlist.ts        # Updated: Symbol+timeframe
```

**Key Changes from V4:**
- ✅ Complete rewrite: Symbol+timeframe combinations
- ✅ Tier-based symbol filtering
- ✅ WatchlistItem model usage

**File Count:** ~8 files

---

## PART 11: Alerts System

**Scope:** Alert management and notifications

**Folders & Files:**
```
app/(dashboard)/alerts/
├── page.tsx
└── new/page.tsx            # Updated: Tier-allowed symbols

app/api/alerts/
├── route.ts                # Updated: Validate symbol access
└── [id]/route.ts

components/alerts/
├── alert-list.tsx
├── alert-form.tsx          # Updated: Tier-filtered symbols
└── alert-card.tsx

lib/jobs/
├── alert-checker.ts        # Background job
└── queue.ts

hooks/
└── use-alerts.ts
```

**Key Changes from V4:**
- ✅ Alert form shows only tier-allowed symbols
- ✅ API validates symbol access before creating alert

**File Count:** ~10 files

---

## PART 12: E-commerce & Billing (2 Tiers)

**Scope:** Subscription and payment system

**Pricing:**
- FREE tier: $0/month (XAUUSD only, 5 alerts)
- PRO tier: $29/month (10 symbols, 20 alerts)  # ← CONFIRMED

**Features:**
- Stripe integration for PRO upgrades
- Webhook handling for subscription events
- Invoice management
- Upgrade/downgrade flows

**Folders & Files:**
```
app/(marketing)/pricing/
└── page.tsx                # Updated: FREE vs PRO only

app/api/subscription/
├── route.ts
└── cancel/route.ts         # Downgrade to FREE

app/api/checkout/
└── route.ts                # Pro upgrade only

app/api/invoices/
└── route.ts

app/api/webhooks/stripe/
└── route.ts                # POST handler (Next.js 15 App Router)

components/billing/
├── subscription-card.tsx   # Updated: Show 2 tiers
└── invoice-list.tsx

lib/stripe/
├── stripe.ts
└── webhook-handlers.ts     # Updated: 2-tier handling
```

**Key Changes from V4:**
- ✅ Remove ENTERPRISE tier completely
- ✅ Pricing page: FREE (XAUUSD) vs PRO (10 symbols)
- ✅ Symbol comparison table
- ✅ Upgrade/downgrade flows for 2 tiers

**File Count:** ~11 files

---

## PART 13: Settings System

**Scope:** User settings pages

**Folders & Files:**
```
app/(dashboard)/settings/
├── layout.tsx
├── profile/page.tsx
├── appearance/page.tsx
├── account/page.tsx
├── privacy/page.tsx
├── billing/page.tsx        # Updated: 2 tiers
├── language/page.tsx
└── help/page.tsx

app/api/user/
├── profile/route.ts
├── preferences/route.ts
├── password/route.ts
└── account/
    ├── deletion-request/route.ts
    ├── deletion-confirm/route.ts
    └── deletion-cancel/route.ts

lib/preferences/
└── defaults.ts

components/providers/
├── theme-provider.tsx
└── websocket-provider.tsx
```

**Key Changes from V4:**
- ✅ Billing page: Show FREE/PRO tiers
- ✅ Remove Enterprise mentions

**File Count:** ~17 files

---

## PART 14: Admin Dashboard (Optional for MVP)

**Scope:** Admin pages and APIs

**Folders & Files:**
```
app/(dashboard)/admin/
├── layout.tsx
├── page.tsx                # Updated: Track FREE/PRO distribution
├── users/page.tsx          # Updated: Show user tiers
├── api-usage/page.tsx      # Updated: Usage per tier
└── errors/page.tsx

app/api/admin/
├── users/route.ts
├── analytics/route.ts      # Updated: Tier analytics
├── api-usage/route.ts
└── error-logs/route.ts
```

**Key Changes from V4:**
- ✅ Track FREE vs PRO user distribution
- ✅ Revenue analytics per tier
- ✅ API usage per tier

**File Count:** ~9 files

---

## PART 15: Notifications & Real-time

**Scope:** Notification system and WebSocket

**Folders & Files:**
```
app/api/notifications/
├── route.ts
└── [id]/
    ├── read/route.ts
    └── route.ts

components/notifications/
├── notification-bell.tsx
└── notification-list.tsx

lib/websocket/
└── server.ts

lib/monitoring/
└── system-monitor.ts       # Updated: Monitor tier stats

hooks/
├── use-websocket.ts
└── use-toast.ts
```

**Key Changes from V4:**
- ✅ Monitor tier-based system health
- ✅ Track per-tier metrics

**File Count:** ~9 files

---

## PART 16: Utilities & Infrastructure

**Scope:** Helper functions and deployment

**Folders & Files:**
```
lib/email/
└── email.ts

lib/tokens.ts

lib/errors/
├── error-handler.ts
├── api-error.ts
└── error-logger.ts

lib/redis/
└── client.ts

lib/cache/
└── cache-manager.ts

lib/validations/
├── auth.ts
├── alert.ts
├── watchlist.ts           # NEW: Symbol+timeframe validation
└── user.ts

lib/utils/
├── helpers.ts
├── formatters.ts
└── constants.ts           # Updated: Timeframes

.github/workflows/
├── ci-nextjs.yml
├── ci-flask.yml
└── deploy.yml

docker-compose.yml         # Updated: All services
.dockerignore

app/layout.tsx             # Root layout
app/globals.css
app/error.tsx

app/(marketing)/
├── layout.tsx
└── page.tsx               # Landing page

public/
├── icons/
├── images/
└── manifest.json

tests/                     # Future: Testing
```

**Key Changes from V5:**
- ✅ NEW: `watchlist.ts` validation for symbol+timeframe combinations
- ✅ Updated constants: M5, H12 added; 9 total timeframes (M5, M15, M30, H1, H2, H4, H8, H12, D1)
- ✅ Updated symbol constants: 15 total symbols (added AUDJPY, GBPJPY, NZDUSD, USDCAD, USDCHF)
- ✅ Tier-specific constants: FREE_SYMBOLS (5), PRO_SYMBOLS (15), FREE_TIMEFRAMES (3), PRO_TIMEFRAMES (9)
- ✅ Docker compose for all services

**File Count:** ~25 files

---

## 📊 Summary Statistics

| Part | Name | Files | Priority | Complexity |
|------|------|-------|----------|------------|
| 1 | Foundation | ~12 | ⭐⭐⭐ | Low |
| 2 | Database | ~4 | ⭐⭐⭐ | Medium |
| 3 | Types | ~6 | ⭐⭐⭐ | Low |
| 4 | Tier System | ~4 | ⭐⭐⭐ | Medium |
| 5 | Authentication | ~17 | ⭐⭐⭐ | High |
| 6 | Flask Service | ~15 | ⭐⭐⭐ | High |
| 7 | Indicators API | ~6 | ⭐⭐⭐ | Medium |
| 8 | Dashboard | ~9 | ⭐⭐ | Medium |
| 9 | Charts | ~8 | ⭐⭐⭐ | High |
| 10 | Watchlist | ~8 | ⭐⭐ | Medium |
| 11 | Alerts | ~10 | ⭐⭐ | Medium |
| 12 | E-commerce | ~11 | ⭐⭐⭐ | High |
| 13 | Settings | ~17 | ⭐⭐ | Low |
| 14 | Admin | ~9 | ⭐ | Medium |
| 15 | Notifications | ~9 | ⭐⭐ | Medium |
| 16 | Utilities | ~25 | ⭐⭐ | Low |

**Total: ~170 files across 16 parts**

---

## 🎯 Build Order Recommendation

### **Phase 1: Foundation (Week 1)**
```
Parts 1, 2, 3, 4
- Root config
- Database schema
- Types
- Tier system
```

### **Phase 2: Core Systems (Week 2)**
```
Parts 5, 6
- Authentication
- Flask MT5 Service
```

### **Phase 3: Main Features (Week 3-4)**
```
Parts 7, 8, 9
- Indicators API
- Dashboard
- Charts
```

### **Phase 4: User Features (Week 5)**
```
Parts 10, 11, 12
- Watchlist
- Alerts
- E-commerce
```

### **Phase 5: Polish (Week 6)**
```
Parts 13, 14, 15, 16
- Settings
- Admin (optional)
- Notifications
- Utilities
```

---

## SEED CODE: V0.dev Component References

**Scope:** Visual references and seed code for UI frontend components

**Purpose:** These files serve as visual prototypes and coding patterns for Aider to build production-ready components.

**Folders & Files:**
```
seed-code/v0-components/
├── README.md                          # Mapping guide: seed → production
├── layouts/
│   ├── dashboard-layout.tsx          # → app/(dashboard)/layout.tsx
│   ├── dashboard-page.tsx            # Reference implementation
│   ├── dashboard-package.json        # Dependencies needed
│   ├── dashboard-globals.css         # Global styles reference
│   └── professional-trader-avatar.png # Asset example
├── charts/
│   ├── trading-chart.tsx             # → components/charts/trading-chart.tsx
│   ├── trading-chart-page.tsx        # Full page example
│   └── trading-chart-package.json    # TradingView dependencies
└── alerts/
    ├── alert-card.tsx                # → components/alerts/alert-card.tsx
    ├── alert-card-page.tsx           # Usage example
    └── alert-card-package.json       # Component dependencies
```

**How Aider Uses These Files:**

1. **Pattern 1: Direct Adaptation**
   - Read seed component structure
   - Adapt for Next.js 15 App Router
   - Replace mock data with API calls
   - Add tier validation logic

2. **Pattern 2: Component Extraction**
   - Extract sub-components from seed files
   - Create separate files (e.g., timeframe-selector.tsx)
   - Add tier-based filtering

3. **Pattern 3: Layout Reference**
   - Use as visual template
   - Add authentication handling
   - Integrate with NextAuth session

**Key Features of Seed Components:**

- **TradingView Lightweight Charts Integration**
  - Professional-grade charting
  - Interactive crosshair and tooltips
  - Zoom and pan functionality
  - Mobile-optimized touch gestures

- **Modern UI Components (shadcn/ui)**
  - Consistent design system
  - Accessible components
  - Dark mode support
  - Responsive layouts

- **Mock Data → Real Data Transformation**
  - Seed files use mock data
  - Production files connect to:
    - `/api/indicators` (Flask MT5 service)
    - `/api/alerts` (Trading Alerts API)
    - `/api/tier` (Tier validation)

**Integration Points:**

```
seed-code/v0-components/charts/trading-chart.tsx
    ↓
(Aider adapts)
    ↓
components/charts/trading-chart.tsx (Production)
    ├── Uses TradingView Lightweight Charts
    ├── Fetches data from /api/indicators
    ├── Validates tier access
    ├── Adds real-time updates
    └── Integrates with alert creation
```

**Dependencies to Install:**

Based on seed-code package.json files:
- `lightweight-charts` - TradingView charts
- `@radix-ui/*` - shadcn/ui components
- `lucide-react` - Icon library
- `recharts` - Additional charting (optional)

**File Count:** ~12 reference files

**Usage in .aider.conf.yml:**

These files are marked as `read-only` in Aider configuration to serve as reference material without modification. Aider reads these to understand:
- UI patterns and structure
- Component composition
- Styling conventions
- Interactive behaviors

**Important Notes:**

- ⚠️ These are **reference implementations** only
- ⚠️ Do NOT copy directly to production without adaptation
- ✅ Use as visual guide and pattern reference
- ✅ Extract reusable patterns and components
- ✅ Adapt for tier validation and API integration
- ✅ Ensure type safety with OpenAPI-generated types

---

## 📊 Updated Summary Statistics

| Part | Name | Files | Priority | Complexity |
|------|------|-------|----------|------------|
| 1 | Foundation | ~12 | ⭐⭐⭐ | Low |
| 2 | Database | ~4 | ⭐⭐⭐ | Medium |
| 3 | Types | ~6 | ⭐⭐⭐ | Low |
| 4 | Tier System | ~4 | ⭐⭐⭐ | Medium |
| 5 | Authentication | ~17 | ⭐⭐⭐ | High |
| 6 | Flask Service | ~15 | ⭐⭐⭐ | High |
| 7 | Indicators API | ~6 | ⭐⭐⭐ | Medium |
| 8 | Dashboard | ~9 | ⭐⭐ | Medium |
| 9 | Charts | ~8 | ⭐⭐⭐ | High |
| 10 | Watchlist | ~8 | ⭐⭐ | Medium |
| 11 | Alerts | ~10 | ⭐⭐ | Medium |
| 12 | E-commerce | ~11 | ⭐⭐⭐ | High |
| 13 | Settings | ~17 | ⭐⭐ | Low |
| 14 | Admin | ~9 | ⭐ | Medium |
| 15 | Notifications | ~9 | ⭐⭐ | Medium |
| 16 | Utilities | ~25 | ⭐⭐ | Low |
| **Seed** | **V0 Components** | **~12** | **⭐⭐⭐** | **Reference** |

**Total: ~170 production files + ~12 seed reference files**