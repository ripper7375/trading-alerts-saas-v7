# Architecture Rules for Aider with MiniMax M2

## Purpose

This document defines the system design constraints for the Trading Alerts SaaS - how pieces fit together, what goes where, and how data flows. These rules ensure consistent architecture across all 170+ files while being beginner-friendly with clear explanations of WHY each architectural decision matters.

---

## 1. DIRECTORY STRUCTURE

### 1.1 Must Follow v5-structure-division.md Exactly

**Rule:** All files must be placed in locations specified by `docs/v5-structure-division.md`.

**Why this matters:** Consistent structure makes the codebase navigable. Next.js 15 App Router has specific conventions (app/api/, app/dashboard/, etc.) that must be followed for routing to work.

**Structure Overview:**

```
trading-alerts-saas/
├── app/                      # Next.js 15 App Router
│   ├── api/                 # API routes (Next.js serverless functions)
│   │   ├── alerts/
│   │   │   ├── route.ts                    # GET /api/alerts, POST /api/alerts
│   │   │   └── [id]/route.ts               # GET/PATCH/DELETE /api/alerts/:id
│   │   ├── indicators/
│   │   │   └── [symbol]/[timeframe]/route.ts  # GET /api/indicators/:symbol/:timeframe
│   │   └── auth/
│   │       └── [...nextauth]/route.ts      # NextAuth.js endpoints
│   ├── dashboard/           # Dashboard pages (Server Components by default)
│   │   ├── page.tsx         # /dashboard
│   │   ├── layout.tsx       # Dashboard layout wrapper
│   │   ├── alerts/
│   │   └── charts/
│   ├── (marketing)/         # Marketing pages (route group)
│   │   ├── page.tsx         # Homepage
│   │   └── pricing/
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                 # shadcn/ui components (button, select, etc.)
│   ├── alerts/
│   │   ├── alert-form.tsx
│   │   └── alert-card.tsx
│   ├── charts/
│   └── dashboard/
├── lib/                     # Business logic & utilities
│   ├── api-client/         # Auto-generated from OpenAPI (Next.js API types)
│   ├── mt5-client/         # Auto-generated from OpenAPI (Flask MT5 types)
│   ├── db/
│   │   ├── prisma.ts       # Prisma client instance
│   │   └── alerts.ts       # Alert database operations
│   ├── tier/
│   │   ├── validation.ts   # Tier access validation
│   │   └── constants.ts    # Tier limits and rules
│   ├── utils/
│   └── hooks/              # Custom React hooks
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── mt5-service/            # Flask MT5 microservice (separate from Next.js)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   └── indicators.py
│   │   └── services/
│   │       └── mt5_connector.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── run.py
├── docs/                   # Documentation
├── public/                 # Static assets
└── tests/                  # Tests

```

**Key Points:**
- **app/api/** = Server-side API routes (Next.js serverless functions)
- **app/dashboard/** = Dashboard pages (Server Components)
- **components/** = Reusable React components (mix of Server & Client)
- **lib/** = Business logic, utilities, database operations (no UI)
- **mt5-service/** = Separate Flask microservice for MT5 integration

---

### 1.2 Separation of Concerns

**Principle:** Each folder has a single responsibility.

| Folder | Responsibility | Can Import From | Cannot Import From |
|--------|---------------|----------------|-------------------|
| **app/api/** | HTTP endpoints, request/response | lib/, prisma | components/ |
| **app/dashboard/** | Pages, layouts, Server Components | components/, lib/ | app/api/ (use fetch instead) |
| **components/** | UI components, presentation logic | lib/utils, lib/hooks | lib/db, app/api |
| **lib/db/** | Database operations (Prisma) | prisma | components/, app/ |
| **lib/tier/** | Tier validation logic | - | components/, app/ |
| **lib/utils/** | Pure utility functions | - | Any domain-specific code |

**Why this matters:** Separation prevents circular dependencies and makes testing easier. Components shouldn't know about database schema. API routes shouldn't import React components.

---

### 1.3 Visual Structure Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 APP (Vercel)                       │
│  ┌──────────────────────┐     ┌──────────────────────────────┐  │
│  │  app/dashboard/*     │     │     app/api/*                │  │
│  │  (Server Components) │────▶│  (API Routes/Serverless)     │  │
│  │                      │     │                              │  │
│  │  components/*        │     │  Uses: lib/db/*, lib/tier/*  │  │
│  │  (Client Components) │     └──────────┬───────────────────┘  │
│  └──────────────────────┘                │                      │
└─────────────────────────────────────────┼──────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
         ┌──────────────────┐   ┌─────────────────┐   ┌────────────────┐
         │  PostgreSQL DB   │   │ Flask MT5 API   │   │  Stripe API    │
         │   (Railway)      │   │  (Railway)      │   │   (External)   │
         └──────────────────┘   └─────────────────┘   └────────────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │  MT5 Terminal   │
                                │  (Local/VPS)    │
                                └─────────────────┘
```

---

## 2. LAYER ARCHITECTURE

### 2.1 Five Layers

The application is divided into 5 layers, each with specific responsibilities:

```
┌─────────────────────────────────────────┐
│  1. FRONTEND LAYER (app/dashboard)      │  ← Server & Client Components
│     - Pages (page.tsx)                  │  ← User-facing UI
│     - Layouts (layout.tsx)              │
│     - Components (components/*)         │
└─────────────────┬───────────────────────┘
                  │ fetch()
                  ▼
┌─────────────────────────────────────────┐
│  2. API LAYER (app/api)                 │  ← HTTP endpoints
│     - Route handlers (route.ts)         │  ← Request validation
│     - Middleware (middleware.ts)        │  ← Authentication
└─────────────────┬───────────────────────┘
                  │ calls
                  ▼
┌─────────────────────────────────────────┐
│  3. BUSINESS LOGIC LAYER (lib/)         │  ← Pure logic
│     - Tier validation (lib/tier)        │  ← No HTTP, no UI
│     - Utilities (lib/utils)             │  ← Reusable functions
└─────────────────┬───────────────────────┘
                  │ uses
                  ▼
┌─────────────────────────────────────────┐
│  4. DATABASE LAYER (lib/db, prisma)     │  ← Data persistence
│     - Prisma client (lib/db/prisma.ts)  │  ← ORM operations
│     - Schema (prisma/schema.prisma)     │  ← Database models
└─────────────────┬───────────────────────┘
                  │ queries
                  ▼
┌─────────────────────────────────────────┐
│  5. EXTERNAL SERVICES                   │  ← Third-party APIs
│     - Flask MT5 Service (HTTP)          │  ← Market data
│     - Stripe API (payments)             │  ← Subscriptions
│     - Email service (Resend)            │  ← Notifications
└─────────────────────────────────────────┘
```

**Why this matters:** Layered architecture allows changes to one layer without affecting others. For example, switching from Prisma to another ORM only requires changes to the Database Layer.

---

### 2.2 Data Flow Diagram

**Example: User creates an alert**

```
1. USER clicks "Create Alert" button
   │
   ▼
2. FRONTEND (components/alerts/alert-form.tsx)
   - Client Component with form state
   - Validates input with Zod (client-side)
   - Calls: fetch('/api/alerts', { method: 'POST', body: {...} })
   │
   ▼
3. API LAYER (app/api/alerts/route.ts)
   - Receives POST /api/alerts request
   - Checks authentication (getServerSession)
   - Validates input with Zod (server-side)
   - Calls business logic: validateChartAccess(tier, symbol, timeframe)
   │
   ▼
4. BUSINESS LOGIC (lib/tier/validation.ts)
   - validateChartAccess() checks if user's tier can access symbol/timeframe
   - If FREE tier + PRO symbol → throw ForbiddenError
   - If valid → continue
   │
   ▼
5. DATABASE LAYER (lib/db/alerts.ts or Prisma direct)
   - createAlert(userId, data)
   - Prisma: prisma.alert.create({ data: {...} })
   - Returns created Alert object
   │
   ▼
6. API LAYER (app/api/alerts/route.ts)
   - Returns Response.json(alert, { status: 201 })
   │
   ▼
7. FRONTEND (components/alerts/alert-form.tsx)
   - Receives response
   - Shows success message
   - Redirects to /alerts/{id}
```

**Key Rules:**
- ✅ Frontend calls API routes via fetch()
- ✅ API routes call business logic functions
- ✅ Business logic calls database operations
- ❌ Frontend NEVER calls database directly
- ❌ Business logic NEVER returns HTTP responses

---

## 3. TYPE SYSTEM

### 3.1 OpenAPI Specs = Source of Truth

**Rule:** All types are derived from OpenAPI specifications. Never manually define types that exist in OpenAPI.

**Why this matters:** OpenAPI specs define the contract between frontend and backend. Auto-generating types from specs ensures frontend and backend always agree on data structures.

**Files:**
- `docs/trading_alerts_openapi.yaml` → Types for Next.js API (`/api/alerts`, `/api/users`, etc.)
- `docs/flask_mt5_openapi.yaml` → Types for Flask MT5 API (`/api/indicators`, etc.)

**Auto-Generated Types:**
```bash
# Generate TypeScript types from Next.js OpenAPI
sh scripts/openapi/generate-nextjs-types.sh
# Creates: lib/api-client/models.ts, lib/api-client/api.ts

# Generate TypeScript types from Flask OpenAPI
sh scripts/openapi/generate-flask-types.sh
# Creates: lib/mt5-client/models.ts, lib/mt5-client/api.ts
```

**Usage:**
```typescript
// ✅ GOOD - Import types from auto-generated files
import type { Alert, CreateAlertRequest, AlertResponse } from '@/lib/api-client';

export async function POST(req: Request): Promise<Response> {
  const body: CreateAlertRequest = await req.json();

  const alert: Alert = await createAlert(body);

  const response: AlertResponse = {
    id: alert.id,
    userId: alert.userId,
    // ... matches OpenAPI schema
  };

  return Response.json(response);
}

// ❌ BAD - Manually defining types that exist in OpenAPI
interface Alert {  // Don't do this! Use auto-generated type
  id: string;
  userId: string;
  // ...
}
```

---

### 3.2 Contract-Driven Development

**Process:**

```
1. Define API in OpenAPI YAML
   ├─ docs/trading_alerts_openapi.yaml
   └─ Define AlertResponse, CreateAlertRequest, etc.

2. Generate TypeScript types
   ├─ sh scripts/openapi/generate-nextjs-types.sh
   └─ Creates lib/api-client/models.ts

3. Implement API route using generated types
   ├─ app/api/alerts/route.ts
   └─ Import types from lib/api-client

4. Frontend uses same generated types
   ├─ components/alerts/alert-form.tsx
   └─ Import types from lib/api-client
```

**Benefits:**
- ✅ Frontend and backend can't drift apart (both use same types)
- ✅ Changes to API spec automatically flow to TypeScript
- ✅ Type errors caught at compile time, not runtime
- ✅ IDE autocomplete shows exact API structure

**Why this matters:** This is how professional teams prevent API contract bugs. If backend changes response structure, frontend gets TypeScript errors immediately.

---

## 4. AUTHENTICATION & AUTHORIZATION

### 4.1 NextAuth.js for Authentication

**Setup:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null;  // Invalid credentials
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,  // Add tier to session
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tier = user.tier;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.tier = token.tier;
      }
      return session;
    }
  },
});

export { handler as GET, handler as POST };
```

**Why NextAuth:** Industry-standard, handles session management, CSRF protection, secure cookies, supports multiple providers.

---

### 4.2 Tier Validation Pattern

**Rule:** All endpoints serving symbol/timeframe data MUST validate tier access.

**Tier Rules (from docs/policies/00-tier-specifications.md):**

| Tier | Symbols | Timeframes | Chart Combinations |
|------|---------|------------|-------------------|
| FREE | 5 (BTCUSD, EURUSD, USDJPY, US30, XAUUSD) | 3 (H1, H4, D1) | 15 |
| PRO | 15 (all symbols) | 9 (all timeframes) | 135 |

**Implementation:**

```typescript
// lib/tier/validation.ts

import { UserTier } from '@/types';

const FREE_SYMBOLS = ['BTCUSD', 'EURUSD', 'USDJPY', 'US30', 'XAUUSD'] as const;
const PRO_SYMBOLS = [
  'AUDJPY', 'AUDUSD', 'BTCUSD', 'ETHUSD', 'EURUSD',
  'GBPJPY', 'GBPUSD', 'NDX100', 'NZDUSD', 'US30',
  'USDCAD', 'USDCHF', 'USDJPY', 'XAGUSD', 'XAUUSD'
] as const;

const FREE_TIMEFRAMES = ['H1', 'H4', 'D1'] as const;
const PRO_TIMEFRAMES = ['M5', 'M15', 'M30', 'H1', 'H2', 'H4', 'H8', 'H12', 'D1'] as const;

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Validates if user's tier can access the specified symbol
 * @throws {ForbiddenError} If tier cannot access symbol
 */
export function validateSymbolAccess(tier: UserTier, symbol: string): void {
  const allowedSymbols = tier === 'PRO' ? PRO_SYMBOLS : FREE_SYMBOLS;

  if (!allowedSymbols.includes(symbol as any)) {
    throw new ForbiddenError(
      `${tier} tier cannot access ${symbol}. Available symbols: ${allowedSymbols.join(', ')}`
    );
  }
}

/**
 * Validates if user's tier can access the specified timeframe
 * @throws {ForbiddenError} If tier cannot access timeframe
 */
export function validateTimeframeAccess(tier: UserTier, timeframe: string): void {
  const allowedTimeframes = tier === 'PRO' ? PRO_TIMEFRAMES : FREE_TIMEFRAMES;

  if (!allowedTimeframes.includes(timeframe as any)) {
    throw new ForbiddenError(
      `${tier} tier cannot access ${timeframe} timeframe. Available timeframes: ${allowedTimeframes.join(', ')}`
    );
  }
}

/**
 * Validates if user's tier can access the symbol+timeframe combination
 * @throws {ForbiddenError} If tier cannot access combination
 */
export function validateChartAccess(
  tier: UserTier,
  symbol: string,
  timeframe: string
): void {
  validateSymbolAccess(tier, symbol);
  validateTimeframeAccess(tier, timeframe);
}
```

**Usage in API routes:**

```typescript
// app/api/indicators/[symbol]/[timeframe]/route.ts

import { getServerSession } from 'next-auth';
import { validateChartAccess } from '@/lib/tier/validation';

export async function GET(
  req: Request,
  { params }: { params: { symbol: string; timeframe: string } }
) {
  try {
    // 1. Authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Tier validation - CRITICAL!
    const userTier = session.user.tier || 'FREE';
    try {
      validateChartAccess(userTier, params.symbol, params.timeframe);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return Response.json({
          error: error.message,
          message: 'Upgrade to PRO for access to all symbols and timeframes',
        }, { status: 403 });
      }
      throw error;
    }

    // 3. Fetch data (user is authorized)
    const data = await fetchIndicatorData(params.symbol, params.timeframe);

    return Response.json(data);

  } catch (error) {
    console.error('GET /api/indicators error:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

**Critical:** Tier validation must happen on BOTH:
1. Next.js API routes (app/api/indicators/...)
2. Flask MT5 service (before fetching from MT5)

**Why:** Users could bypass Next.js and call Flask directly. Always validate at both layers.

---

### 4.3 Where to Check Auth

| Location | Auth Check | Tier Check | Example |
|----------|-----------|------------|---------|
| **middleware.ts** | ✅ Yes (redirect to /login) | ❌ No | Protect /dashboard/* routes |
| **API routes** | ✅ Yes (return 401) | ✅ Yes (return 403) | All /api/* endpoints |
| **Server Components** | ✅ Yes (redirect to /login) | ✅ Yes (show upgrade UI) | Dashboard pages |
| **Client Components** | ❌ No (use useSession) | ✅ Yes (disable UI) | Forms, buttons |

**Example: Middleware**

```typescript
// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

## 5. DATABASE PATTERNS

### 5.1 Prisma Only (No Raw SQL)

**Rule:** Use Prisma ORM for all database operations. Avoid raw SQL unless absolutely necessary.

**Why this matters:** Prisma prevents SQL injection, provides type safety, handles connection pooling, and generates TypeScript types from schema.

**Prisma Client Setup:**

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Why singleton pattern:** Next.js Hot Reload creates multiple Prisma instances in development. This pattern prevents "Too many database connections" errors.

---

### 5.2 Database Operation Patterns

**CRUD Examples:**

```typescript
// lib/db/alerts.ts

import { prisma } from './prisma';
import type { Alert, Prisma } from '@prisma/client';

/**
 * Create a new alert for a user
 */
export async function createAlert(
  data: Prisma.AlertCreateInput
): Promise<Alert> {
  return prisma.alert.create({ data });
}

/**
 * Get all alerts for a user, ordered by creation date
 */
export async function getUserAlerts(userId: string): Promise<Alert[]> {
  return prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get alert by ID, ensuring it belongs to the user
 */
export async function getAlertById(
  alertId: string,
  userId: string
): Promise<Alert | null> {
  return prisma.alert.findFirst({
    where: {
      id: alertId,
      userId,  // Security: User can only access their own alerts
    },
  });
}

/**
 * Update an alert
 */
export async function updateAlert(
  alertId: string,
  userId: string,
  data: Prisma.AlertUpdateInput
): Promise<Alert> {
  return prisma.alert.update({
    where: { id: alertId },
    data,
  });
}

/**
 * Delete an alert
 */
export async function deleteAlert(
  alertId: string,
  userId: string
): Promise<void> {
  await prisma.alert.delete({
    where: {
      id: alertId,
      userId,  // Security: User can only delete their own alerts
    },
  });
}

/**
 * Count user's alerts (for tier limit checking)
 */
export async function countUserAlerts(userId: string): Promise<number> {
  return prisma.alert.count({
    where: { userId },
  });
}
```

**Usage in API routes:**

```typescript
// app/api/alerts/route.ts
import { createAlert, getUserAlerts } from '@/lib/db/alerts';

export async function GET(req: Request) {
  const session = await getServerSession();
  const alerts = await getUserAlerts(session.user.id);
  return Response.json(alerts);
}

export async function POST(req: Request) {
  const session = await getServerSession();
  const body = await req.json();

  const alert = await createAlert({
    userId: session.user.id,
    symbol: body.symbol,
    timeframe: body.timeframe,
    condition: body.condition,
    isActive: true,
  });

  return Response.json(alert, { status: 201 });
}
```

---

## 6. API ROUTE STRUCTURE

### 6.1 Standard Pattern All Routes Follow

**Every API route (route.ts) follows this structure:**

```typescript
// 1. Imports
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

// 2. Input validation schema
const createSchema = z.object({
  symbol: z.string().min(1),
  // ...
});

// 3. GET handler
export async function GET(req: NextRequest) {
  try {
    // a. Authentication
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // b. Business logic
    const data = await fetchData(session.user.id);

    // c. Response matching OpenAPI
    return NextResponse.json(data);

  } catch (error) {
    // d. Error handling
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// 4. POST handler
export async function POST(req: NextRequest) {
  try {
    // a. Authentication
    // b. Input validation
    // c. Tier validation (if applicable)
    // d. Business logic
    // e. Response
  } catch (error) {
    // f. Error handling
  }
}

// 5. Other methods (PATCH, DELETE, etc.) follow same pattern
```

See `docs/policies/02-quality-standards.md` section 5 for complete example.

---

## 7. REACT COMPONENT STRUCTURE

### 7.1 Server Components (Default)

**Use Server Components when:**
- No interactivity needed
- Fetching data from database
- SEO important

```typescript
// app/dashboard/page.tsx (Server Component - no 'use client')
import { getServerSession } from 'next-auth';
import { getUserAlerts } from '@/lib/db/alerts';

export default async function DashboardPage() {
  const session = await getServerSession();

  // Fetch data in Server Component
  const alerts = await getUserAlerts(session.user.id);

  return (
    <div>
      <h1>Dashboard</h1>
      <AlertList alerts={alerts} />
    </div>
  );
}
```

---

### 7.2 Client Components ('use client')

**Use Client Components when:**
- Using React hooks (useState, useEffect, etc.)
- Handling user interactions (onClick, etc.)
- Using browser APIs (localStorage, window)

```typescript
// components/alerts/alert-form.tsx (Client Component)
'use client';

import { useState } from 'react';

export function AlertForm() {
  const [symbol, setSymbol] = useState('EURUSD');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Handle submission
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 8. FLASK MT5 SERVICE

### 8.1 Separate Microservice Architecture

**Structure:**

```
mt5-service/
├── app/
│   ├── __init__.py               # Flask app factory
│   ├── routes/
│   │   ├── __init__.py
│   │   └── indicators.py         # /api/indicators routes
│   ├── services/
│   │   ├── __init__.py
│   │   └── mt5_connector.py      # MT5 connection logic
│   └── middleware/
│       ├── __init__.py
│       └── tier_validator.py     # Tier validation middleware
├── requirements.txt               # Python dependencies
├── Dockerfile                     # Container config
├── .env.example
└── run.py                        # Entry point
```

**Why separate service:** MT5 (MetaTrader 5) requires Python library (MetaTrader5 package). Next.js is JavaScript-only, so we use Flask for MT5 integration.

---

### 8.2 Tier Validation in Flask

**Critical:** Flask service must also validate tiers (don't trust Next.js exclusively).

```python
# app/middleware/tier_validator.py

from flask import request, jsonify
from functools import wraps

FREE_SYMBOLS = ['BTCUSD', 'EURUSD', 'USDJPY', 'US30', 'XAUUSD']
PRO_SYMBOLS = [
    'AUDJPY', 'AUDUSD', 'BTCUSD', 'ETHUSD', 'EURUSD',
    'GBPJPY', 'GBPUSD', 'NDX100', 'NZDUSD', 'US30',
    'USDCAD', 'USDCHF', 'USDJPY', 'XAGUSD', 'XAUUSD'
]

FREE_TIMEFRAMES = ['H1', 'H4', 'D1']
PRO_TIMEFRAMES = ['M5', 'M15', 'M30', 'H1', 'H2', 'H4', 'H8', 'H12', 'D1']

def validate_tier_access(f):
    """Middleware to validate tier access to symbol/timeframe"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get tier from header (Next.js passes this)
        tier = request.headers.get('X-User-Tier', 'FREE')
        symbol = kwargs.get('symbol')
        timeframe = kwargs.get('timeframe')

        # Validate symbol
        allowed_symbols = PRO_SYMBOLS if tier == 'PRO' else FREE_SYMBOLS
        if symbol not in allowed_symbols:
            return jsonify({
                'error': f'{tier} tier cannot access {symbol}',
                'message': 'Upgrade to PRO for access to all symbols'
            }), 403

        # Validate timeframe
        allowed_timeframes = PRO_TIMEFRAMES if tier == 'PRO' else FREE_TIMEFRAMES
        if timeframe not in allowed_timeframes:
            return jsonify({
                'error': f'{tier} tier cannot access {timeframe} timeframe',
                'message': 'Upgrade to PRO for access to all timeframes'
            }), 403

        return f(*args, **kwargs)

    return decorated_function
```

**Usage:**

```python
# app/routes/indicators.py

from flask import Blueprint, jsonify
from app.middleware.tier_validator import validate_tier_access
from app.services.mt5_connector import fetch_indicator_data

indicators_bp = Blueprint('indicators', __name__)

@indicators_bp.route('/api/indicators/<symbol>/<timeframe>', methods=['GET'])
@validate_tier_access  # Validate tier before fetching MT5 data
def get_indicators(symbol: str, timeframe: str):
    """Fetch indicator data from MT5 for symbol/timeframe"""
    try:
        data = fetch_indicator_data(symbol, timeframe)
        return jsonify(data), 200

    except Exception as e:
        return jsonify({'error': 'Failed to fetch indicator data'}), 500
```

---

### 8.3 How Next.js Calls Flask

```typescript
// lib/mt5/fetch-indicators.ts

export async function fetchIndicatorsFromMT5(
  symbol: string,
  timeframe: string,
  userTier: 'FREE' | 'PRO'
): Promise<IndicatorData> {
  const flaskUrl = process.env.FLASK_MT5_URL || 'http://localhost:5001';

  const res = await fetch(`${flaskUrl}/api/indicators/${symbol}/${timeframe}`, {
    headers: {
      'X-User-Tier': userTier,  // Pass tier to Flask for validation
      'X-API-Key': process.env.FLASK_API_KEY || '',
    },
  });

  if (!res.ok) {
    throw new Error(`Flask API error: ${res.statusText}`);
  }

  return res.json();
}
```

---

## 9. DEPENDENCY RULES

### 9.1 Allowed Dependencies (Pre-Approved)

These dependencies are approved for use without escalation:

**Next.js / React:**
- next (v15)
- react (v19)
- react-dom (v19)

**UI Components:**
- @radix-ui/* (shadcn/ui dependencies)
- tailwindcss
- lucide-react (icons)

**Forms & Validation:**
- zod
- react-hook-form
- @hookform/resolvers

**Authentication:**
- next-auth
- bcryptjs

**Database:**
- @prisma/client
- prisma (dev dependency)

**API Client:**
- axios (for OpenAPI generated clients)

**Date/Time:**
- date-fns

**Charts:**
- recharts or lightweight-charts

**Payments:**
- stripe
- @stripe/stripe-js

**Flask (Python):**
- Flask
- MetaTrader5
- python-dotenv
- gunicorn (production server)

---

### 9.2 Require Approval for New Dependencies

**Escalate when you need:**
- New npm packages not in the list above
- Alternative libraries (e.g., dayjs instead of date-fns)
- Large dependencies (>100KB bundle size)

**Why this matters:** Every dependency adds attack surface, bundle size, and maintenance burden. Human approval ensures necessity.

---

## 10. TESTING STRATEGY

### 10.1 Testing Pyramid

```
         ┌──────────────┐
         │   E2E Tests  │  ← Few (critical user flows)
         │  (Playwright)│
         └──────────────┘
      ┌────────────────────┐
      │ Integration Tests  │  ← Some (API routes)
      │      (Jest)        │
      └────────────────────┘
   ┌──────────────────────────┐
   │    Unit Tests (Jest)     │  ← Many (business logic)
   │  lib/tier, lib/utils,    │
   │  lib/db functions        │
   └──────────────────────────┘
```

**Rules:**
1. **Unit tests** for business logic (lib/tier, lib/utils, lib/db functions)
2. **Integration tests** for API routes (test full request/response cycle)
3. **E2E tests** for critical flows (registration, creating alert, purchasing PRO)

---

### 10.2 Test Examples

**Unit Test:**

```typescript
// lib/tier/validation.test.ts
import { describe, it, expect } from '@jest/globals';
import { validateSymbolAccess, validateTimeframeAccess } from './validation';

describe('Tier Validation', () => {
  describe('validateSymbolAccess', () => {
    it('allows FREE tier to access FREE symbols', () => {
      expect(() => validateSymbolAccess('FREE', 'EURUSD')).not.toThrow();
      expect(() => validateSymbolAccess('FREE', 'BTCUSD')).not.toThrow();
    });

    it('denies FREE tier access to PRO symbols', () => {
      expect(() => validateSymbolAccess('FREE', 'AUDJPY')).toThrow();
      expect(() => validateSymbolAccess('FREE', 'GBPJPY')).toThrow();
    });

    it('allows PRO tier to access all symbols', () => {
      expect(() => validateSymbolAccess('PRO', 'EURUSD')).not.toThrow();
      expect(() => validateSymbolAccess('PRO', 'AUDJPY')).not.toThrow();
    });
  });
});
```

**Integration Test:**

```typescript
// app/api/alerts/route.test.ts
import { describe, it, expect } from '@jest/globals';
import { POST } from './route';

describe('POST /api/alerts', () => {
  it('creates alert for authenticated user', async () => {
    const mockRequest = new Request('http://localhost/api/alerts', {
      method: 'POST',
      body: JSON.stringify({
        symbol: 'EURUSD',
        timeframe: 'H1',
        condition: 'RSI > 70'
      })
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data.symbol).toBe('EURUSD');
  });

  it('returns 401 for unauthenticated user', async () => {
    // Test without session
  });

  it('returns 403 for FREE tier accessing PRO symbol', async () => {
    // Test tier validation
  });
});
```

---

## 11. DEPLOYMENT ARCHITECTURE

### 11.1 Services & Hosting

```
┌────────────────────────────────────────────────────┐
│              VERCEL (Next.js Frontend)              │
│  - Auto-deployment from GitHub main branch         │
│  - Serverless functions (app/api/*)                │
│  - Edge runtime for middleware                     │
│  - Environment: NEXTAUTH_SECRET, DATABASE_URL      │
└─────────────────────┬──────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
┌─────────────────┐      ┌─────────────────────┐
│  RAILWAY        │      │  RAILWAY            │
│  PostgreSQL DB  │      │  Flask MT5 Service  │
│                 │      │  - Docker container │
│  - Production   │      │  - Python 3.11      │
│  - Backups      │      │  - MT5 connection   │
│  - Migrations   │      │                     │
└─────────────────┘      └─────────┬───────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  MT5 Terminal   │
                          │  (VPS/Local)    │
                          └─────────────────┘
```

**Why this architecture:**
- **Vercel:** Best Next.js hosting, automatic scaling, edge runtime
- **Railway PostgreSQL:** Easy setup, automatic backups, good free tier
- **Railway Flask:** Docker support, easy deployment, same provider as DB (low latency)
- **MT5 Terminal:** Must run on Windows or Linux VPS with MT5 installed

---

### 11.2 Environment Variables

**Vercel (.env):**
```bash
# Next.js
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generated-secret-from-openssl

# Database
DATABASE_URL=postgresql://user:pass@railway.app/dbname

# Flask MT5 Service
FLASK_MT5_URL=https://your-flask-service.railway.app
FLASK_API_KEY=generated-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email
RESEND_API_KEY=re_...
```

**Railway Flask (.env):**
```bash
# MT5 Connection
MT5_SERVER=your-broker-server
MT5_LOGIN=your-mt5-account
MT5_PASSWORD=your-mt5-password

# API Security
FLASK_API_KEY=same-as-nextjs-FLASK_API_KEY

# Database (if Flask needs it)
DATABASE_URL=postgresql://user:pass@railway.app/dbname
```

---

## 12. CHART DATA REFRESH STRATEGY

### 12.1 Polling Approach (NOT WebSocket for MVP)

**Why polling:** Simpler, works with Vercel serverless, sufficient for 1-minute updates.

**Polling Intervals (from existing 03-architecture-rule.md):**

```typescript
const REFRESH_INTERVALS = {
  M5:  30000,    // 30 seconds (PRO only - scalping)
  M15: 60000,    // 1 minute
  M30: 60000,    // 1 minute
  H1:  120000,   // 2 minutes
  H2:  120000,   // 2 minutes
  H4:  300000,   // 5 minutes
  H8:  300000,   // 5 minutes
  H12: 600000,   // 10 minutes (PRO only - swing trading)
  D1:  600000,   // 10 minutes
} as const;
```

**Implementation:**

```typescript
// components/charts/trading-chart.tsx
'use client';

import { useEffect, useState } from 'react';

interface TradingChartProps {
  symbol: string;
  timeframe: string;
}

export function TradingChart({ symbol, timeframe }: TradingChartProps) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchIndicatorData();

    // Set up polling interval
    const interval = setInterval(
      fetchIndicatorData,
      REFRESH_INTERVALS[timeframe]
    );

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  async function fetchIndicatorData() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/indicators/${symbol}/${timeframe}`);
      const json = await res.json();
      setData(json.data);
    } catch (error) {
      console.error('Failed to fetch indicators:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading && !data) {
    return <div>Loading chart...</div>;
  }

  return <Chart data={data} />;
}
```

**Rate Limiting Consideration:**
- FREE tier: 60 requests/hour = supports ~1 chart polling every minute
- PRO tier: 300 requests/hour = supports ~5 charts polling every minute

**Future Enhancement (Post-MVP):** WebSocket for real-time push updates.

---

## 13. AFFILIATE MARKETING ARCHITECTURE

### 13.1 2-Sided Marketplace Structure

**Rule:** Affiliate marketing is implemented as a **2-sided marketplace** with three distinct user types: Affiliates, End Users, and Admin.

**Why this matters:** Clear separation ensures secure authentication, appropriate permissions, and maintainable code isolation.

**Architecture:**

```
┌──────────────────────────────────────────────────────────┐
│                  Trading Alerts SaaS                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  SIDE 1: AFFILIATE PORTAL                                │
│  ├─ /affiliate/register      (Public)                    │
│  ├─ /affiliate/verify        (Public)                    │
│  ├─ /affiliate/login         (Public)                    │
│  ├─ /affiliate/dashboard     (Protected: Affiliate JWT)  │
│  ├─ /affiliate/profile       (Protected: Affiliate JWT)  │
│  └─ API: /api/affiliate/*    (Affiliate authentication)  │
│                                                          │
│  SIDE 2: END USER PORTAL                                 │
│  ├─ /auth/register           (Public)                    │
│  ├─ /auth/login              (Public)                    │
│  ├─ /dashboard               (Protected: User JWT)       │
│  ├─ /dashboard/settings/billing (Checkout + Discount)    │
│  └─ API: /api/user/*         (User authentication)       │
│                                                          │
│  PLATFORM OPERATOR: ADMIN PANEL                          │
│  ├─ /admin/affiliates        (Protected: Admin role)     │
│  ├─ /admin/reports           (Protected: Admin role)     │
│  └─ API: /api/admin/*        (Admin authentication)      │
│                                                          │
│  CONNECTION POINT:                                       │
│  └─ User applies affiliate code at checkout →            │
│      Commission created → Affiliate notified             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 13.2 Database Schema for Affiliates

**Rule:** Three new tables must be added: `Affiliate`, `AffiliateCode`, and `Commission`.

**Location:** `prisma/schema.prisma`

**Key Relationships:**
```
Affiliate (1) ─┬─── (M) AffiliateCode
               └─── (M) Commission

AffiliateCode (1) ───── (1) Commission

User (1) ─────────────── (M) Commission (as customer)

Subscription (1) ───── (0..1) AffiliateCode (nullable)
```

**Critical Fields:**
- `AffiliateCode.status`: Enum `[ACTIVE, USED, EXPIRED, CANCELLED]` - lifecycle management
- `AffiliateCode.code`: Unique, cryptographically random (>12 chars) using `crypto.randomBytes`
- `Commission.status`: Enum `[PENDING, PAID]` - payment tracking
- `Affiliate.paymentMethod`: Enum `[BANK_TRANSFER, CRYPTO, GLOBAL_WALLET, LOCAL_WALLET]`

### 13.3 Separate Authentication Systems

**Rule:** Affiliates use separate JWT tokens from end users. No shared sessions.

**Why this matters:** Security isolation prevents affiliates from accessing user dashboards and vice versa.

**Implementation:**
```typescript
// lib/auth/affiliate-auth.ts
export async function generateAffiliateToken(affiliate: Affiliate): Promise<string> {
  return jwt.sign(
    {
      id: affiliate.id,
      email: affiliate.email,
      type: 'AFFILIATE', // Critical: type discriminator
      status: affiliate.status
    },
    process.env.AFFILIATE_JWT_SECRET!, // Separate secret
    { expiresIn: '7d' }
  );
}

// Middleware validates token type
export function validateAffiliateToken(token: string) {
  const decoded = jwt.verify(token, process.env.AFFILIATE_JWT_SECRET!);
  if (decoded.type !== 'AFFILIATE') {
    throw new Error('Invalid token type');
  }
  return decoded;
}
```

**DO NOT:**
- ❌ Reuse user authentication for affiliates
- ❌ Store both affiliate and user in same JWT
- ❌ Allow affiliate tokens to access user endpoints

### 13.4 Code Distribution Strategy

**Rule:** All code distribution uses automated monthly cron jobs (1st of month). Manual distribution is admin-only exception.

**Why this matters:** Consistent monthly rhythm ensures predictable inventory for affiliates and reduces administrative burden.

**Implementation:**
```typescript
// app/api/cron/distribute-codes/route.ts
export async function GET(req: NextRequest) {
  // Verify Vercel Cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const activeAffiliates = await prisma.affiliate.findMany({
    where: { status: 'ACTIVE' }
  });

  for (const affiliate of activeAffiliates) {
    // Generate 15 codes per affiliate
    const codes = Array.from({ length: 15 }, () => ({
      code: generateRandomCode(affiliate.fullName),
      affiliateId: affiliate.id,
      status: 'ACTIVE',
      discountPercent: 20.0,
      commissionPercent: 20.0,
      expiresAt: endOfMonth(new Date())
    }));

    await prisma.affiliateCode.createMany({ data: codes });
    await sendEmail(affiliate.email, 'Monthly Codes Distributed', codes);
  }

  return NextResponse.json({ success: true });
}
```

**Vercel Configuration:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/distribute-codes",
      "schedule": "0 0 1 * *"  // 00:00 UTC on 1st of month
    },
    {
      "path": "/api/cron/expire-codes",
      "schedule": "59 23 28-31 * *"  // 23:59 UTC on last day of month
    }
  ]
}
```

### 13.5 Commission Calculation Flow

**Rule:** Commissions are calculated at checkout and stored immediately, but status remains `PENDING` until admin marks as paid.

**Why this matters:** Ensures affiliate sees earned commissions in real-time while admin maintains payment control.

**Flow:**
```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: NextRequest) {
  const event = await stripe.webhooks.constructEvent(/* ... */);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const affiliateCode = session.metadata?.affiliateCode;

    if (affiliateCode) {
      // 1. Mark code as USED
      const code = await prisma.affiliateCode.update({
        where: { code: affiliateCode },
        data: {
          status: 'USED',
          usedAt: new Date(),
          usedByUserId: session.metadata.userId
        }
      });

      // 2. Calculate commission
      const regularPrice = parseFloat(session.metadata.regularPrice);
      const discountPercent = code.discountPercent;
      const discount = regularPrice * (discountPercent / 100);
      const netRevenue = regularPrice - discount;
      const commission = netRevenue * (code.commissionPercent / 100);

      // 3. Create Commission record (status: PENDING)
      await prisma.commission.create({
        data: {
          affiliateId: code.affiliateId,
          affiliateCodeId: code.id,
          userId: session.metadata.userId,
          subscriptionId: session.subscription,
          regularPrice,
          discountAmount: discount,
          netRevenue,
          commissionPercent: code.commissionPercent,
          commissionAmount: commission,
          status: 'PENDING'  // Awaits admin payment
        }
      });

      // 4. Notify affiliate
      await sendEmail(code.affiliate.email, 'Commission Earned', {
        code: affiliateCode,
        amount: commission
      });
    }
  }

  return NextResponse.json({ received: true });
}
```

### 13.6 Accounting-Style Reports

**Rule:** All affiliate and admin reports use accounting-style opening/closing balance format.

**Why this matters:** Provides clear audit trail and matches affiliate's mental model of inventory/earnings.

**Pattern:**
```typescript
// Example: Code Inventory Report
interface CodeInventoryReport {
  reportMonth: string;  // "2025-11"
  openingBalance: number;  // (1.0) Codes at start of month
  received: number;        // (1.1) + Codes distributed
  used: number;            // (1.2) - Codes used by customers
  expired: number;         // (1.3) - Codes expired
  cancelled: number;       // (1.4) - Codes cancelled by admin
  closingBalance: number;  // (1.5) = Codes remaining
  movements: {
    received: Array<{ date: string; quantity: number; notes: string }>;
    used: Array<{ date: string; code: string; commission: number }>;
  };
}

// Example: Commission Receivable Report
interface CommissionReport {
  reportMonth: string;
  openingBalance: number;  // (2.0) Owed at start of month
  earned: number;          // (2.1) + Earned this month
  paid: number;            // (2.2) - Paid by admin
  closingBalance: number;  // (2.3) = Still owed
  commissions: Array<{
    date: string;
    code: string;
    amount: number;
    status: 'PENDING' | 'PAID';
  }>;
}
```

### 13.7 Admin Business Intelligence Reports

**Rule:** Admin must have access to 4 key reports for business decision-making.

**Required Reports:**

1. **P&L Report** (`/api/admin/reports/profit-loss`)
   - Monthly revenue, discounts, net revenue, commissions, profit
   - 3-month default view
   - Profit margin calculation

2. **Sales Performance by Affiliate** (`/api/admin/reports/sales-performance`)
   - Ranked list of affiliates by conversion rate
   - Aggregate statistics (total codes, total revenue)
   - Conversion distribution histogram

3. **Commission Owings** (`/api/admin/reports/commission-owings`)
   - All affiliates with pending commissions
   - Grouped by payment method
   - Bulk payment capability

4. **Aggregate Code Inventory** (`/api/admin/reports/code-inventory`)
   - System-wide code status breakdown
   - Monthly distribution history
   - Overall conversion metrics

### 13.8 Email Notifications

**Rule:** 8 email types must be triggered automatically by system events.

**Required Email Templates:**
1. Affiliate registration (verification required)
2. Welcome email (after verification + 15 codes distributed)
3. Code usage notification (real-time when code applied)
4. Monthly code distribution (1st of month)
5. Commission payment processed (admin marks paid)
6. Account suspended (admin action)
7. Admin: New affiliate registered
8. Admin: Code request from affiliate

**Implementation:**
```typescript
// lib/email/templates.ts
export const EMAIL_TEMPLATES = {
  AFFILIATE_WELCOME: (data: { fullName: string; codes: number }) => ({
    subject: `Welcome to Trading Alerts Affiliate Program!`,
    html: `
      <h1>Welcome ${data.fullName}!</h1>
      <p>Your affiliate account is now active. We've distributed ${data.codes} discount codes.</p>
      <a href="https://trading-alerts.com/affiliate/dashboard">Login to Dashboard</a>
    `
  }),
  CODE_USED: (data: { code: string; commission: number }) => ({
    subject: `🎉 Your code was just used! You earned $${data.commission}`,
    html: `
      <h1>Great news!</h1>
      <p>Code <strong>${data.code}</strong> was used. You earned $${data.commission}.</p>
    `
  })
  // ... 6 more templates
};
```

### 13.9 Security Considerations

**Critical Rules:**
1. ✅ Affiliates can only view their own codes and commissions
2. ✅ Discount codes must be validated for:
   - Exists in database
   - Status = ACTIVE
   - Not expired (expiresAt > now)
   - Not already used (usedAt = null)
3. ✅ Admin endpoints require role check: `user.role === 'ADMIN'`
4. ✅ Commission creation only via Stripe webhook (prevents fraud)
5. ✅ Code generation uses `crypto.randomBytes(16).toString('hex')` (not predictable)
6. ✅ Payment preferences encrypted at rest (bank account numbers, crypto addresses)

**DO NOT:**
- ❌ Allow affiliates to generate their own codes
- ❌ Allow manual commission creation by affiliates
- ❌ Expose admin reports to non-admin users
- ❌ Use sequential or predictable code formats

### 13.10 Integration with Existing Checkout Flow

**Rule:** Affiliate code validation happens BEFORE payment processing, discount applied to Stripe metadata.

**Modified Checkout Flow:**
```typescript
// app/api/checkout/create-session/route.ts
export async function POST(req: NextRequest) {
  const { priceId, affiliateCode } = await req.json();

  let discountPercent = 0;
  let affiliateCodeId = null;

  // Validate affiliate code if provided
  if (affiliateCode) {
    const code = await validateAffiliateCode(affiliateCode);
    if (code.valid) {
      discountPercent = code.discountPercent;
      affiliateCodeId = code.id;
    }
  }

  // Calculate prices
  const regularPrice = PRICES[priceId];
  const discountAmount = regularPrice * (discountPercent / 100);
  const finalPrice = regularPrice - discountAmount;

  // Create Stripe session with metadata
  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: 'PRO Tier' },
        unit_amount: Math.round(finalPrice * 100),
        recurring: { interval: 'month' }
      },
      quantity: 1
    }],
    metadata: {
      affiliateCode: affiliateCode || null,
      affiliateCodeId: affiliateCodeId || null,
      regularPrice: regularPrice.toString(),
      discountPercent: discountPercent.toString(),
      userId: session.user.id
    }
  });

  return NextResponse.json({ url: session.url });
}
```

---

## Summary of Architecture Rules

✅ **DO:**
- Follow v5-structure-division.md for all file placements
- Use OpenAPI specs as source of truth for types
- Validate authentication + tier on all protected endpoints
- Use Prisma for all database operations
- Use Server Components by default, Client Components when needed
- Keep business logic in lib/, separate from UI
- Validate tiers on BOTH Next.js AND Flask services
- Use pre-approved dependencies
- Use separate JWT authentication for affiliates (AFFILIATE_JWT_SECRET)
- Validate affiliate codes before checkout (ACTIVE, not expired, not used)
- Create commissions via Stripe webhook only (prevents fraud)
- Use accounting-style reports (opening/closing balances)
- Generate codes with crypto.randomBytes (cryptographically secure)

❌ **DON'T:**
- Manually define types that exist in OpenAPI
- Skip tier validation on symbol/timeframe endpoints
- Use raw SQL (use Prisma instead)
- Import components in lib/ (separation of concerns)
- Call database directly from frontend
- Add new dependencies without approval
- Use 'use client' unnecessarily
- Reuse user authentication for affiliates
- Allow affiliates to generate their own codes
- Create commissions manually (only via webhook)
- Use predictable/sequential code formats

**Why these rules matter:** Consistent architecture makes the codebase navigable, maintainable, and secure. Following these patterns across all 170+ files ensures quality at scale.
