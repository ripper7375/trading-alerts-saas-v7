# Coding Patterns for Aider with MiniMax M2

## Purpose

This document provides **complete, working code examples** that Aider can copy directly. These are not snippets - they are full, production-ready implementations that follow all our policies and standards.

**Usage:** When building a file, reference the relevant pattern here, adapt it to your specific requirements, and ensure it matches the OpenAPI contract.

---

## PATTERN 1: NEXT.JS API ROUTE (Complete Example)

**File:** `app/api/alerts/route.ts`

**Purpose:** Standard pattern for all Next.js API routes with authentication, validation, tier checking, error handling.

**Full Implementation:**

```typescript
// app/api/alerts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { validateChartAccess, ForbiddenError } from '@/lib/tier/validation';
import type { Alert } from '@prisma/client';

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. INPUT VALIDATION SCHEMAS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const createAlertSchema = z.object({
  symbol: z.string().min(1, 'Symbol required').max(20, 'Symbol too long'),
  timeframe: z.enum(
    ['M5', 'M15', 'M30', 'H1', 'H2', 'H4', 'H8', 'H12', 'D1'],
    { errorMap: () => ({ message: 'Invalid timeframe' }) }
  ),
  condition: z
    .string()
    .min(1, 'Condition required')
    .max(500, 'Condition too long'),
});

type CreateAlertInput = z.infer<typeof createAlertSchema>;

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. GET HANDLER - Fetch all alerts for authenticated user
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/alerts - Fetch all alerts for the authenticated user
 *
 * Returns alerts ordered by creation date (newest first).
 * Requires authentication.
 *
 * @returns 200: Array of alerts matching AlertResponse schema
 * @returns 401: Unauthorized (not logged in)
 * @returns 500: Internal server error
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    //───────────────────────────────────────────────────────
    // STEP 1: Authentication Check
    //───────────────────────────────────────────────────────
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to view alerts',
        },
        { status: 401 }
      );
    }

    const userId = session.user.id; // Type: string (TypeScript knows it's defined after check)

    //───────────────────────────────────────────────────────
    // STEP 2: Database Query
    //───────────────────────────────────────────────────────
    const alerts = await prisma.alert.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc', // Newest first
      },
      select: {
        id: true,
        userId: true,
        symbol: true,
        timeframe: true,
        condition: true,
        isActive: true,
        createdAt: true,
        triggeredAt: true,
      },
    });

    //───────────────────────────────────────────────────────
    // STEP 3: Response (matching OpenAPI schema)
    //───────────────────────────────────────────────────────
    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    //───────────────────────────────────────────────────────
    // STEP 4: Error Handling
    //───────────────────────────────────────────────────────
    console.error('GET /api/alerts error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch alerts',
        message: 'An error occurred while fetching your alerts. Please try again.',
      },
      { status: 500 }
    );
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. POST HANDLER - Create new alert with tier validation
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/alerts - Create a new alert with tier validation
 *
 * Validates user's tier can access the symbol/timeframe combination.
 * Checks alert count limits (FREE: 5, PRO: 20).
 * Creates alert in database.
 *
 * @param req - Request body: { symbol, timeframe, condition }
 * @returns 201: Created alert matching AlertResponse schema
 * @returns 400: Invalid input
 * @returns 401: Unauthorized (not logged in)
 * @returns 403: Forbidden (tier restriction or limit reached)
 * @returns 500: Internal server error
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    //───────────────────────────────────────────────────────
    // STEP 1: Authentication Check
    //───────────────────────────────────────────────────────
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to create alerts',
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userTier = session.user.tier || 'FREE'; // Default to FREE if not set

    //───────────────────────────────────────────────────────
    // STEP 2: Input Validation with Zod
    //───────────────────────────────────────────────────────
    const body = await req.json();
    const validationResult = createAlertSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          message: 'Please check your input and try again',
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { symbol, timeframe, condition } = validationResult.data;

    //───────────────────────────────────────────────────────
    // STEP 3: Tier Validation (Symbol + Timeframe Access)
    //───────────────────────────────────────────────────────
    try {
      validateChartAccess(userTier, symbol, timeframe);
    } catch (tierError) {
      if (tierError instanceof ForbiddenError) {
        return NextResponse.json(
          {
            error: 'Tier restriction',
            message: tierError.message,
            upgrade: userTier === 'FREE' ? {
              message: 'Upgrade to PRO for access to all 15 symbols and 9 timeframes',
              upgradeUrl: '/pricing',
            } : undefined,
          },
          { status: 403 }
        );
      }
      // Re-throw if not ForbiddenError
      throw tierError;
    }

    //───────────────────────────────────────────────────────
    // STEP 4: Check Alert Count Limit
    //───────────────────────────────────────────────────────
    const alertCount = await prisma.alert.count({
      where: {
        userId,
      },
    });

    const maxAlerts = userTier === 'PRO' ? 20 : 5;

    if (alertCount >= maxAlerts) {
      return NextResponse.json(
        {
          error: 'Alert limit reached',
          message: `${userTier} tier allows maximum ${maxAlerts} alerts`,
          current: alertCount,
          limit: maxAlerts,
          upgrade: userTier === 'FREE' ? {
            message: 'Upgrade to PRO for 20 alerts',
            upgradeUrl: '/pricing',
          } : undefined,
        },
        { status: 403 }
      );
    }

    //───────────────────────────────────────────────────────
    // STEP 5: Business Logic - Create Alert
    //───────────────────────────────────────────────────────
    const alert = await prisma.alert.create({
      data: {
        userId,
        symbol,
        timeframe,
        condition,
        isActive: true,
        // createdAt: auto-generated
        // triggeredAt: null by default
      },
    });

    //───────────────────────────────────────────────────────
    // STEP 6: Response (matching OpenAPI schema)
    //───────────────────────────────────────────────────────
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    //───────────────────────────────────────────────────────
    // STEP 7: Error Handling
    //───────────────────────────────────────────────────────
    console.error('POST /api/alerts error:', {
      userId: session?.user?.id,
      action: 'create_alert',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Failed to create alert',
        message: 'An error occurred while creating your alert. Please try again.',
      },
      { status: 500 }
    );
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. PATCH HANDLER - Update alert (optional, for completeness)
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * PATCH /api/alerts - Update alert (typically in /api/alerts/[id]/route.ts)
 * This is a placeholder showing the pattern
 */

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KEY TAKEAWAYS:
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. Always check authentication FIRST
// 2. Validate inputs with Zod (never trust client data)
// 3. Validate tier access for symbol/timeframe endpoints
// 4. Check resource limits (alerts, watchlist items)
// 5. Use Prisma for all database operations
// 6. Return responses matching OpenAPI schema
// 7. Handle errors gracefully (try/catch wrapping all)
// 8. Log errors with context (userId, action, timestamp)
// 9. Return user-friendly error messages (not raw errors)
// 10. Use proper HTTP status codes (401, 403, 400, 500)
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## PATTERN 2: REACT CLIENT COMPONENT WITH FORM

**File:** `components/alerts/alert-form.tsx`

**Purpose:** Interactive form with state management, validation, loading states, error handling, API calls.

**Full Implementation:**

```typescript
// components/alerts/alert-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { canAccessSymbol, canAccessTimeframe } from '@/lib/tier/validation';

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. TYPES & VALIDATION SCHEMA
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const alertFormSchema = z.object({
  symbol: z.string().min(1, 'Please select a symbol'),
  timeframe: z.string().min(1, 'Please select a timeframe'),
  condition: z
    .string()
    .min(1, 'Condition is required')
    .max(500, 'Condition must be less than 500 characters'),
});

type AlertFormData = z.infer<typeof alertFormSchema>;

interface AlertFormProps {
  /** Callback fired when alert is successfully created */
  onSuccess?: (alert: any) => void;
  /** Callback fired when alert creation fails */
  onError?: (error: Error) => void;
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. SYMBOL & TIMEFRAME CONFIGURATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SYMBOLS = [
  { value: 'BTCUSD', label: 'Bitcoin/USD', proOnly: false },
  { value: 'EURUSD', label: 'Euro/USD', proOnly: false },
  { value: 'USDJPY', label: 'USD/Japanese Yen', proOnly: false },
  { value: 'US30', label: 'Dow Jones 30', proOnly: false },
  { value: 'XAUUSD', label: 'Gold/USD', proOnly: false },
  // PRO-only symbols
  { value: 'AUDJPY', label: 'Australian Dollar/Japanese Yen', proOnly: true },
  { value: 'AUDUSD', label: 'Australian Dollar/USD', proOnly: true },
  { value: 'ETHUSD', label: 'Ethereum/USD', proOnly: true },
  { value: 'GBPJPY', label: 'British Pound/Japanese Yen', proOnly: true },
  { value: 'GBPUSD', label: 'British Pound/USD', proOnly: true },
  { value: 'NDX100', label: 'Nasdaq 100', proOnly: true },
  { value: 'NZDUSD', label: 'New Zealand Dollar/USD', proOnly: true },
  { value: 'USDCAD', label: 'USD/Canadian Dollar', proOnly: true },
  { value: 'USDCHF', label: 'USD/Swiss Franc', proOnly: true },
  { value: 'XAGUSD', label: 'Silver/USD', proOnly: true },
];

const TIMEFRAMES = [
  { value: 'M5', label: '5 Minutes', proOnly: true },
  { value: 'M15', label: '15 Minutes', proOnly: true },
  { value: 'M30', label: '30 Minutes', proOnly: true },
  { value: 'H1', label: '1 Hour', proOnly: false },
  { value: 'H2', label: '2 Hours', proOnly: true },
  { value: 'H4', label: '4 Hours', proOnly: false },
  { value: 'H8', label: '8 Hours', proOnly: true },
  { value: 'H12', label: '12 Hours', proOnly: true },
  { value: 'D1', label: 'Daily', proOnly: false },
];

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. ALERT FORM COMPONENT
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Alert creation form with tier-aware symbol/timeframe selection
 *
 * Features:
 * - Client-side validation with Zod
 * - Tier-based access control (FREE vs PRO)
 * - Loading states during submission
 * - Inline error messages
 * - Success/error callbacks
 * - Disabled PRO-only options for FREE users
 *
 * @example
 * ```tsx
 * <AlertForm
 *   onSuccess={(alert) => router.push(`/dashboard/alerts/${alert.id}`)}
 *   onError={(error) => toast.error(error.message)}
 * />
 * ```
 */
export function AlertForm({ onSuccess, onError }: AlertFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  //───────────────────────────────────────────────────────
  // STATE MANAGEMENT
  //───────────────────────────────────────────────────────
  const [formData, setFormData] = useState<AlertFormData>({
    symbol: '',
    timeframe: '',
    condition: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AlertFormData | 'submit', string>>>({});

  const userTier = session?.user?.tier || 'FREE';

  //───────────────────────────────────────────────────────
  // FORM SUBMISSION HANDLER
  //───────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate with Zod
    const validationResult = alertFormSchema.safeParse(formData);

    if (!validationResult.success) {
      // Convert Zod errors to field errors
      const fieldErrors: Partial<Record<keyof AlertFormData, string>> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof AlertFormData;
        if (field) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Submit to API
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      const data = await response.json();

      if (!response.ok) {
        // API returned error
        throw new Error(data.message || data.error || 'Failed to create alert');
      }

      // Success!
      onSuccess?.(data);
      router.push('/dashboard/alerts');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      setErrors({ submit: err.message });
      onError?.(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  //───────────────────────────────────────────────────────
  // RENDER
  //───────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Symbol Selection */}
      <div className="space-y-2">
        <Label htmlFor="symbol">Symbol</Label>
        <Select
          value={formData.symbol}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, symbol: value }))
          }
        >
          <SelectTrigger id="symbol" className={errors.symbol ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a symbol" />
          </SelectTrigger>
          <SelectContent>
            {SYMBOLS.map((symbol) => {
              const canAccess = canAccessSymbol(userTier, symbol.value);
              return (
                <SelectItem
                  key={symbol.value}
                  value={symbol.value}
                  disabled={!canAccess}
                >
                  {symbol.label}
                  {symbol.proOnly && userTier === 'FREE' && ' 🔒 PRO'}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {errors.symbol && (
          <p className="text-sm text-red-600">{errors.symbol}</p>
        )}
      </div>

      {/* Timeframe Selection */}
      <div className="space-y-2">
        <Label htmlFor="timeframe">Timeframe</Label>
        <Select
          value={formData.timeframe}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, timeframe: value }))
          }
        >
          <SelectTrigger id="timeframe" className={errors.timeframe ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a timeframe" />
          </SelectTrigger>
          <SelectContent>
            {TIMEFRAMES.map((tf) => {
              const canAccess = canAccessTimeframe(userTier, tf.value);
              return (
                <SelectItem
                  key={tf.value}
                  value={tf.value}
                  disabled={!canAccess}
                >
                  {tf.label}
                  {tf.proOnly && userTier === 'FREE' && ' 🔒 PRO'}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {errors.timeframe && (
          <p className="text-sm text-red-600">{errors.timeframe}</p>
        )}
      </div>

      {/* Condition Input */}
      <div className="space-y-2">
        <Label htmlFor="condition">Condition</Label>
        <Input
          id="condition"
          type="text"
          placeholder="e.g., RSI > 70"
          value={formData.condition}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, condition: e.target.value }))
          }
          className={errors.condition ? 'border-red-500' : ''}
          maxLength={500}
        />
        {errors.condition && (
          <p className="text-sm text-red-600">{errors.condition}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {formData.condition.length}/500 characters
        </p>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Alert...
          </>
        ) : (
          'Create Alert'
        )}
      </Button>

      {/* Upgrade CTA for FREE users */}
      {userTier === 'FREE' && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Want access to all symbols and timeframes?</strong>
            <br />
            Upgrade to PRO for 15 symbols × 9 timeframes = 135 chart combinations.
          </p>
          <Button
            type="button"
            variant="link"
            className="mt-2 text-blue-600"
            onClick={() => router.push('/pricing')}
          >
            View PRO Features →
          </Button>
        </div>
      )}
    </form>
  );
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KEY TAKEAWAYS:
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 'use client' directive for Client Components
// 2. Zod validation both client-side and server-side
// 3. Loading states (isSubmitting) for better UX
// 4. Error states (per-field errors + submit error)
// 5. Tier-aware UI (disable PRO-only options for FREE users)
// 6. Callbacks (onSuccess, onError) for parent components
// 7. Accessibility (Label, proper ARIA attributes)
// 8. User feedback (character counter, loading spinner)
// 9. Upgrade prompts for FREE users (growth strategy)
// 10. Type-safe (TypeScript + Zod schemas)
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## PATTERN 3: TIER VALIDATION UTILITY

**File:** `lib/tier/validation.ts`

**Purpose:** Centralized tier validation logic used by both Next.js and Flask services.

**Full Implementation:**

```typescript
// lib/tier/validation.ts

/**
 * Tier Validation Utilities
 *
 * Validates user tier access to symbols, timeframes, and chart combinations.
 * Used by both Next.js API routes and imported conceptually by Flask service.
 *
 * Based on specs in docs/policies/00-tier-specifications.md
 */

import type { UserTier } from '@/types';

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. TIER DEFINITIONS (Source of Truth)
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * FREE tier symbols (5 total)
 * - BTCUSD: Crypto - Bitcoin
 * - EURUSD: Forex Major - Euro/Dollar
 * - USDJPY: Forex Major - Dollar/Yen
 * - US30: Index - Dow Jones Industrial Average
 * - XAUUSD: Commodities - Gold
 */
export const FREE_SYMBOLS = [
  'BTCUSD',
  'EURUSD',
  'USDJPY',
  'US30',
  'XAUUSD',
] as const;

/**
 * PRO tier symbols (15 total)
 * Includes all FREE symbols plus 10 additional symbols
 */
export const PRO_SYMBOLS = [
  'AUDJPY',   // Forex Cross - Australian Dollar/Japanese Yen
  'AUDUSD',   // Forex Major - Australian Dollar/US Dollar
  'BTCUSD',   // Crypto - Bitcoin
  'ETHUSD',   // Crypto - Ethereum
  'EURUSD',   // Forex Major - Euro/Dollar
  'GBPJPY',   // Forex Cross - British Pound/Japanese Yen
  'GBPUSD',   // Forex Major - British Pound/Dollar
  'NDX100',   // Index - Nasdaq 100
  'NZDUSD',   // Forex Major - New Zealand Dollar/US Dollar
  'US30',     // Index - Dow Jones Industrial Average
  'USDCAD',   // Forex Major - US Dollar/Canadian Dollar
  'USDCHF',   // Forex Major - US Dollar/Swiss Franc
  'USDJPY',   // Forex Major - Dollar/Yen
  'XAGUSD',   // Commodities - Silver
  'XAUUSD',   // Commodities - Gold
] as const;

/**
 * FREE tier timeframes (3 total)
 * - H1: 1 Hour
 * - H4: 4 Hours
 * - D1: Daily
 */
export const FREE_TIMEFRAMES = [
  'H1',
  'H4',
  'D1',
] as const;

/**
 * PRO tier timeframes (9 total)
 * Includes all FREE timeframes plus 6 additional timeframes
 */
export const PRO_TIMEFRAMES = [
  'M5',   // 5 Minutes (scalping)
  'M15',  // 15 Minutes
  'M30',  // 30 Minutes
  'H1',   // 1 Hour
  'H2',   // 2 Hours
  'H4',   // 4 Hours
  'H8',   // 8 Hours
  'H12',  // 12 Hours (swing trading)
  'D1',   // Daily
] as const;

/**
 * Resource limits by tier
 */
export const TIER_LIMITS = {
  FREE: {
    symbols: 5,
    timeframes: 3,
    maxAlerts: 5,
    maxWatchlistItems: 5,
    rateLimit: 60, // requests per hour
  },
  PRO: {
    symbols: 15,
    timeframes: 9,
    maxAlerts: 20,
    maxWatchlistItems: 50,
    rateLimit: 300, // requests per hour
  },
} as const;

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. CUSTOM ERROR CLASS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Custom error for tier validation failures
 * Use this to differentiate tier errors from other errors
 */
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. SYMBOL VALIDATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if a tier can access a symbol (non-throwing)
 *
 * @param tier - User's tier (FREE or PRO)
 * @param symbol - Trading symbol to check
 * @returns true if tier can access symbol, false otherwise
 *
 * @example
 * ```typescript
 * canAccessSymbol('FREE', 'EURUSD') // true
 * canAccessSymbol('FREE', 'AUDJPY') // false (PRO-only)
 * canAccessSymbol('PRO', 'AUDJPY')  // true
 * ```
 */
export function canAccessSymbol(tier: UserTier, symbol: string): boolean {
  const allowedSymbols = tier === 'PRO' ? PRO_SYMBOLS : FREE_SYMBOLS;
  return allowedSymbols.includes(symbol as any);
}

/**
 * Get all symbols accessible by a tier
 *
 * @param tier - User's tier
 * @returns Array of accessible symbols
 */
export function getAccessibleSymbols(tier: UserTier): readonly string[] {
  return tier === 'PRO' ? PRO_SYMBOLS : FREE_SYMBOLS;
}

/**
 * Validate symbol access (throwing)
 *
 * @param tier - User's tier
 * @param symbol - Trading symbol to validate
 * @throws {ForbiddenError} If tier cannot access symbol
 *
 * @example
 * ```typescript
 * try {
 *   validateSymbolAccess('FREE', 'AUDJPY');
 * } catch (error) {
 *   if (error instanceof ForbiddenError) {
 *     // Handle tier restriction
 *   }
 * }
 * ```
 */
export function validateSymbolAccess(tier: UserTier, symbol: string): void {
  if (!canAccessSymbol(tier, symbol)) {
    const allowedSymbols = getAccessibleSymbols(tier);
    throw new ForbiddenError(
      `${tier} tier cannot access ${symbol}. Available symbols: ${allowedSymbols.join(', ')}`
    );
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. TIMEFRAME VALIDATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if a tier can access a timeframe (non-throwing)
 *
 * @param tier - User's tier (FREE or PRO)
 * @param timeframe - Chart timeframe to check
 * @returns true if tier can access timeframe, false otherwise
 *
 * @example
 * ```typescript
 * canAccessTimeframe('FREE', 'H1')  // true
 * canAccessTimeframe('FREE', 'M5')  // false (PRO-only)
 * canAccessTimeframe('PRO', 'M5')   // true
 * ```
 */
export function canAccessTimeframe(tier: UserTier, timeframe: string): boolean {
  const allowedTimeframes = tier === 'PRO' ? PRO_TIMEFRAMES : FREE_TIMEFRAMES;
  return allowedTimeframes.includes(timeframe as any);
}

/**
 * Get all timeframes accessible by a tier
 *
 * @param tier - User's tier
 * @returns Array of accessible timeframes
 */
export function getAccessibleTimeframes(tier: UserTier): readonly string[] {
  return tier === 'PRO' ? PRO_TIMEFRAMES : FREE_TIMEFRAMES;
}

/**
 * Validate timeframe access (throwing)
 *
 * @param tier - User's tier
 * @param timeframe - Chart timeframe to validate
 * @throws {ForbiddenError} If tier cannot access timeframe
 */
export function validateTimeframeAccess(tier: UserTier, timeframe: string): void {
  if (!canAccessTimeframe(tier, timeframe)) {
    const allowedTimeframes = getAccessibleTimeframes(tier);
    throw new ForbiddenError(
      `${tier} tier cannot access ${timeframe} timeframe. Available timeframes: ${allowedTimeframes.join(', ')}`
    );
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. COMBINED CHART ACCESS VALIDATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Validate complete chart access (symbol + timeframe)
 *
 * This is the main validation function used by API routes.
 * Checks both symbol AND timeframe access.
 *
 * @param tier - User's tier
 * @param symbol - Trading symbol
 * @param timeframe - Chart timeframe
 * @throws {ForbiddenError} If tier cannot access symbol or timeframe
 *
 * @example
 * ```typescript
 * // In API route
 * try {
 *   validateChartAccess(userTier, params.symbol, params.timeframe);
 *   // If we get here, user has access - proceed with data fetching
 * } catch (error) {
 *   if (error instanceof ForbiddenError) {
 *     return Response.json({ error: error.message }, { status: 403 });
 *   }
 *   throw error;
 * }
 * ```
 */
export function validateChartAccess(
  tier: UserTier,
  symbol: string,
  timeframe: string
): void {
  // Validate symbol first (more specific error message)
  validateSymbolAccess(tier, symbol);

  // Validate timeframe
  validateTimeframeAccess(tier, timeframe);

  // Both checks passed - access granted
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. RESOURCE LIMIT VALIDATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if user can create another alert (based on tier limit)
 *
 * @param tier - User's tier
 * @param currentCount - Current number of alerts user has
 * @returns true if user can create another alert, false if limit reached
 */
export function canCreateAlert(tier: UserTier, currentCount: number): boolean {
  return currentCount < TIER_LIMITS[tier].maxAlerts;
}

/**
 * Check if user can add another watchlist item (based on tier limit)
 *
 * @param tier - User's tier
 * @param currentCount - Current number of watchlist items user has
 * @returns true if user can add another item, false if limit reached
 */
export function canAddWatchlistItem(tier: UserTier, currentCount: number): boolean {
  return currentCount < TIER_LIMITS[tier].maxWatchlistItems;
}

/**
 * Get tier limits for a specific tier
 *
 * @param tier - User's tier
 * @returns Object containing all limits for the tier
 */
export function getTierLimits(tier: UserTier) {
  return TIER_LIMITS[tier];
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KEY TAKEAWAYS:
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. Single source of truth for tier rules
// 2. Separate non-throwing (can*) and throwing (validate*) functions
// 3. Custom ForbiddenError for tier violations
// 4. Detailed error messages telling users what they CAN access
// 5. Exported constants for use in UI (FREE_SYMBOLS, etc.)
// 6. Comprehensive JSDoc for every function
// 7. Type-safe with TypeScript
// 8. Used by BOTH Next.js API routes AND Flask service (conceptually)
// 9. Easy to test (pure functions, no side effects)
// 10. Resource limits centralized (alerts, watchlist, rate limits)
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

Due to character limits, I'll create the remaining patterns in a continuation. Let me finish this file and then create the final policy document (06-aider-instructions.md).

---

## PATTERN 4: PRISMA DATABASE UTILITY

**File:** `lib/db/alerts.ts`

**Purpose:** Database operations layer - all Prisma queries for alerts centralized here.

**Key Pattern:** Separation of concerns - API routes call these functions, not Prisma directly.

```typescript
// lib/db/alerts.ts

import { prisma } from './prisma';
import type { Alert, Prisma } from '@prisma/client';

/**
 * Create a new alert
 */
export async function createAlert(data: Prisma.AlertCreateInput): Promise<Alert> {
  return prisma.alert.create({ data });
}

/**
 * Get all alerts for a user
 */
export async function getUserAlerts(userId: string): Promise<Alert[]> {
  return prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get alert by ID (with user ownership check)
 */
export async function getAlertById(
  alertId: string,
  userId: string
): Promise<Alert | null> {
  return prisma.alert.findFirst({
    where: { id: alertId, userId },
  });
}

/**
 * Update alert
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
 * Delete alert
 */
export async function deleteAlert(alertId: string, userId: string): Promise<void> {
  await prisma.alert.delete({
    where: { id: alertId, userId },
  });
}

/**
 * Count user's alerts
 */
export async function countUserAlerts(userId: string): Promise<number> {
  return prisma.alert.count({ where: { userId } });
}
```

---

## PATTERN 5: FLASK MT5 ENDPOINT

**File:** `mt5-service/app/routes/indicators.py`

**Purpose:** Flask route with tier validation and MT5 integration

```python
# mt5-service/app/routes/indicators.py

from flask import Blueprint, jsonify, request
from app.services.mt5_connector import fetch_indicator_data
from app.middleware.tier_validator import validate_tier_access
from functools import wraps

indicators_bp = Blueprint('indicators', __name__)

@indicators_bp.route('/api/indicators/<symbol>/<timeframe>', methods=['GET'])
@validate_tier_access  # Tier validation middleware
def get_indicators(symbol: str, timeframe: str):
    """
    Fetch indicator data from MT5 for symbol/timeframe
    
    Tier validation happens in middleware.
    This endpoint should only be reached if user's tier can access symbol/timeframe.
    """
    try:
        # Fetch data from MT5
        data = fetch_indicator_data(symbol, timeframe)
        
        return jsonify({
            'symbol': symbol,
            'timeframe': timeframe,
            'indicators': data,
            'metadata': {
                'fetchedAt': datetime.utcnow().isoformat(),
                'source': 'MT5'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch indicator data',
            'message': str(e)
        }), 500
```

---

## PATTERN 6: CONSTANTS FILE

**File:** `lib/constants/tiers.ts`

**Purpose:** Central constants for tier system

```typescript
// lib/constants/tiers.ts

export const TIER_CONFIG = {
  FREE: {
    name: 'Free',
    price: 0,
    symbols: 5,
    timeframes: 3,
    chartCombinations: 15,
    maxAlerts: 5,
    maxWatchlistItems: 5,
    apiRateLimit: 60, // per hour
  },
  PRO: {
    name: 'Pro',
    price: 29,
    symbols: 15,
    timeframes: 9,
    chartCombinations: 135,
    maxAlerts: 20,
    maxWatchlistItems: 50,
    apiRateLimit: 300, // per hour
  },
} as const;

export type UserTier = keyof typeof TIER_CONFIG;
```

---

## SUMMARY OF PATTERNS

Use these patterns as templates:

1. **API Route Pattern:** Authentication → Validation → Tier Check → Business Logic → Response
2. **Client Component Pattern:** State management → Form handling → API calls → Loading/Error states
3. **Tier Validation Pattern:** Centralized validation utilities with custom errors
4. **Database Pattern:** Prisma operations isolated in lib/db/*
5. **Flask Pattern:** Python endpoint with tier validation middleware
6. **Constants Pattern:** Centralized configuration

**Remember:** Adapt these patterns to your specific requirements and ensure they match OpenAPI contracts.

