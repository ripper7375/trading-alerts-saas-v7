# Part 18: dLocal Payment Integration (Emerging Markets)

## Overview

**Part 18** adds dLocal payment processing alongside Stripe, enabling users from emerging markets (India, Nigeria, Pakistan, Vietnam, Indonesia, Thailand, South Africa, Turkey) to subscribe to PRO plans using local payment methods (UPI, Paytm, JazzCash, GoPay, etc.) without international credit cards.

**Why this exists:** Stripe requires international credit/debit cards. Many users in emerging markets don't have these cards, preventing them from accessing PRO features. dLocal bridges this gap by supporting local payment methods popular in each country.

---

## Key Business Rules (CRITICAL)

### dLocal vs Stripe Differences

| Feature | Stripe | dLocal |
|---------|--------|--------|
| Auto-Renewal | ✅ Yes | ❌ NO - Manual renewal required |
| Free Trial | ✅ 7 days | ❌ NO trial period |
| Plans | Monthly only | **3-day** + Monthly |
| Discount Codes | ✅ All plans | ❌ Monthly ONLY (not 3-day) |
| Renewal Notifications | Stripe manages | **We send** 3 days before expiry |
| Expiry Handling | Stripe auto-downgrades | **We downgrade** manually via cron |

**CRITICAL:** Never apply Stripe auto-renewal logic to dLocal subscriptions!

---

## Supported Countries & Payment Methods

### Countries (8 total)

```typescript
const DLOCAL_COUNTRIES = {
  IN: { name: 'India', currency: 'INR', methods: ['UPI', 'Paytm', 'PhonePe', 'Net Banking'] },
  NG: { name: 'Nigeria', currency: 'NGN', methods: ['Bank Transfer', 'USSD', 'Paystack', 'Verve'] },
  PK: { name: 'Pakistan', currency: 'PKR', methods: ['JazzCash', 'Easypaisa'] },
  VN: { name: 'Vietnam', currency: 'VND', methods: ['VNPay', 'MoMo', 'ZaloPay'] },
  ID: { name: 'Indonesia', currency: 'IDR', methods: ['GoPay', 'OVO', 'Dana', 'ShopeePay'] },
  TH: { name: 'Thailand', currency: 'THB', methods: ['TrueMoney', 'Rabbit LINE Pay', 'Thai QR'] },
  ZA: { name: 'South Africa', currency: 'ZAR', methods: ['Instant EFT', 'EFT'] },
  TR: { name: 'Turkey', currency: 'TRY', methods: ['Bank Transfer', 'Local Cards'] }
} as const;
```

### Pricing

```typescript
const DLOCAL_PRICING = {
  THREE_DAY: {
    usd: 1.99,
    duration: 3,
    discountAllowed: false  // ❌ NO discount codes
  },
  MONTHLY: {
    usd: 29.00,
    duration: 30,
    discountAllowed: true   // ✅ Discount codes allowed
  }
} as const;
```

---

## Files to Create (Total: ~45 files)

### 1. Database Schema (Prisma)

**File:** `prisma/schema.prisma` (UPDATE EXISTING)

```prisma
// ADD these fields to existing User model
model User {
  // ... existing fields ...

  // NEW: 3-day plan anti-abuse tracking
  hasUsedThreeDayPlan   Boolean   @default(false)
  threeDayPlanUsedAt    DateTime?

  // NEW: Fraud detection
  lastLoginIP           String?
  deviceFingerprint     String?

  // ... rest of existing fields ...
}

// ADD these fields to existing Subscription model
model Subscription {
  // ... existing fields ...

  // NEW: Payment provider field
  paymentProvider       PaymentProvider  @default(STRIPE)

  // NEW: dLocal-specific fields
  dlocalPaymentId       String?
  dlocalPaymentMethod   String?
  dlocalCountry         String?
  dlocalCurrency        String?

  // NEW: Plan type field
  planType              PlanType         @default(MONTHLY)

  // NEW: Amount tracking (local currency + USD)
  amount                Decimal
  amountUSD             Decimal
  currency              String

  // NEW: Manual renewal tracking
  expiresAt             DateTime?
  renewalReminderSent   Boolean          @default(false)

  // ... rest of existing fields ...
}

// NEW: Payment transaction log
model Payment {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])
  subscriptionId        String?
  subscription          Subscription? @relation(fields: [subscriptionId], references: [id])

  // Provider info
  provider              PaymentProvider
  providerPaymentId     String
  providerStatus        String

  // Payment details
  amount                Decimal
  amountUSD             Decimal
  currency              String
  exchangeRate          Decimal?        // NEW: For audit trail
  country               String
  paymentMethod         String

  // Plan details
  planType              PlanType
  duration              Int

  // Discount details
  discountCode          String?
  discountAmount        Decimal?

  // Status
  status                PaymentStatus
  failureReason         String?

  // NEW: Anti-abuse tracking (for 3-day plan)
  paymentMethodHash     String?         // SHA256(email + payment_method_id)
  purchaseIP            String?
  deviceFingerprint     String?
  accountAgeAtPurchase  Int?            // Account age in hours

  // Timestamps
  initiatedAt           DateTime   @default(now())
  completedAt           DateTime?
  failedAt              DateTime?

  // Metadata
  metadata              Json?

  @@index([userId])
  @@index([provider, providerPaymentId])
  @@index([status])
  @@index([planType])               // NEW: For 3-day plan queries
  @@index([paymentMethodHash])      // NEW: For abuse detection
}

// NEW: Fraud monitoring
model FraudAlert {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])

  // Alert details
  pattern               String   // 'MULTIPLE_ACCOUNTS_SAME_IP', 'SAME_PAYMENT_METHOD', etc.
  metadata              Json     // Stores detection details
  severity              String   // 'LOW' | 'MEDIUM' | 'HIGH'

  // Review tracking
  status                String   @default("PENDING_REVIEW")  // 'PENDING_REVIEW' | 'CONFIRMED' | 'FALSE_POSITIVE'
  reviewedAt            DateTime?
  reviewedBy            String?
  reviewNotes           String?

  // Timestamps
  createdAt             DateTime @default(now())

  @@index([userId])
  @@index([status])
  @@index([severity])
  @@index([createdAt])
}

// NEW: Enums
enum PaymentProvider {
  STRIPE
  DLOCAL
}

enum PlanType {
  THREE_DAY
  MONTHLY
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED     // NEW - for dLocal
  CANCELLED
  PAYMENT_FAILED
  PENDING     // NEW - awaiting payment
}
```

**Migration Command:**

```bash
npx prisma migrate dev --name add_dlocal_support
```

---

### 2. Type Definitions

**File:** `types/dlocal.ts` (NEW)

```typescript
export type DLocalCountry = 'IN' | 'NG' | 'PK' | 'VN' | 'ID' | 'TH' | 'ZA' | 'TR';
export type DLocalCurrency = 'INR' | 'NGN' | 'PKR' | 'VND' | 'IDR' | 'THB' | 'ZAR' | 'TRY';
export type PlanType = 'THREE_DAY' | 'MONTHLY';
export type PaymentProvider = 'STRIPE' | 'DLOCAL';
export type PaymentMethodType = 'WALLET' | 'BANK_TRANSFER' | 'CARD' | 'USSD' | 'TICKET';
export type PaymentFlow = 'REDIRECT' | 'DIRECT';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  flow: PaymentFlow;
  provider: PaymentProvider;
  icon?: string;
  description?: string;
  processingTime?: string;
  recommended?: boolean;
  popular?: boolean;
}

export interface DLocalPaymentRequest {
  amount: number;
  currency: DLocalCurrency;
  country: DLocalCountry;
  payment_method_id: string;
  payer: {
    name: string;
    email: string;
    document?: string;
    phone?: string;
  };
  order_id: string;
  description: string;
  notification_url: string;
  callback_url: string;
}

export interface DLocalPaymentResponse {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED';
  payment_method_id: string;
  payment_method_type: string;
  payment_method_flow: PaymentFlow;
  redirect_url?: string;
  qr_code?: string;
  created_date: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

export interface CurrencyConversion {
  amountUSD: number;
  amountLocal: number;
  currency: string;
  exchangeRate: number;
}
```

---

### 3. Constants & Configuration

**File:** `lib/dlocal/constants.ts` (NEW)

```typescript
import { DLocalCountry, DLocalCurrency } from '@/types/dlocal';

export const DLOCAL_SUPPORTED_COUNTRIES: Record<DLocalCountry, {
  name: string;
  currency: DLocalCurrency;
  locale: string;
}> = {
  IN: { name: 'India', currency: 'INR', locale: 'en-IN' },
  NG: { name: 'Nigeria', currency: 'NGN', locale: 'en-NG' },
  PK: { name: 'Pakistan', currency: 'PKR', locale: 'en-PK' },
  VN: { name: 'Vietnam', currency: 'VND', locale: 'vi-VN' },
  ID: { name: 'Indonesia', currency: 'IDR', locale: 'id-ID' },
  TH: { name: 'Thailand', currency: 'THB', locale: 'th-TH' },
  ZA: { name: 'South Africa', currency: 'ZAR', locale: 'en-ZA' },
  TR: { name: 'Turkey', currency: 'TRY', locale: 'tr-TR' }
} as const;

export const DLOCAL_PRICING = {
  THREE_DAY: {
    usd: 1.99,
    duration: 3,
    discountAllowed: false
  },
  MONTHLY: {
    usd: 29.00,
    duration: 30,
    discountAllowed: true
  }
} as const;

export const FALLBACK_EXCHANGE_RATES: Record<string, number> = {
  'USD-INR': 83,
  'USD-NGN': 1500,
  'USD-PKR': 278,
  'USD-VND': 24000,
  'USD-IDR': 15500,
  'USD-THB': 35,
  'USD-ZAR': 18,
  'USD-TRY': 34
} as const;

export function isDLocalCountry(code: string): code is DLocalCountry {
  return code in DLOCAL_SUPPORTED_COUNTRIES;
}

export function canApplyDiscountCode(planType: PlanType, provider: PaymentProvider): boolean {
  if (provider === 'STRIPE') return true;
  if (provider === 'DLOCAL' && planType === 'MONTHLY') return true;
  return false;
}
```

---

### 4. Services

#### 4.1 Currency Converter Service

**File:** `lib/dlocal/currency-converter.service.ts` (NEW)

```typescript
import { DLocalCurrency, ExchangeRate, CurrencyConversion } from '@/types/dlocal';
import { FALLBACK_EXCHANGE_RATES } from './constants';

class CurrencyConverterService {
  private cache = new Map<string, { rate: number; expires: number }>();
  private CACHE_DURATION = 3600000; // 1 hour

  async convertUSDToLocal(
    amountUSD: number,
    targetCurrency: DLocalCurrency
  ): Promise<CurrencyConversion> {
    const rate = await this.getExchangeRate('USD', targetCurrency);
    const amountLocal = Math.round(amountUSD * rate);

    return {
      amountUSD,
      amountLocal,
      currency: targetCurrency,
      exchangeRate: rate
    };
  }

  async getExchangeRate(from: string, to: string): Promise<number> {
    const cacheKey = `${from}-${to}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() < cached.expires) {
      return cached.rate;
    }

    try {
      const response = await fetch(
        `${process.env.DLOCAL_API_URL}/exchange-rates?from=${from}&to=${to}`,
        {
          headers: this.getDLocalHeaders()
        }
      );

      const data: ExchangeRate = await response.json();

      this.cache.set(cacheKey, {
        rate: data.rate,
        expires: Date.now() + this.CACHE_DURATION
      });

      return data.rate;

    } catch (error) {
      console.error('Exchange rate fetch failed:', error);
      return this.getFallbackRate(from, to);
    }
  }

  private getFallbackRate(from: string, to: string): number {
    return FALLBACK_EXCHANGE_RATES[`${from}-${to}`] || 1;
  }

  private getDLocalHeaders() {
    return {
      'X-Date': new Date().toISOString(),
      'X-Login': process.env.DLOCAL_API_LOGIN!,
      'X-Trans-Key': process.env.DLOCAL_API_KEY!,
      'X-Version': '2.1'
    };
  }

  formatCurrency(amount: number, currency: string, locale: string): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

export const currencyConverter = new CurrencyConverterService();
```

#### 4.2 Payment Methods Service

**File:** `lib/dlocal/payment-methods.service.ts` (NEW)

```typescript
import { PaymentMethod, DLocalCountry } from '@/types/dlocal';
import { DLOCAL_SUPPORTED_COUNTRIES, isDLocalCountry } from './constants';

class PaymentMethodsService {
  private cache = new Map<string, PaymentMethod[]>();

  async getMethodsForCountry(country: string): Promise<PaymentMethod[]> {
    if (this.cache.has(country)) {
      return this.cache.get(country)!;
    }

    const methods: PaymentMethod[] = [];

    try {
      // Fetch dLocal methods if country is supported
      if (isDLocalCountry(country)) {
        const dlocalMethods = await this.fetchDLocalMethods(country);
        methods.push(...dlocalMethods);
      }
    } catch (error) {
      console.error('dLocal API failed, falling back to Stripe:', error);
    }

    // Always add Stripe card option as fallback
    methods.push({
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'CARD',
      flow: 'DIRECT',
      provider: 'stripe',
      icon: '💳',
      description: 'Visa, Mastercard, Amex',
      processingTime: 'Instant',
      recommended: !isDLocalCountry(country)
    });

    this.cache.set(country, methods);
    return methods;
  }

  private async fetchDLocalMethods(country: DLocalCountry): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(
        `${process.env.DLOCAL_API_URL}/payment-methods?country=${country}`,
        {
          headers: this.getDLocalHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`dLocal API error: ${response.status}`);
      }

      const data = await response.json();

      return data.map((method: any) => ({
        ...method,
        provider: 'dlocal' as const
      }));

    } catch (error) {
      console.error('Failed to fetch dLocal methods:', error);
      return [];
    }
  }

  private getDLocalHeaders() {
    return {
      'X-Date': new Date().toISOString(),
      'X-Login': process.env.DLOCAL_API_LOGIN!,
      'X-Trans-Key': process.env.DLOCAL_API_KEY!,
      'X-Version': '2.1'
    };
  }
}

export const paymentMethodsService = new PaymentMethodsService();
```

#### 4.3 dLocal Payment Service

**File:** `lib/dlocal/dlocal-payment.service.ts` (NEW)

```typescript
import crypto from 'crypto';
import { DLocalPaymentRequest, DLocalPaymentResponse } from '@/types/dlocal';

class DLocalPaymentService {
  async createPayment(request: DLocalPaymentRequest): Promise<DLocalPaymentResponse> {
    try {
      const response = await fetch(
        `${process.env.DLOCAL_API_URL}/payments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Date': new Date().toISOString(),
            'X-Login': process.env.DLOCAL_API_LOGIN!,
            'X-Trans-Key': process.env.DLOCAL_API_KEY!,
            'X-Version': '2.1',
            'Authorization': this.generateSignature(request)
          },
          body: JSON.stringify(request)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`dLocal payment failed: ${error.message}`);
      }

      const data: DLocalPaymentResponse = await response.json();
      return data;

    } catch (error) {
      console.error('dLocal payment creation failed:', error);
      throw error;
    }
  }

  private generateSignature(request: any): string {
    const payload = JSON.stringify(request);
    const signature = crypto
      .createHmac('sha256', process.env.DLOCAL_API_SECRET!)
      .update(payload)
      .digest('hex');

    return `V2-HMAC-SHA256, Signature: ${signature}`;
  }

  verifyWebhookSignature(body: any, signature: string | null): boolean {
    if (!signature) return false;

    const payload = JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.DLOCAL_WEBHOOK_SECRET!)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

export const dlocalPaymentService = new DLocalPaymentService();
```

#### 4.4 Three-Day Plan Validator Service (ANTI-ABUSE)

**File:** `lib/dlocal/three-day-validator.service.ts` (NEW)

```typescript
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';

interface ThreeDayValidationResult {
  allowed: boolean;
  reason?: string;
  usedAt?: Date;
}

interface AbuseCheckResult {
  isAbuse: boolean;
  pattern?: string;
  metadata?: Record<string, any>;
}

class ThreeDayValidatorService {
  /**
   * PRIMARY DEFENSE: Check if user has already used 3-day plan
   */
  async canPurchaseThreeDayPlan(userId: string): Promise<ThreeDayValidationResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        hasUsedThreeDayPlan: true,
        threeDayPlanUsedAt: true
      }
    });

    if (!user) {
      return {
        allowed: false,
        reason: 'User not found'
      };
    }

    if (user.hasUsedThreeDayPlan) {
      return {
        allowed: false,
        reason: '3-day plan is a one-time introductory offer. Please select monthly plan.',
        usedAt: user.threeDayPlanUsedAt || undefined
      };
    }

    return { allowed: true };
  }

  /**
   * SECONDARY DEFENSE: Detect multi-account abuse via payment method
   */
  async detectMultiAccountAbuse(
    email: string,
    paymentMethodId: string
  ): Promise<AbuseCheckResult> {
    const hash = this.createPaymentMethodHash(email, paymentMethodId);

    const existingPurchase = await prisma.payment.findFirst({
      where: {
        planType: 'THREE_DAY',
        paymentMethodHash: hash,
        status: 'COMPLETED'
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (existingPurchase && existingPurchase.user.email !== email) {
      return {
        isAbuse: true,
        pattern: 'SAME_PAYMENT_METHOD_DIFFERENT_EMAIL',
        metadata: {
          previousEmail: existingPurchase.user.email,
          previousPurchaseDate: existingPurchase.completedAt
        }
      };
    }

    return { isAbuse: false };
  }

  /**
   * TERTIARY DEFENSE: Detect suspicious patterns
   */
  async detectSuspiciousPatterns(
    userId: string,
    purchaseIP: string,
    deviceFingerprint?: string
  ): Promise<AbuseCheckResult[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        email: true
      }
    });

    if (!user) {
      return [];
    }

    const patterns: AbuseCheckResult[] = [];

    // Pattern 1: Account created very recently (< 1 hour)
    const accountAge = Date.now() - user.createdAt.getTime();
    const accountAgeHours = accountAge / (1000 * 60 * 60);

    if (accountAgeHours < 1) {
      patterns.push({
        isAbuse: true,
        pattern: 'FRESH_ACCOUNT_PURCHASE',
        metadata: {
          accountAgeMinutes: Math.floor(accountAge / (1000 * 60)),
          email: user.email
        }
      });
    }

    // Pattern 2: Multiple 3-day purchases from same IP within 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPurchasesFromIP = await prisma.payment.count({
      where: {
        planType: 'THREE_DAY',
        purchaseIP: purchaseIP,
        status: 'COMPLETED',
        completedAt: {
          gte: thirtyDaysAgo
        },
        userId: {
          not: userId
        }
      }
    });

    if (recentPurchasesFromIP >= 2) {
      patterns.push({
        isAbuse: true,
        pattern: 'MULTIPLE_ACCOUNTS_SAME_IP',
        metadata: {
          ip: purchaseIP,
          count: recentPurchasesFromIP + 1,
          window: '30 days'
        }
      });
    }

    // Pattern 3: Same device fingerprint (if provided)
    if (deviceFingerprint) {
      const sameDevicePurchases = await prisma.payment.count({
        where: {
          planType: 'THREE_DAY',
          deviceFingerprint: deviceFingerprint,
          status: 'COMPLETED',
          completedAt: {
            gte: thirtyDaysAgo
          },
          userId: {
            not: userId
          }
        }
      });

      if (sameDevicePurchases >= 2) {
        patterns.push({
          isAbuse: true,
          pattern: 'MULTIPLE_ACCOUNTS_SAME_DEVICE',
          metadata: {
            deviceFingerprint,
            count: sameDevicePurchases + 1,
            window: '30 days'
          }
        });
      }
    }

    return patterns;
  }

  /**
   * Log fraud alert for manual review
   */
  async logFraudAlert(
    userId: string,
    pattern: string,
    metadata: Record<string, any>,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
  ): Promise<void> {
    await prisma.fraudAlert.create({
      data: {
        userId,
        pattern,
        metadata,
        severity,
        status: 'PENDING_REVIEW'
      }
    });

    // Send email notification for HIGH severity
    if (severity === 'HIGH') {
      await this.notifyAdminOfFraud(userId, pattern, metadata);
    }
  }

  /**
   * Mark user as having used 3-day plan
   */
  async markThreeDayPlanUsed(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasUsedThreeDayPlan: true,
        threeDayPlanUsedAt: new Date()
      }
    });
  }

  /**
   * Create hash for payment method tracking
   */
  createPaymentMethodHash(email: string, paymentMethodId: string): string {
    return createHash('sha256')
      .update(`${email}:${paymentMethodId}`)
      .digest('hex');
  }

  /**
   * Get account age at time of purchase
   */
  async getAccountAge(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true }
    });

    if (!user) return 0;

    const ageMs = Date.now() - user.createdAt.getTime();
    return Math.floor(ageMs / (1000 * 60 * 60)); // Convert to hours
  }

  /**
   * Send admin notification for high-severity fraud
   */
  private async notifyAdminOfFraud(
    userId: string,
    pattern: string,
    metadata: Record<string, any>
  ): Promise<void> {
    // TODO: Implement email notification to admin
    console.error('HIGH SEVERITY FRAUD ALERT:', {
      userId,
      pattern,
      metadata,
      timestamp: new Date().toISOString()
    });
  }
}

export const threeDayValidator = new ThreeDayValidatorService();
```

---

### 5. API Routes

#### 5.1 Get Payment Methods

**File:** `app/api/payments/dlocal/methods/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { paymentMethodsService } from '@/lib/dlocal/payment-methods.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');

    if (!country) {
      return NextResponse.json(
        { error: 'Country parameter is required' },
        { status: 400 }
      );
    }

    const methods = await paymentMethodsService.getMethodsForCountry(country);

    return NextResponse.json(methods);

  } catch (error) {
    console.error('Failed to fetch payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}
```

#### 5.2 Get Exchange Rate

**File:** `app/api/payments/dlocal/exchange-rate/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { currencyConverter } from '@/lib/dlocal/currency-converter.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const to = searchParams.get('to');

    if (!to) {
      return NextResponse.json(
        { error: 'Currency parameter is required' },
        { status: 400 }
      );
    }

    const rate = await currencyConverter.getExchangeRate('USD', to);

    return NextResponse.json({
      from: 'USD',
      to: to,
      rate: rate,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rate' },
      { status: 500 }
    );
  }
}
```

#### 5.3 Convert Currency

**File:** `app/api/payments/dlocal/convert/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { currencyConverter } from '@/lib/dlocal/currency-converter.service';
import { DLocalCurrency } from '@/types/dlocal';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const amount = parseFloat(searchParams.get('amount') || '0');
    const currency = searchParams.get('currency') as DLocalCurrency;

    if (!amount || !currency) {
      return NextResponse.json(
        { error: 'Amount and currency parameters are required' },
        { status: 400 }
      );
    }

    const conversion = await currencyConverter.convertUSDToLocal(amount, currency);

    return NextResponse.json(conversion);

  } catch (error) {
    console.error('Currency conversion failed:', error);
    return NextResponse.json(
      { error: 'Currency conversion failed' },
      { status: 500 }
    );
  }
}
```

#### 5.4 Create dLocal Payment

**File:** `app/api/payments/dlocal/create/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import { dlocalPaymentService } from '@/lib/dlocal/dlocal-payment.service';
import { canApplyDiscountCode } from '@/lib/dlocal/constants';
import { z } from 'zod';

const createPaymentSchema = z.object({
  planType: z.enum(['THREE_DAY', 'MONTHLY']),
  paymentMethodId: z.string(),
  country: z.enum(['IN', 'NG', 'PK', 'VN', 'ID', 'TH', 'ZA', 'TR']),
  currency: z.enum(['INR', 'NGN', 'PKR', 'VND', 'IDR', 'THB', 'ZAR', 'TRY']),
  amount: z.number().positive(),
  amountUSD: z.number().positive(),
  discountCode: z.string().optional(),
  payer: z.object({
    name: z.string(),
    email: z.string().email(),
    document: z.string().optional(),
    phone: z.string().optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const validated = createPaymentSchema.parse(body);

    // 3. Check if user already has active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 409 }
      );
    }

    // 4. Validate discount code
    if (validated.discountCode) {
      if (!canApplyDiscountCode(validated.planType, 'DLOCAL')) {
        return NextResponse.json(
          { error: 'Discount codes are not available for 3-day plans' },
          { status: 400 }
        );
      }

      // Validate discount code (implement this function)
      const discountValidation = await validateDiscountCode(validated.discountCode);
      if (!discountValidation.valid) {
        return NextResponse.json(
          { error: discountValidation.reason },
          { status: 400 }
        );
      }
    }

    // 5. Create payment in dLocal
    const orderId = `SUB-${session.user.id}-${Date.now()}`;
    const paymentRequest = {
      amount: validated.amount,
      currency: validated.currency,
      country: validated.country,
      payment_method_id: validated.paymentMethodId,
      payer: validated.payer,
      order_id: orderId,
      description: `Trading Alerts PRO - ${validated.planType}`,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/dlocal`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`
    };

    const dlocalPayment = await dlocalPaymentService.createPayment(paymentRequest);

    // 6. Create Payment record in database
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        provider: 'DLOCAL',
        providerPaymentId: dlocalPayment.id,
        providerStatus: dlocalPayment.status,
        amount: validated.amount,
        amountUSD: validated.amountUSD,
        currency: validated.currency,
        country: validated.country,
        paymentMethod: validated.paymentMethodId,
        planType: validated.planType,
        duration: validated.planType === 'THREE_DAY' ? 3 : 30,
        discountCode: validated.discountCode,
        status: 'PENDING',
        metadata: {
          orderId,
          dlocalPaymentId: dlocalPayment.id
        }
      }
    });

    // 7. Return payment response
    return NextResponse.json({
      id: dlocalPayment.id,
      status: dlocalPayment.status,
      amount: dlocalPayment.amount,
      currency: dlocalPayment.currency,
      redirectUrl: dlocalPayment.redirect_url,
      paymentMethodFlow: dlocalPayment.payment_method_flow
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('dLocal payment creation failed:', error);
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    );
  }
}
```

#### 5.5 dLocal Webhook

**File:** `app/api/webhooks/dlocal/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { dlocalPaymentService } from '@/lib/dlocal/dlocal-payment.service';
import { addDays } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook signature
    const signature = request.headers.get('x-signature');
    const body = await request.json();

    if (!dlocalPaymentService.verifyWebhookSignature(body, signature)) {
      console.error('Invalid dLocal webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 2. Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        providerPaymentId: body.id,
        provider: 'DLOCAL'
      },
      include: { user: true }
    });

    if (!payment) {
      console.error('Payment not found:', body.id);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // 3. Process based on status
    if (body.status === 'PAID') {
      await handlePaymentSuccess(payment, body);
    } else if (body.status === 'REJECTED') {
      await handlePaymentFailure(payment, body);
    } else if (body.status === 'CANCELLED') {
      await handlePaymentCancellation(payment);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(payment: any, webhookData: any) {
  const expiryDate = addDays(new Date(), payment.duration);

  await prisma.$transaction([
    // Update payment record
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        providerStatus: 'PAID'
      }
    }),

    // Create or update subscription
    prisma.subscription.upsert({
      where: { userId: payment.userId },
      create: {
        userId: payment.userId,
        paymentProvider: 'DLOCAL',
        dlocalPaymentId: payment.providerPaymentId,
        dlocalPaymentMethod: payment.paymentMethod,
        dlocalCountry: payment.country,
        dlocalCurrency: payment.currency,
        status: 'ACTIVE',
        tier: 'PRO',
        planType: payment.planType,
        currentPeriodStart: new Date(),
        currentPeriodEnd: expiryDate,
        expiresAt: expiryDate,
        amount: payment.amount,
        amountUSD: payment.amountUSD,
        currency: payment.currency,
        discountCode: payment.discountCode
      },
      update: {
        paymentProvider: 'DLOCAL',
        dlocalPaymentId: payment.providerPaymentId,
        status: 'ACTIVE',
        tier: 'PRO',
        currentPeriodStart: new Date(),
        currentPeriodEnd: expiryDate,
        expiresAt: expiryDate,
        renewalReminderSent: false
      }
    }),

    // Upgrade user tier
    prisma.user.update({
      where: { id: payment.userId },
      data: { tier: 'PRO' }
    })
  ]);

  // Send confirmation email
  await sendPaymentConfirmationEmail(payment.user, payment);
}

async function handlePaymentFailure(payment: any, webhookData: any) {
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'FAILED',
      failedAt: new Date(),
      failureReason: webhookData.failure_reason,
      providerStatus: 'REJECTED'
    }
  });

  // Send failure email
  await sendPaymentFailureEmail(payment.user, payment);
}

async function handlePaymentCancellation(payment: any) {
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'CANCELLED',
      providerStatus: 'CANCELLED'
    }
  });
}
```

---

### 6. Cron Jobs (Renewal & Expiry)

#### 6.1 Check Expiring Subscriptions

**File:** `lib/cron/check-expiring-subscriptions.ts` (NEW)

```typescript
import { prisma } from '@/lib/db/prisma';
import { addDays } from 'date-fns';
import { sendRenewalReminderEmail } from '@/lib/emails/send-renewal-reminder';

export async function checkExpiringSubscriptions() {
  // Find subscriptions expiring in 3 days
  const expiringIn3Days = await prisma.subscription.findMany({
    where: {
      paymentProvider: 'DLOCAL',
      status: 'ACTIVE',
      expiresAt: {
        gte: new Date(),
        lte: addDays(new Date(), 3)
      },
      renewalReminderSent: false
    },
    include: { user: true }
  });

  for (const subscription of expiringIn3Days) {
    // Send renewal reminder email
    await sendRenewalReminderEmail({
      to: subscription.user.email,
      name: subscription.user.name,
      expiryDate: subscription.expiresAt!,
      planType: subscription.planType,
      renewalLink: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?renew=${subscription.id}`
    });

    // Mark reminder sent
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { renewalReminderSent: true }
    });

    console.log(`Sent renewal reminder to user ${subscription.userId}`);
  }

  return { notificationsSent: expiringIn3Days.length };
}
```

#### 6.2 Downgrade Expired Subscriptions

**File:** `lib/cron/downgrade-expired-subscriptions.ts` (NEW)

```typescript
import { prisma } from '@/lib/db/prisma';
import { sendSubscriptionExpiredEmail } from '@/lib/emails/send-expired-notification';

export async function downgradeExpiredSubscriptions() {
  // Find expired subscriptions
  const expired = await prisma.subscription.findMany({
    where: {
      paymentProvider: 'DLOCAL',
      status: 'ACTIVE',
      expiresAt: {
        lte: new Date()
      }
    },
    include: { user: true }
  });

  for (const subscription of expired) {
    // Downgrade user to FREE tier
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'EXPIRED',
          tier: 'FREE'
        }
      }),
      prisma.user.update({
        where: { id: subscription.userId },
        data: { tier: 'FREE' }
      })
    ]);

    // Send expiry notification
    await sendSubscriptionExpiredEmail({
      to: subscription.user.email,
      name: subscription.user.name,
      renewalLink: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`
    });

    console.log(`Downgraded user ${subscription.userId} to FREE tier`);
  }

  return { usersDowngraded: expired.length };
}
```

#### 6.3 Cron API Routes

**File:** `app/api/cron/check-expiring-subscriptions/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { checkExpiringSubscriptions } from '@/lib/cron/check-expiring-subscriptions';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await checkExpiringSubscriptions();

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/cron/downgrade-expired-subscriptions/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { downgradeExpiredSubscriptions } from '@/lib/cron/downgrade-expired-subscriptions';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await downgradeExpiredSubscriptions();

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
```

#### 6.4 Vercel Cron Configuration

**File:** `vercel.json` (UPDATE EXISTING)

```json
{
  "crons": [
    {
      "path": "/api/cron/check-expiring-subscriptions",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/downgrade-expired-subscriptions",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

### 7. Frontend Components

#### 7.1 Unified Checkout Page

**File:** `app/checkout/page.tsx` (UPDATE EXISTING OR CREATE NEW)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { CountrySelector } from '@/components/payments/CountrySelector';
import { PlanSelector } from '@/components/payments/PlanSelector';
import { PaymentMethodSelector } from '@/components/payments/PaymentMethodSelector';
import { DiscountCodeInput } from '@/components/payments/DiscountCodeInput';
import { PriceDisplay } from '@/components/payments/PriceDisplay';
import { PaymentButton } from '@/components/payments/PaymentButton';
import { detectUserCountry } from '@/lib/geo/detect-country';
import { canApplyDiscountCode } from '@/lib/dlocal/constants';
import type { PaymentMethod, PlanType, PaymentProvider } from '@/types/dlocal';

export default function CheckoutPage() {
  const [country, setCountry] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('USD');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('MONTHLY');
  const [loading, setLoading] = useState(true);

  // Detect country on mount
  useEffect(() => {
    async function initialize() {
      const detectedCountry = await detectUserCountry();
      setCountry(detectedCountry);

      if (detectedCountry) {
        const countryInfo = DLOCAL_SUPPORTED_COUNTRIES[detectedCountry];
        if (countryInfo) {
          setCurrency(countryInfo.currency);
        }
      }
    }

    initialize();
  }, []);

  // Load payment methods when country changes
  useEffect(() => {
    async function loadPaymentMethods() {
      if (!country) return;

      setLoading(true);
      const response = await fetch(`/api/payments/dlocal/methods?country=${country}`);
      const methods = await response.json();
      setPaymentMethods(methods);

      // Auto-select recommended method
      const recommended = methods.find((m: PaymentMethod) => m.recommended);
      if (recommended) {
        setSelectedProvider(recommended.provider);
        setSelectedMethod(recommended.id);
      }

      setLoading(false);
    }

    loadPaymentMethods();
  }, [country]);

  const handlePayment = async () => {
    if (selectedProvider === 'stripe') {
      // Redirect to Stripe checkout
      window.location.href = '/api/payments/stripe/checkout';
    } else if (selectedProvider === 'dlocal') {
      // Create dLocal payment
      const response = await fetch('/api/payments/dlocal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPlan,
          paymentMethodId: selectedMethod,
          country,
          currency,
          // ... other fields
        })
      });

      const payment = await response.json();
      if (payment.redirectUrl) {
        window.location.href = payment.redirectUrl;
      }
    }
  };

  return (
    <div className="checkout-page">
      <h1>Subscribe to PRO Plan</h1>

      {/* Country Selection */}
      <CountrySelector
        selectedCountry={country}
        onCountryChange={setCountry}
      />

      {/* Plan Selection - Show 3-day only for dLocal */}
      <PlanSelector
        provider={selectedProvider}
        selectedPlan={selectedPlan}
        onChange={setSelectedPlan}
      />

      {/* Price Display */}
      {country && (
        <PriceDisplay
          planType={selectedPlan}
          country={country}
          currency={currency}
        />
      )}

      {/* Payment Methods */}
      {loading ? (
        <PaymentMethodsSkeleton />
      ) : (
        <PaymentMethodSelector
          methods={paymentMethods}
          selectedProvider={selectedProvider}
          selectedMethod={selectedMethod}
          onSelect={(provider, methodId) => {
            setSelectedProvider(provider);
            setSelectedMethod(methodId);
          }}
        />
      )}

      {/* Discount Code Input - Hide for 3-day plan */}
      {canApplyDiscountCode(selectedPlan, selectedProvider || 'STRIPE') && (
        <DiscountCodeInput planType={selectedPlan} />
      )}

      {/* Payment Button */}
      <PaymentButton
        provider={selectedProvider}
        methodId={selectedMethod}
        onClick={handlePayment}
      />
    </div>
  );
}
```

---

### 8. Environment Variables

**File:** `.env.example` (UPDATE)

```bash
# Existing Stripe variables...

# dLocal API Configuration
DLOCAL_API_URL=https://api.dlocal.com
DLOCAL_API_LOGIN=your_dlocal_login
DLOCAL_API_KEY=your_dlocal_api_key
DLOCAL_API_SECRET=your_dlocal_secret_key
DLOCAL_WEBHOOK_SECRET=your_webhook_secret

# dLocal Pricing (USD)
DLOCAL_3DAY_PRICE_USD=1.99
DLOCAL_MONTHLY_PRICE_USD=29.00

# Feature Flags
ENABLE_DLOCAL_PAYMENTS=true
ENABLE_3DAY_PLAN=true

# Cron Job Secret
CRON_SECRET=your_cron_secret_here
```

---

## File Structure Summary

```
trading-alerts-saas/
├── prisma/
│   └── schema.prisma (UPDATED - add dLocal fields)
├── types/
│   └── dlocal.ts (NEW)
├── lib/
│   ├── dlocal/
│   │   ├── constants.ts (NEW)
│   │   ├── currency-converter.service.ts (NEW)
│   │   ├── payment-methods.service.ts (NEW)
│   │   └── dlocal-payment.service.ts (NEW)
│   ├── cron/
│   │   ├── check-expiring-subscriptions.ts (NEW)
│   │   └── downgrade-expired-subscriptions.ts (NEW)
│   └── geo/
│       └── detect-country.ts (NEW)
├── app/
│   ├── api/
│   │   ├── payments/
│   │   │   └── dlocal/
│   │   │       ├── methods/route.ts (NEW)
│   │   │       ├── exchange-rate/route.ts (NEW)
│   │   │       ├── convert/route.ts (NEW)
│   │   │       ├── create/route.ts (NEW)
│   │   │       ├── validate-discount/route.ts (NEW)
│   │   │       └── [paymentId]/route.ts (NEW)
│   │   ├── webhooks/
│   │   │   └── dlocal/route.ts (NEW)
│   │   └── cron/
│   │       ├── check-expiring-subscriptions/route.ts (NEW)
│   │       └── downgrade-expired-subscriptions/route.ts (NEW)
│   └── checkout/
│       └── page.tsx (UPDATED)
├── components/
│   └── payments/
│       ├── CountrySelector.tsx (NEW)
│       ├── PlanSelector.tsx (NEW)
│       ├── PaymentMethodSelector.tsx (NEW)
│       ├── PriceDisplay.tsx (NEW)
│       ├── DiscountCodeInput.tsx (NEW)
│       └── PaymentButton.tsx (NEW)
├── docs/
│   ├── policies/
│   │   └── 07-dlocal-integration-rules.md (NEW)
│   └── dlocal-openapi-endpoints.yaml (NEW)
└── vercel.json (UPDATED - add cron jobs)
```

---

## Implementation Order (Recommended)

### Week 1: Database & Backend Services

1. ✅ Update Prisma schema
2. ✅ Create database migration
3. ✅ Create type definitions
4. ✅ Create constants file
5. ✅ Create currency converter service
6. ✅ Create payment methods service
7. ✅ Create dLocal payment service

### Week 2: API Routes

1. ✅ Create payment methods API route
2. ✅ Create exchange rate API route
3. ✅ Create convert currency API route
4. ✅ Create create payment API route
5. ✅ Create dLocal webhook route
6. ✅ Create validate discount API route

### Week 3: Cron Jobs & Email Notifications

1. ✅ Create expiring subscriptions checker
2. ✅ Create expired subscriptions downgrader
3. ✅ Create cron API routes
4. ✅ Update vercel.json with cron schedules
5. ✅ Create email templates
6. ✅ Implement email sending logic

### Week 4: Frontend Components & Testing

1. ✅ Create country detection utility
2. ✅ Create CountrySelector component
3. ✅ Create PlanSelector component
4. ✅ Create PaymentMethodSelector component
5. ✅ Create PriceDisplay component
6. ✅ Create DiscountCodeInput component
7. ✅ Update checkout page
8. ✅ Test complete payment flow
9. ✅ Test webhook handling
10. ✅ Test cron jobs

---

## Testing Checklist

### Unit Tests

- [ ] Currency conversion (USD to local currencies)
- [ ] Discount code validation
- [ ] Payment methods fetching
- [ ] Webhook signature verification
- [ ] Expiry date calculations

### Integration Tests

- [ ] Complete payment flow (mock dLocal API)
- [ ] Webhook handling
- [ ] Subscription creation
- [ ] User tier upgrade
- [ ] Cron job execution

### End-to-End Tests

- [ ] User selects India → Sees UPI, Paytm
- [ ] User selects 3-day plan → Discount input hidden
- [ ] User selects monthly plan → Discount input shown
- [ ] User completes payment → Upgraded to PRO
- [ ] Subscription expires → User downgraded to FREE
- [ ] Renewal reminder sent 3 days before expiry

---

## Aider Commands for Building Part 18

```bash
# Start Aider with Part 18 requirements
py -3.11 -m aider --model anthropic/MiniMax-M2

# Command 1: Database Schema
> Build database schema updates from docs/implementation-guides/v5_part_r.md.
> Update prisma/schema.prisma with dLocal fields.
> Create migration.

# Command 2: Type Definitions & Constants
> Create types/dlocal.ts with all TypeScript types.
> Create lib/dlocal/constants.ts with country/currency mappings.

# Command 3: Services
> Create lib/dlocal/currency-converter.service.ts
> Create lib/dlocal/payment-methods.service.ts
> Create lib/dlocal/dlocal-payment.service.ts

# Command 4: API Routes
> Create all API routes in app/api/payments/dlocal/
> Create webhook route in app/api/webhooks/dlocal/

# Command 5: Cron Jobs
> Create cron job functions in lib/cron/
> Create cron API routes in app/api/cron/
> Update vercel.json with cron schedules

# Command 6: Frontend Components
> Create all payment components in components/payments/
> Update app/checkout/page.tsx for unified checkout

# After each file, Claude Code will validate automatically
# Fix any issues before moving to next file
```

---

## Success Criteria

### Functional Requirements

- ✅ Single checkout page shows both Stripe and dLocal options
- ✅ Country detection works with manual override
- ✅ Payment methods load dynamically for each country
- ✅ Prices display in local currency with USD equivalent
- ✅ 3-day plan exclusive to dLocal
- ✅ Discount codes work on monthly plans only (not 3-day)
- ✅ Payment processing works for all 8 countries
- ✅ Webhooks handle payment success/failure correctly
- ✅ Renewal reminders sent 3 days before expiry
- ✅ Expired subscriptions downgraded to FREE automatically

### Non-Functional Requirements

- ✅ Page loads in < 3 seconds
- ✅ Payment method selection updates UI instantly
- ✅ Mobile responsive on all screen sizes
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Error messages clear and actionable
- ✅ Graceful fallbacks when dLocal API fails
- ✅ Webhook signatures verified before processing
- ✅ All secrets server-side only

---

**Total Estimated Time:** 120 hours (4 weeks × 30 hours/week)

**Part 18 File Count:** ~45 files (types, services, API routes, components, cron jobs, emails)

**Dependencies:** Parts 1-17 complete (especially Part 12: E-commerce & Billing)

---

**NOTE:** This implementation maintains full compatibility with existing Stripe infrastructure while adding dLocal as an alternative payment provider for emerging markets.
