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

**Scope:** Visual references and seed code for UI frontend components (20 total components)

**Purpose:** These files serve as visual prototypes and coding patterns for Aider to build production-ready components for the complete Trading Alerts SaaS V7 UI.

**Complete Folder Structure:**
```
seed-code/v0-components/
├── README.md                          # Complete mapping guide (20 components)
│
├── public-pages/                      # 3 marketing/public components
│   ├── homepage.tsx                   # → app/(marketing)/page.tsx
│   ├── homepage-package.json
│   ├── pricing-page.tsx               # → app/(marketing)/pricing/page.tsx
│   ├── pricing-package.json
│   ├── registration-page.tsx          # → app/(auth)/register/page.tsx
│   └── registration-package.json
│
├── auth/                              # 2 authentication components
│   ├── login-page.tsx                 # → app/(auth)/login/page.tsx
│   ├── login-package.json
│   ├── forgot-password-page.tsx       # → app/(auth)/forgot-password/page.tsx
│   └── forgot-password-package.json
│
├── dashboard/                         # 8 dashboard page components
│   ├── dashboard-overview.tsx         # → app/(dashboard)/dashboard/page.tsx
│   ├── dashboard-package.json
│   ├── watchlist-page.tsx             # → app/(dashboard)/watchlist/page.tsx
│   ├── watchlist-package.json
│   ├── alert-creation-modal.tsx       # → components/alerts/alert-modal.tsx
│   ├── alert-modal-package.json
│   ├── alerts-list.tsx                # → app/(dashboard)/alerts/page.tsx
│   ├── alerts-package.json
│   ├── billing-page.tsx               # → app/(dashboard)/settings/billing/page.tsx
│   ├── billing-package.json
│   ├── settings-layout.tsx            # → app/(dashboard)/settings/layout.tsx
│   ├── settings-package.json
│   ├── profile-settings.tsx           # → app/(dashboard)/settings/profile/page.tsx
│   └── profile-package.json
│
├── components/                        # 4 reusable UI components
│   ├── chart-controls.tsx             # → components/charts/chart-controls.tsx
│   ├── chart-controls-package.json
│   ├── empty-states.tsx               # → components/ui/empty-state.tsx
│   ├── empty-states-package.json
│   ├── notification-bell.tsx          # → components/layout/notification-bell.tsx
│   ├── notification-package.json
│   ├── user-menu.tsx                  # → components/layout/user-menu.tsx
│   ├── user-menu-package.json
│   ├── footer.tsx                     # → components/layout/footer.tsx
│   └── footer-package.json
│
├── layouts/                           # 3 existing seed components (REFERENCE ONLY)
│   ├── dashboard-layout.tsx           # → app/(dashboard)/layout.tsx
│   ├── dashboard-page.tsx
│   ├── dashboard-package.json
│   ├── dashboard-globals.css
│   └── professional-trader-avatar.png
│
├── charts/                            # Existing chart seed component
│   ├── trading-chart.tsx              # → components/charts/trading-chart.tsx
│   ├── trading-chart-page.tsx
│   └── trading-chart-package.json
│
└── alerts/                            # Existing alert seed component
    ├── alert-card.tsx                 # → components/alerts/alert-card.tsx
    ├── alert-card-page.tsx
    └── alert-card-package.json
```

**Component Categories:**

| Category | Components | Purpose |
|----------|------------|---------|
| Public Pages | 3 | Marketing, pricing, registration |
| Authentication | 2 | Login, password reset |
| Dashboard Pages | 8 | Main app pages (dashboard, watchlist, alerts, settings) |
| Reusable Components | 4 | UI components (controls, empty states, notifications, menus) |
| Existing Seed | 3 | Original seed components (layouts, charts, alerts) |
| **Total** | **20** | **Complete UI frontend coverage** |

**How Aider Uses These Files:**

1. **Pattern 1: Direct Page Adaptation**
   - Read v0 page component structure
   - Adapt for Next.js 15 App Router (app directory)
   - Replace mock data with real API calls
   - Add tier validation logic
   - Add authentication checks (session management)
   - Example: `public-pages/homepage.tsx` → `app/(marketing)/page.tsx`

2. **Pattern 2: Component Extraction**
   - Extract reusable components from seed files
   - Create standalone component files
   - Add tier-based filtering and validation
   - Connect to real-time data sources
   - Example: `components/chart-controls.tsx` → `components/charts/chart-controls.tsx`

3. **Pattern 3: Modal/Dialog Components**
   - Adapt modal UI from seed files
   - Add form validation (React Hook Form + Zod)
   - Connect to API endpoints
   - Add success/error handling
   - Example: `dashboard/alert-creation-modal.tsx` → `components/alerts/alert-modal.tsx`

4. **Pattern 4: Layout Wrappers**
   - Use as structural template
   - Add NextAuth session handling
   - Integrate tier badges and user menus
   - Add responsive navigation
   - Example: `dashboard/settings-layout.tsx` → `app/(dashboard)/settings/layout.tsx`

**Key Features of All Seed Components:**

- **TradingView Lightweight Charts Integration**
  - Professional-grade charting for financial data
  - Interactive crosshair and tooltips
  - Zoom and pan functionality
  - Mobile-optimized touch gestures

- **Modern UI Components (shadcn/ui + Radix UI)**
  - 14 Radix UI components integrated
  - Consistent design system across all pages
  - Fully accessible (ARIA compliant)
  - Dark mode support
  - Mobile-responsive layouts

- **Form Handling with Validation**
  - React Hook Form for all forms
  - Zod schemas for validation
  - Real-time error messages
  - User-friendly feedback

- **Tier-Based Access Control**
  - FREE vs PRO feature differentiation
  - Upgrade prompts for restricted features
  - Symbol and timeframe filtering
  - Alert count limits

- **Mock Data → Real Data Transformation**
  - Seed files use hardcoded mock data
  - Production files connect to live APIs:
    - `/api/indicators` (Flask MT5 service)
    - `/api/alerts` (Alert management)
    - `/api/watchlist` (Watchlist management)
    - `/api/tier` (Tier validation)
    - `/api/subscription` (Billing/upgrades)
    - `/api/user` (Profile management)

**Complete Integration Workflow:**

```
V0.dev Generation
    ↓
seed-code/v0-components/{category}/{component-name}.tsx
    ↓
Aider Reads (via .aider.conf.yml)
    ↓
Aider Adapts with:
    ├── API Integration (real endpoints)
    ├── Tier Validation (FREE/PRO checks)
    ├── Authentication (NextAuth sessions)
    ├── TypeScript Types (OpenAPI-generated)
    ├── Error Handling (try-catch, error states)
    └── Loading States (Skeleton, Spinner)
    ↓
Claude Code Validates
    ├── Type Safety Check
    ├── Quality Standards Check
    ├── Architecture Rules Check
    └── Coding Patterns Check
    ↓
Production Files:
    ├── app/(marketing)/* (public pages)
    ├── app/(auth)/* (authentication)
    ├── app/(dashboard)/* (main app)
    └── components/* (reusable UI)
```

**Dependencies (All Installed in package.json ✅):**

- `next@^15.0.0` - Next.js framework
- `react@^19.0.0` + `react-dom@^19.0.0` - React library
- `@radix-ui/react-*` (14 components) - UI primitives
- `lucide-react@^0.303.0` - Icon library
- `tailwind-merge@^2.2.0` + `clsx@^2.1.0` - Styling utilities
- `lightweight-charts@^4.1.1` - TradingView charts
- `react-hook-form@^7.49.0` + `zod@^3.22.4` - Form handling
- `next-auth@^4.24.5` - Authentication
- `@prisma/client@^5.7.0` - Database ORM
- `stripe@^14.10.0` - Payment processing
- `date-fns@^3.0.6` - Date formatting
- `react-image-crop@^10.1.5` - Avatar cropping

**File Count:** ~50 seed component files (20 components × ~2.5 files each)

**Usage in .aider.conf.yml:**

All seed component files are configured as `read-only` references in Aider's configuration. Aider reads these files to understand:
- UI layout patterns and structure
- Component composition and nesting
- Styling conventions (Tailwind CSS classes)
- Interactive behaviors (onClick, onChange events)
- Form structure and validation patterns
- Responsive design breakpoints

**API Endpoints Required (from all 17 new components):**

| Endpoint | Method | Used By | Purpose |
|----------|--------|---------|---------|
| `/api/auth/register` | POST | Registration | Create user account |
| `/api/auth/forgot-password` | POST | Forgot Password | Send reset email |
| `/api/dashboard/stats` | GET | Dashboard Overview | Get user stats |
| `/api/watchlist` | GET, POST, DELETE | Watchlist Page | Manage watchlist |
| `/api/alerts` | GET, POST, PATCH, DELETE | Alert Modal, Alerts List | Manage alerts |
| `/api/tier/symbols` | GET | Chart Controls | Get allowed symbols |
| `/api/subscription` | GET, POST | Billing Page | Manage subscription |
| `/api/user/profile` | GET, PATCH | Profile Settings | Update profile |
| `/api/notifications` | GET, PATCH | Notification Bell | Manage notifications |

**Production File Mapping (Complete):**

```
17 New Components → Production Locations:

Public Pages:
  1. homepage.tsx          → app/(marketing)/page.tsx
  2. pricing-page.tsx      → app/(marketing)/pricing/page.tsx
  3. registration-page.tsx → app/(auth)/register/page.tsx

Auth:
  4. login-page.tsx              → app/(auth)/login/page.tsx
  5. forgot-password-page.tsx    → app/(auth)/forgot-password/page.tsx

Dashboard:
  6. dashboard-overview.tsx      → app/(dashboard)/dashboard/page.tsx
  7. watchlist-page.tsx          → app/(dashboard)/watchlist/page.tsx
  8. alert-creation-modal.tsx    → components/alerts/alert-modal.tsx
  9. alerts-list.tsx             → app/(dashboard)/alerts/page.tsx
  10. billing-page.tsx           → app/(dashboard)/settings/billing/page.tsx
  11. settings-layout.tsx        → app/(dashboard)/settings/layout.tsx
  12. profile-settings.tsx       → app/(dashboard)/settings/profile/page.tsx

Components:
  13. chart-controls.tsx         → components/charts/chart-controls.tsx
  14. empty-states.tsx           → components/ui/empty-state.tsx
  15. notification-bell.tsx      → components/layout/notification-bell.tsx
  16. user-menu.tsx              → components/layout/user-menu.tsx
  17. footer.tsx                 → components/layout/footer.tsx

Existing Seed (3):
  ✅ dashboard-layout.tsx  → app/(dashboard)/layout.tsx
  ✅ trading-chart.tsx     → components/charts/trading-chart.tsx
  ✅ alert-card.tsx        → components/alerts/alert-card.tsx
```

**Important Notes:**

- ⚠️ These are **reference implementations** with mock data only
- ⚠️ Do NOT copy seed files directly to production without adaptation
- ✅ Use as visual guide and structural pattern reference
- ✅ Aider must adapt with real API integration, tier validation, auth checks
- ✅ All production files must include TypeScript types (no `any`)
- ✅ All production files must include error handling and loading states
- ✅ Follow coding patterns from `docs/policies/05-coding-patterns.md`
- ✅ Validate with Claude Code before committing

**Related Documentation:**

- **Complete Mapping:** `docs/ui-components-map.md` - Detailed component-by-component guide
- **Seed Component README:** `seed-code/v0-components/README.md` - Full structure and usage guide
- **Coding Patterns:** `docs/policies/05-coding-patterns.md` - Code standards
- **Quality Standards:** `docs/policies/02-quality-standards.md` - Quality requirements

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
| **Seed** | **V0 Components** | **~50** | **⭐⭐⭐** | **Reference** |

**Total: ~170 production files + ~50 seed reference files (20 components)**