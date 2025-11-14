# Affiliate Marketing Program - Design Specification

**Project:** Trading Alerts SaaS V7
**Feature:** Affiliate Marketing Program Integration
**Created:** 2025-11-14
**Status:** Design Phase
**Current Milestone:** 1.6 (Phase 1: Documentation & Policies)

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Business Requirements](#business-requirements)
3. [System Architecture](#system-architecture)
4. [Database Schema Changes](#database-schema-changes)
5. [API Endpoints](#api-endpoints)
6. [User Flows](#user-flows)
7. [Admin Workflows](#admin-workflows)
8. [Commission Calculation Logic](#commission-calculation-logic)
9. [Security Considerations](#security-considerations)
10. [Integration Points](#integration-points)
11. [Implementation Phases](#implementation-phases)
12. [Testing Strategy](#testing-strategy)

---

## 1. EXECUTIVE SUMMARY

### Overview
Integrate a comprehensive affiliate marketing program that allows:
- Admin to generate and manage discount codes
- Affiliates to promote the PRO tier with custom discounts
- Automated commission tracking and reporting
- Manual monthly commission payouts

### Key Metrics
- **Discount Range:** 0-50% off PRO tier ($29/month regular price)
- **Commission Range:** 0-50% of discounted payment
- **Payment Cycle:** Monthly (1st week of each month)
- **Code Validity:** Configurable expiry date per code

### Success Criteria
- ✅ Admin can create/manage unlimited discount codes
- ✅ Free tier users can apply codes during checkout
- ✅ Commission automatically tracked on successful payment
- ✅ Monthly commission reports for admin and affiliates
- ✅ Zero fraudulent code usage

---

## 2. BUSINESS REQUIREMENTS

### 2.1 Discount Code System

**Code Generation:**
- System generates unique alphanumeric codes (e.g., `TRADE2024ABC`)
- Format: `PREFIX` + `RANDOM8CHARS` (configurable)
- Uniqueness enforced at database level

**Code Configuration (by Admin):**
```
- Code: "SAVE20PRO"
- Discount Percentage: 20%
- Commission Percentage: 30%
- Expiry Date: 2025-12-31
- Affiliate Owner: affiliate@example.com
- Status: Active | Disabled
- Max Uses: Unlimited | Limited (future feature)
```

### 2.2 Commission Calculation

**Formula:**
```
Commission (USD) = (Regular Price × (100% - Discount%)) × Commission%
```

**Examples:**

| Regular Price | Discount % | Discounted Price | Commission % | Affiliate Earns |
|---------------|------------|------------------|--------------|-----------------|
| $29.00        | 20%        | $23.20          | 30%          | $6.96           |
| $29.00        | 50%        | $14.50          | 40%          | $5.80           |
| $29.00        | 10%        | $26.10          | 25%          | $6.53           |

### 2.3 Payment Lifecycle

```
User Applies Code → Checkout with Discount → Payment Success
    ↓
Commission Record Created (Status: PENDING)
    ↓
Commission Accumulated (Monthly)
    ↓
Admin Reviews Report (First Week of Month)
    ↓
Admin Marks as PAID (Manual External Payment)
    ↓
Affiliate Notified (Email)
```

### 2.4 User Restrictions

**Who Can Use Codes:**
- ✅ FREE tier users upgrading to PRO
- ❌ Existing PRO users (no renewal discounts for MVP)
- ❌ Users who previously had PRO subscription

**Code Validation:**
- Code must exist and be active
- Code must not be expired
- User must be FREE tier
- User must not have active PRO subscription

---

## 3. SYSTEM ARCHITECTURE

### 3.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN PANEL                              │
│  /admin/affiliates                                              │
│  - Create discount codes                                         │
│  - Set % discount, % commission, expiry                          │
│  - Enable/disable codes                                          │
│  - View commission reports                                       │
│  - Mark commissions as paid                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AFFILIATE DASHBOARD                           │
│  /affiliate/dashboard (Optional - Future Phase)                 │
│  - View my discount codes                                        │
│  - Track usage statistics                                        │
│  - View commission earnings (PENDING, PAID)                      │
│  - Download monthly reports                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CHECKOUT FLOW                                 │
│  /checkout?code=SAVE20PRO                                       │
│  1. User (FREE tier) clicks "Upgrade to PRO"                    │
│  2. Input field: "Have a discount code?"                         │
│  3. Enter code → Validate via API                               │
│  4. Show discounted price: $29.00 → $23.20                      │
│  5. Stripe checkout with custom price                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT PROCESSING                            │
│  1. Stripe Payment Success Webhook                              │
│  2. Create Subscription record (tier: PRO)                       │
│  3. Create Commission record if code used                        │
│  4. Send email to affiliate (code used successfully)             │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONTHLY PAYOUT PROCESS                        │
│  1. First week of month: Admin views report                     │
│  2. Filter: PENDING commissions for last month                   │
│  3. Admin makes external payments (bank transfer/PayPal)         │
│  4. Admin marks commissions as PAID in dashboard                 │
│  5. System sends payment confirmation emails to affiliates       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Breakdown

**New Components:**
1. **Admin Affiliate Manager** (`app/admin/affiliates/`)
   - Code creation interface
   - Commission reports
   - Payment management

2. **Discount Code Validator** (`lib/affiliate/validator.ts`)
   - Code validation logic
   - Eligibility checks
   - Price calculation

3. **Commission Tracker** (`lib/affiliate/commission.ts`)
   - Create commission records
   - Calculate amounts
   - Generate reports

4. **Checkout Integration** (Update existing `app/checkout/`)
   - Code input field
   - Real-time validation
   - Price preview

5. **Webhook Handler** (Update existing `/api/webhooks/stripe/route.ts`)
   - Detect discount code in metadata
   - Create commission on payment success

---

## 4. DATABASE SCHEMA CHANGES

### 4.1 New Tables

**Table: `AffiliateCode`**
```prisma
model AffiliateCode {
  id                String   @id @default(cuid())
  code              String   @unique        // "SAVE20PRO"
  discountPercent   Int                     // 20 (represents 20%)
  commissionPercent Int                     // 30 (represents 30%)
  affiliateEmail    String                  // Owner of this code
  expiresAt         DateTime?               // Null = never expires
  isActive          Boolean  @default(true) // Admin can disable
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String                  // Admin user ID

  // Relations
  creator           User     @relation("CodeCreator", fields: [createdBy], references: [id])
  commissions       Commission[]

  @@index([code])
  @@index([isActive])
  @@index([expiresAt])
}

model Commission {
  id                  String   @id @default(cuid())
  codeId              String                    // Which code was used
  userId              String                    // User who upgraded
  subscriptionId      String   @unique          // Stripe subscription ID

  regularPrice        Decimal  @db.Decimal(10, 2) // 29.00
  discountPercent     Int                         // 20
  discountedPrice     Decimal  @db.Decimal(10, 2) // 23.20
  commissionPercent   Int                         // 30
  commissionAmount    Decimal  @db.Decimal(10, 2) // 6.96

  status              CommissionStatus @default(PENDING)
  paidAt              DateTime?
  paidBy              String?                     // Admin who marked as paid

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  code                AffiliateCode @relation(fields: [codeId], references: [id])
  user                User          @relation(fields: [userId], references: [id])
  paidByUser          User?         @relation("CommissionPaidBy", fields: [paidBy], references: [id])

  @@index([codeId])
  @@index([status])
  @@index([createdAt])
}

enum CommissionStatus {
  PENDING    // Not yet paid
  PAID       // Paid by admin
  CANCELLED  // Subscription refunded/cancelled
}
```

### 4.2 Existing Table Updates

**Table: `User`** (Add relations)
```prisma
model User {
  // ... existing fields ...

  // New relations
  createdCodes   AffiliateCode[] @relation("CodeCreator")
  commissions    Commission[]
  paidCommissions Commission[]   @relation("CommissionPaidBy")
}
```

**Table: `Subscription`** (Add discount tracking)
```prisma
model Subscription {
  // ... existing fields ...

  // New fields
  discountCodeId  String?        // Which code was used (if any)
  originalPrice   Decimal?       // 29.00 (for reference)
  discountedPrice Decimal?       // 23.20 (actual charged amount)
}
```

### 4.3 Migration Strategy

**Phase 1 Migration:**
```sql
-- Add new tables
CREATE TABLE "AffiliateCode" (...);
CREATE TABLE "Commission" (...);

-- Add indexes
CREATE INDEX "AffiliateCode_code_idx" ON "AffiliateCode"("code");
CREATE INDEX "Commission_status_idx" ON "Commission"("status");

-- Update existing tables
ALTER TABLE "Subscription" ADD COLUMN "discountCodeId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "originalPrice" DECIMAL(10,2);
ALTER TABLE "Subscription" ADD COLUMN "discountedPrice" DECIMAL(10,2);
```

---

## 5. API ENDPOINTS

### 5.1 Admin Endpoints

**POST /api/admin/affiliate/codes** - Create Discount Code
```typescript
Request:
{
  "code": "SAVE20PRO",           // Admin-provided or auto-generated
  "discountPercent": 20,         // 0-50
  "commissionPercent": 30,       // 0-50
  "affiliateEmail": "affiliate@example.com",
  "expiresAt": "2025-12-31T23:59:59Z"
}

Response (201):
{
  "id": "clx...",
  "code": "SAVE20PRO",
  "discountPercent": 20,
  "commissionPercent": 30,
  "affiliateEmail": "affiliate@example.com",
  "expiresAt": "2025-12-31T23:59:59Z",
  "isActive": true,
  "createdAt": "2025-11-14T10:00:00Z"
}
```

**GET /api/admin/affiliate/codes** - List All Codes
```typescript
Query Params:
- status: "active" | "disabled" | "all"
- page: 1
- limit: 50

Response (200):
{
  "codes": [
    {
      "id": "clx...",
      "code": "SAVE20PRO",
      "discountPercent": 20,
      "commissionPercent": 30,
      "affiliateEmail": "affiliate@example.com",
      "expiresAt": "2025-12-31T23:59:59Z",
      "isActive": true,
      "usageCount": 5,              // Calculated from Commission table
      "totalCommissions": 34.80     // Sum of commission amounts
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 1
}
```

**PATCH /api/admin/affiliate/codes/:id** - Update Code
```typescript
Request:
{
  "isActive": false  // Disable code
}

Response (200):
{
  "id": "clx...",
  "code": "SAVE20PRO",
  "isActive": false,  // Updated
  "updatedAt": "2025-11-14T11:00:00Z"
}
```

**GET /api/admin/affiliate/commissions** - Commission Report
```typescript
Query Params:
- status: "PENDING" | "PAID" | "CANCELLED" | "all"
- month: "2025-11"  // Filter by month
- affiliateEmail: "affiliate@example.com"
- page: 1
- limit: 100

Response (200):
{
  "commissions": [
    {
      "id": "clx...",
      "code": "SAVE20PRO",
      "affiliateEmail": "affiliate@example.com",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "regularPrice": 29.00,
      "discountedPrice": 23.20,
      "commissionAmount": 6.96,
      "status": "PENDING",
      "createdAt": "2025-11-14T10:00:00Z"
    }
  ],
  "summary": {
    "totalCommissions": 139.20,
    "pendingAmount": 69.60,
    "paidAmount": 69.60,
    "count": 20
  }
}
```

**POST /api/admin/affiliate/commissions/bulk-pay** - Mark as Paid
```typescript
Request:
{
  "commissionIds": ["clx1...", "clx2...", "clx3..."],
  "note": "Paid via PayPal on 2025-12-05"
}

Response (200):
{
  "updated": 3,
  "totalAmount": 20.88,
  "paidAt": "2025-12-05T10:00:00Z"
}
```

### 5.2 Public Endpoints

**POST /api/affiliate/validate-code** - Validate Discount Code
```typescript
Request:
{
  "code": "SAVE20PRO"
}

Response (200) - Valid:
{
  "valid": true,
  "code": "SAVE20PRO",
  "discountPercent": 20,
  "originalPrice": 29.00,
  "discountedPrice": 23.20,
  "savings": 5.80,
  "expiresAt": "2025-12-31T23:59:59Z"
}

Response (400) - Invalid:
{
  "valid": false,
  "error": "Code expired",
  "message": "This discount code expired on 2025-10-31"
}
```

**GET /api/affiliate/my-commissions** - Affiliate's Earnings (Future)
```typescript
// Optional: Allow affiliates to log in and view their earnings
Headers:
  Authorization: Bearer <affiliate_token>

Response (200):
{
  "codes": [
    {
      "code": "SAVE20PRO",
      "usageCount": 5,
      "pendingCommissions": 34.80,
      "paidCommissions": 69.60,
      "totalEarnings": 104.40
    }
  ],
  "summary": {
    "totalPending": 34.80,
    "totalPaid": 69.60,
    "allTimeEarnings": 104.40
  }
}
```

### 5.3 Modified Endpoints

**POST /api/checkout/create-session** - Update for Discount Codes
```typescript
Request:
{
  "priceId": "price_...",
  "discountCode": "SAVE20PRO"  // NEW: Optional discount code
}

Response (200):
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "discountApplied": {
    "code": "SAVE20PRO",
    "discountPercent": 20,
    "originalPrice": 29.00,
    "finalPrice": 23.20
  }
}
```

---

## 6. USER FLOWS

### 6.1 Free User Applies Discount Code

```
1. User (FREE tier) navigates to /pricing
   ↓
2. Clicks "Upgrade to PRO" button
   ↓
3. Checkout page displays:
   - Regular price: $29.00/month
   - Input field: "Have a discount code?"
   ↓
4. User enters: "SAVE20PRO"
   ↓
5. Client calls: POST /api/affiliate/validate-code
   ↓
6. API validates:
   ✅ Code exists
   ✅ Code is active (isActive = true)
   ✅ Code not expired (expiresAt > now)
   ✅ User is FREE tier
   ✅ User has no active PRO subscription
   ↓
7. If valid → Show discounted price:
   "Regular: $29.00
    Discount (20%): -$5.80
    You pay: $23.20/month"
   ↓
8. User clicks "Proceed to Payment"
   ↓
9. Client calls: POST /api/checkout/create-session
   {
     "priceId": "price_pro_monthly",
     "discountCode": "SAVE20PRO"
   }
   ↓
10. Server creates Stripe checkout with:
    - Custom unit_amount: 2320 (cents)
    - Metadata: { discountCode: "SAVE20PRO", codeId: "clx..." }
    ↓
11. User completes Stripe payment
    ↓
12. Stripe webhook fires: checkout.session.completed
    ↓
13. Webhook handler:
    a. Create/update Subscription record
    b. Upgrade user.tier to "PRO"
    c. Extract metadata.discountCode
    d. Create Commission record:
       {
         codeId: "clx...",
         userId: "user123",
         subscriptionId: "sub_...",
         regularPrice: 29.00,
         discountPercent: 20,
         discountedPrice: 23.20,
         commissionPercent: 30,
         commissionAmount: 6.96,
         status: "PENDING"
       }
    e. Send email to affiliate: "Code SAVE20PRO used successfully!"
    ↓
14. User receives confirmation email
15. User tier upgraded to PRO
16. Commission tracked for affiliate
```

### 6.2 Invalid Code Scenarios

**Scenario A: Code doesn't exist**
```
User enters: "FAKE123"
API Response (400):
{
  "valid": false,
  "error": "invalid_code",
  "message": "Invalid discount code"
}
UI: Show error message below input field
```

**Scenario B: Code expired**
```
User enters: "EXPIRED2024"
API Response (400):
{
  "valid": false,
  "error": "code_expired",
  "message": "This code expired on 2024-12-31"
}
```

**Scenario C: User already PRO**
```
User tier: PRO
User enters: "SAVE20PRO"
API Response (400):
{
  "valid": false,
  "error": "not_eligible",
  "message": "Discount codes are only available for FREE tier users"
}
```

**Scenario D: Code disabled by admin**
```
User enters: "DISABLED123"
API Response (400):
{
  "valid": false,
  "error": "code_disabled",
  "message": "This discount code is no longer active"
}
```

---

## 7. ADMIN WORKFLOWS

### 7.1 Create New Discount Code

```
Admin Dashboard → Affiliates → Create Code

1. Click "Create New Code" button
   ↓
2. Form displays:
   - Code (auto-generated or custom): [SAVE20PRO]
   - Discount Percentage: [20] % (max 50%)
   - Commission Percentage: [30] % (max 50%)
   - Affiliate Email: [affiliate@example.com]
   - Expiry Date: [2025-12-31] (optional)
   ↓
3. Admin fills form and clicks "Create"
   ↓
4. Client validates:
   - Discount 0-50%
   - Commission 0-50%
   - Valid email format
   - Expiry date in future (if provided)
   ↓
5. POST /api/admin/affiliate/codes
   ↓
6. Server:
   - Checks code uniqueness
   - Creates AffiliateCode record
   - Returns created code
   ↓
7. UI shows success message + new code in table
   ↓
8. Admin can copy code and send to affiliate marketer
```

### 7.2 Disable/Enable Code

```
Admin Dashboard → Affiliates → Codes List

1. View table of all codes
   ↓
2. Find code to disable (e.g., "SAVE20PRO")
   ↓
3. Click toggle switch: Active → Inactive
   ↓
4. Confirmation dialog: "Disable code SAVE20PRO?"
   ↓
5. PATCH /api/admin/affiliate/codes/:id
   { "isActive": false }
   ↓
6. Code status updated
   ↓
7. Future validation requests for this code will fail
   (Existing subscriptions not affected)
```

### 7.3 Monthly Commission Payout

```
First week of December 2025:

1. Admin logs in to dashboard
   ↓
2. Navigate: Dashboard → Affiliates → Commissions
   ↓
3. Filter by:
   - Status: PENDING
   - Month: November 2025
   ↓
4. View report showing:

   Affiliate          | Conversions | Total Commission
   ------------------ | ----------- | ----------------
   affiliate1@x.com   | 5           | $34.80
   affiliate2@x.com   | 3           | $20.88
   affiliate3@x.com   | 2           | $13.92
   ------------------ | ----------- | ----------------
   TOTAL              | 10          | $69.60
   ↓
5. Admin makes external payments:
   - PayPal transfer to affiliate1@x.com: $34.80
   - PayPal transfer to affiliate2@x.com: $20.88
   - PayPal transfer to affiliate3@x.com: $13.92
   ↓
6. Admin returns to dashboard:
   - Select all November commissions
   - Click "Mark as Paid"
   - Add note: "Paid via PayPal on 2025-12-05"
   ↓
7. POST /api/admin/affiliate/commissions/bulk-pay
   {
     "commissionIds": ["clx1", "clx2", ..., "clx10"],
     "note": "Paid via PayPal on 2025-12-05"
   }
   ↓
8. Server updates all commissions:
   - status: PENDING → PAID
   - paidAt: 2025-12-05T10:00:00Z
   - paidBy: admin_user_id
   ↓
9. System sends emails to all affiliates:

   Subject: "Your November commission has been paid"
   Body:
   "Hi,

   Your affiliate commission for November 2025 has been paid.

   Code: SAVE20PRO
   Conversions: 5
   Amount Paid: $34.80
   Payment Method: PayPal

   Thank you for promoting Trading Alerts!"
   ↓
10. Commission balances cleared
11. Repeat next month
```

---

## 8. COMMISSION CALCULATION LOGIC

### 8.1 Calculation Function

**File:** `lib/affiliate/commission.ts`

```typescript
export interface CommissionCalculation {
  regularPrice: number;
  discountPercent: number;
  discountedPrice: number;
  commissionPercent: number;
  commissionAmount: number;
  savings: number;
}

export function calculateCommission(
  regularPrice: number,        // 29.00
  discountPercent: number,      // 20
  commissionPercent: number     // 30
): CommissionCalculation {

  // Validate inputs
  if (discountPercent < 0 || discountPercent > 50) {
    throw new Error('Discount must be 0-50%');
  }

  if (commissionPercent < 0 || commissionPercent > 50) {
    throw new Error('Commission must be 0-50%');
  }

  // Calculate discounted price
  const discountAmount = regularPrice * (discountPercent / 100);
  const discountedPrice = regularPrice - discountAmount;

  // Calculate commission
  const commissionAmount = discountedPrice * (commissionPercent / 100);

  return {
    regularPrice: parseFloat(regularPrice.toFixed(2)),
    discountPercent,
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
    commissionPercent,
    commissionAmount: parseFloat(commissionAmount.toFixed(2)),
    savings: parseFloat(discountAmount.toFixed(2))
  };
}

// Example usage
const result = calculateCommission(29.00, 20, 30);
console.log(result);
// {
//   regularPrice: 29.00,
//   discountPercent: 20,
//   discountedPrice: 23.20,
//   commissionPercent: 30,
//   commissionAmount: 6.96,
//   savings: 5.80
// }
```

### 8.2 Edge Cases

**Case 1: 0% Discount (Code gives commission only)**
```typescript
calculateCommission(29.00, 0, 30);
// Result:
// discountedPrice: 29.00
// commissionAmount: 8.70
// User pays full price, affiliate still earns
```

**Case 2: 50% Discount (Maximum)**
```typescript
calculateCommission(29.00, 50, 40);
// Result:
// discountedPrice: 14.50
// commissionAmount: 5.80
```

**Case 3: 0% Commission (Pure discount, no affiliate)**
```typescript
calculateCommission(29.00, 15, 0);
// Result:
// discountedPrice: 24.65
// commissionAmount: 0.00
// Useful for admin promo codes
```

---

## 9. SECURITY CONSIDERATIONS

### 9.1 Code Generation

**Secure Random Code:**
```typescript
import crypto from 'crypto';

export function generateDiscountCode(prefix: string = 'TRADE'): string {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}${random}`;
}

// Examples:
// TRADE8A3B2C1D
// SAVE4F9E1A7B
// PRO20256D8C4A
```

**Uniqueness Check:**
```typescript
async function createCode(data: CreateCodeRequest) {
  let code = data.code || generateDiscountCode();

  // Ensure uniqueness
  const existing = await prisma.affiliateCode.findUnique({
    where: { code }
  });

  if (existing) {
    throw new Error('Code already exists');
  }

  return prisma.affiliateCode.create({ data: { ...data, code } });
}
```

### 9.2 Validation Security

**Rate Limiting:**
```typescript
// Prevent brute-force code guessing
import rateLimit from 'express-rate-limit';

const codeValidationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // Max 10 validation attempts
  message: 'Too many validation attempts, try again later'
});

// Apply to POST /api/affiliate/validate-code
```

**SQL Injection Prevention:**
```typescript
// ✅ SAFE - Using Prisma (parameterized queries)
const code = await prisma.affiliateCode.findUnique({
  where: { code: userInput }  // Prisma escapes automatically
});

// ❌ UNSAFE - Raw SQL (don't do this)
const code = await prisma.$queryRaw`
  SELECT * FROM AffiliateCode WHERE code = ${userInput}
`;
```

### 9.3 Fraud Prevention

**One-time Use Per User:**
```typescript
// Check if user already used this code
const existingCommission = await prisma.commission.findFirst({
  where: {
    userId: currentUser.id,
    codeId: code.id
  }
});

if (existingCommission) {
  throw new Error('You already used this discount code');
}
```

**Tier Restriction:**
```typescript
// Only FREE users can use codes
if (currentUser.tier !== 'FREE') {
  throw new Error('Discount codes are only for FREE tier users');
}

// Check if user has any active PRO subscription
const activeSubscription = await prisma.subscription.findFirst({
  where: {
    userId: currentUser.id,
    status: 'active'
  }
});

if (activeSubscription) {
  throw new Error('You already have an active subscription');
}
```

### 9.4 Admin Authorization

**Restrict Admin Actions:**
```typescript
// Middleware for admin-only routes
export async function requireAdmin(req: Request) {
  const session = await getServerSession();

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }

  return session;
}

// Apply to all /api/admin/affiliate/* routes
```

---

## 10. INTEGRATION POINTS

### 10.1 Stripe Integration

**Create Checkout with Discount:**
```typescript
// app/api/checkout/create-session/route.ts

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { priceId, discountCode } = await req.json();
  const session = await getServerSession();

  let finalPrice = 2900; // $29.00 in cents (default)
  let codeData = null;

  // Validate discount code if provided
  if (discountCode) {
    const validation = await validateDiscountCode(discountCode, session.user);

    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    finalPrice = Math.round(validation.discountedPrice * 100); // Convert to cents
    codeData = validation;
  }

  // Create Stripe checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product: process.env.STRIPE_PRO_PRODUCT_ID,
          recurring: { interval: 'month' },
          unit_amount: finalPrice  // Discounted price
        },
        quantity: 1
      }
    ],
    metadata: {
      userId: session.user.id,
      discountCode: discountCode || '',
      codeId: codeData?.codeId || '',
      originalPrice: '29.00',
      discountedPrice: (finalPrice / 100).toFixed(2)
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`
  });

  return Response.json({
    sessionId: checkoutSession.id,
    url: checkoutSession.url,
    discountApplied: codeData
  });
}
```

**Webhook Handler:**
```typescript
// app/api/webhooks/stripe/route.ts

export async function POST(req: Request) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get('stripe-signature')!,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;

    // Create subscription record
    const subscription = await prisma.subscription.create({
      data: {
        userId: metadata.userId,
        stripeCustomerId: session.customer,
        stripePriceId: session.subscription,
        stripeCurrentPeriodEnd: new Date(session.current_period_end * 1000),
        status: 'active',
        discountCodeId: metadata.codeId || null,
        originalPrice: parseFloat(metadata.originalPrice),
        discountedPrice: parseFloat(metadata.discountedPrice)
      }
    });

    // Upgrade user tier
    await prisma.user.update({
      where: { id: metadata.userId },
      data: { tier: 'PRO' }
    });

    // Create commission record if code used
    if (metadata.codeId) {
      const code = await prisma.affiliateCode.findUnique({
        where: { id: metadata.codeId }
      });

      if (code) {
        const calc = calculateCommission(
          parseFloat(metadata.originalPrice),
          code.discountPercent,
          code.commissionPercent
        );

        await prisma.commission.create({
          data: {
            codeId: code.id,
            userId: metadata.userId,
            subscriptionId: subscription.id,
            regularPrice: calc.regularPrice,
            discountPercent: calc.discountPercent,
            discountedPrice: calc.discountedPrice,
            commissionPercent: calc.commissionPercent,
            commissionAmount: calc.commissionAmount,
            status: 'PENDING'
          }
        });

        // Email affiliate
        await sendAffiliateNotification(code.affiliateEmail, {
          code: code.code,
          userName: session.customer_details.email,
          amount: calc.commissionAmount
        });
      }
    }
  }

  return Response.json({ received: true });
}
```

### 10.2 Email Notifications

**Affiliate Code Used:**
```typescript
// lib/email/affiliate-notifications.ts

export async function sendAffiliateNotification(
  affiliateEmail: string,
  data: {
    code: string;
    userName: string;
    amount: number;
  }
) {
  await sendEmail({
    to: affiliateEmail,
    subject: `Your code ${data.code} was used!`,
    html: `
      <h2>Great news!</h2>
      <p>Your discount code <strong>${data.code}</strong> was just used.</p>
      <p><strong>User:</strong> ${data.userName}</p>
      <p><strong>Commission earned:</strong> $${data.amount.toFixed(2)}</p>
      <p>This commission will be paid during the first week of next month.</p>
      <p>Keep sharing your code to earn more!</p>
    `
  });
}
```

**Commission Payment Confirmation:**
```typescript
export async function sendPaymentConfirmation(
  affiliateEmail: string,
  data: {
    month: string;
    count: number;
    totalAmount: number;
    codes: string[];
  }
) {
  await sendEmail({
    to: affiliateEmail,
    subject: `Your ${data.month} commission has been paid`,
    html: `
      <h2>Commission Payment Confirmed</h2>
      <p>Your affiliate commission for ${data.month} has been paid.</p>
      <ul>
        <li><strong>Conversions:</strong> ${data.count}</li>
        <li><strong>Codes:</strong> ${data.codes.join(', ')}</li>
        <li><strong>Amount Paid:</strong> $${data.totalAmount.toFixed(2)}</li>
      </ul>
      <p>Thank you for promoting Trading Alerts SaaS!</p>
    `
  });
}
```

---

## 11. IMPLEMENTATION PHASES

### Phase 1: Core Infrastructure (Week 1)
**Estimated Time:** 8 hours

**Tasks:**
- [ ] Create Prisma schema for `AffiliateCode` and `Commission`
- [ ] Run database migration
- [ ] Create `lib/affiliate/commission.ts` calculation logic
- [ ] Create `lib/affiliate/validator.ts` validation logic
- [ ] Write unit tests for calculation and validation

**Files Created:**
- `prisma/migrations/YYYYMMDD_add_affiliate_tables.sql`
- `lib/affiliate/commission.ts`
- `lib/affiliate/validator.ts`
- `lib/affiliate/__tests__/commission.test.ts`
- `lib/affiliate/__tests__/validator.test.ts`

---

### Phase 2: Admin Dashboard (Week 2)
**Estimated Time:** 12 hours

**Tasks:**
- [ ] Create admin affiliate dashboard page
- [ ] Build code creation form
- [ ] Build codes list with enable/disable toggle
- [ ] Build commission report page
- [ ] Build bulk payment marking interface
- [ ] API endpoints: POST/GET/PATCH `/api/admin/affiliate/codes`
- [ ] API endpoint: GET `/api/admin/affiliate/commissions`
- [ ] API endpoint: POST `/api/admin/affiliate/commissions/bulk-pay`

**Files Created:**
- `app/admin/affiliates/page.tsx`
- `app/admin/affiliates/codes/page.tsx`
- `app/admin/affiliates/commissions/page.tsx`
- `app/api/admin/affiliate/codes/route.ts`
- `app/api/admin/affiliate/codes/[id]/route.ts`
- `app/api/admin/affiliate/commissions/route.ts`
- `app/api/admin/affiliate/commissions/bulk-pay/route.ts`
- `components/admin/code-form.tsx`
- `components/admin/commission-table.tsx`

---

### Phase 3: Checkout Integration (Week 3)
**Estimated Time:** 10 hours

**Tasks:**
- [ ] Add discount code input to checkout page
- [ ] Implement real-time code validation
- [ ] Show price breakdown (regular → discounted)
- [ ] Update Stripe checkout session creation
- [ ] Add discount code to Stripe metadata
- [ ] API endpoint: POST `/api/affiliate/validate-code`
- [ ] UI components for discount code flow

**Files Modified:**
- `app/checkout/page.tsx`
- `app/api/checkout/create-session/route.ts`

**Files Created:**
- `app/api/affiliate/validate-code/route.ts`
- `components/checkout/discount-code-input.tsx`
- `components/checkout/price-breakdown.tsx`

---

### Phase 4: Webhook & Commission Tracking (Week 3)
**Estimated Time:** 6 hours

**Tasks:**
- [ ] Update Stripe webhook handler
- [ ] Extract discount code from metadata
- [ ] Create commission record on successful payment
- [ ] Update subscription table with discount info
- [ ] Send affiliate notification email
- [ ] Handle commission cancellation on refund

**Files Modified:**
- `app/api/webhooks/stripe/route.ts`

**Files Created:**
- `lib/email/affiliate-notifications.ts`

---

### Phase 5: Testing & Documentation (Week 4)
**Estimated Time:** 8 hours

**Tasks:**
- [ ] End-to-end testing of full flow
- [ ] Postman collection for affiliate endpoints
- [ ] Admin guide documentation
- [ ] Affiliate guide documentation
- [ ] Update OpenAPI specification
- [ ] Security audit
- [ ] Performance testing

**Files Created:**
- `docs/AFFILIATE-ADMIN-GUIDE.md`
- `docs/AFFILIATE-MARKETER-GUIDE.md`
- `postman/affiliate-endpoints.json`
- Updated: `docs/trading_alerts_openapi.yaml`

---

### Phase 6: Optional Enhancements (Future)
**Estimated Time:** 16 hours

**Tasks:**
- [ ] Affiliate self-service dashboard
- [ ] Real-time commission tracking
- [ ] Code usage analytics
- [ ] Multi-tier commission structure
- [ ] Automated monthly payout emails
- [ ] Affiliate referral links
- [ ] Code performance reports

---

## 12. TESTING STRATEGY

### 12.1 Unit Tests

**Commission Calculation:**
```typescript
// lib/affiliate/__tests__/commission.test.ts

describe('calculateCommission', () => {
  it('should calculate 20% discount, 30% commission correctly', () => {
    const result = calculateCommission(29.00, 20, 30);
    expect(result.discountedPrice).toBe(23.20);
    expect(result.commissionAmount).toBe(6.96);
  });

  it('should handle 0% discount', () => {
    const result = calculateCommission(29.00, 0, 30);
    expect(result.discountedPrice).toBe(29.00);
    expect(result.commissionAmount).toBe(8.70);
  });

  it('should throw error for discount > 50%', () => {
    expect(() => calculateCommission(29.00, 60, 30)).toThrow();
  });
});
```

**Code Validation:**
```typescript
describe('validateDiscountCode', () => {
  it('should accept valid code for FREE user', async () => {
    const result = await validateDiscountCode('SAVE20PRO', freeUser);
    expect(result.valid).toBe(true);
    expect(result.discountedPrice).toBe(23.20);
  });

  it('should reject expired code', async () => {
    const result = await validateDiscountCode('EXPIRED123', freeUser);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('code_expired');
  });

  it('should reject for PRO user', async () => {
    const result = await validateDiscountCode('SAVE20PRO', proUser);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('not_eligible');
  });
});
```

### 12.2 Integration Tests

**Full Checkout Flow:**
```typescript
describe('Affiliate Checkout Flow', () => {
  it('should complete checkout with discount code', async () => {
    // 1. Create test code
    const code = await createTestCode({
      code: 'TEST20',
      discountPercent: 20,
      commissionPercent: 30
    });

    // 2. Login as FREE user
    const user = await loginAsTestUser({ tier: 'FREE' });

    // 3. Validate code
    const validation = await POST('/api/affiliate/validate-code', {
      code: 'TEST20'
    });
    expect(validation.valid).toBe(true);

    // 4. Create checkout session
    const session = await POST('/api/checkout/create-session', {
      priceId: 'price_pro',
      discountCode: 'TEST20'
    });
    expect(session.url).toBeDefined();

    // 5. Simulate Stripe webhook
    await simulateStripeWebhook('checkout.session.completed', {
      metadata: {
        userId: user.id,
        codeId: code.id,
        discountCode: 'TEST20',
        originalPrice: '29.00',
        discountedPrice: '23.20'
      }
    });

    // 6. Verify commission created
    const commission = await prisma.commission.findFirst({
      where: { userId: user.id, codeId: code.id }
    });
    expect(commission).toBeDefined();
    expect(commission.commissionAmount).toBe(6.96);
    expect(commission.status).toBe('PENDING');

    // 7. Verify user upgraded
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    expect(updatedUser.tier).toBe('PRO');
  });
});
```

### 12.3 Manual Testing Checklist

**Admin Functions:**
- [ ] Create discount code with custom settings
- [ ] Auto-generate random code
- [ ] Disable code (verify validation fails after)
- [ ] Enable previously disabled code
- [ ] View commission report filtered by month
- [ ] View commission report filtered by status
- [ ] Mark commissions as paid (bulk)
- [ ] Verify email sent to affiliate after payment

**User Functions:**
- [ ] Apply valid code at checkout (FREE user)
- [ ] See discounted price preview
- [ ] Complete payment with discount
- [ ] Verify tier upgraded to PRO
- [ ] Try to apply code as PRO user (should fail)
- [ ] Try to apply expired code (should fail)
- [ ] Try to apply disabled code (should fail)
- [ ] Try to apply non-existent code (should fail)

**Security Tests:**
- [ ] Try SQL injection in code input
- [ ] Try XSS in code input
- [ ] Attempt rate limit bypass (10+ validations/15min)
- [ ] Try to access admin endpoints as regular user
- [ ] Verify commissions created only on successful payment
- [ ] Verify one code per user enforcement

---

## 13. DOCUMENTATION UPDATES REQUIRED

Based on this design, the following existing documents need updates:

### 13.1 Database Schema
**File:** `docs/v5-structure-division.md` → Part 2: Database Schema

**Changes:**
- Add `AffiliateCode` table
- Add `Commission` table
- Update `User` relations
- Update `Subscription` with discount fields

---

### 13.2 API Specification
**File:** `docs/trading_alerts_openapi.yaml`

**New Endpoints to Add:**
```yaml
/api/admin/affiliate/codes:
  get: # List codes
  post: # Create code

/api/admin/affiliate/codes/{id}:
  patch: # Update code

/api/admin/affiliate/commissions:
  get: # Commission report

/api/admin/affiliate/commissions/bulk-pay:
  post: # Mark as paid

/api/affiliate/validate-code:
  post: # Validate code
```

**Updated Endpoints:**
```yaml
/api/checkout/create-session:
  post:
    requestBody:
      properties:
        discountCode: # Add optional field
```

---

### 13.3 Architecture Rules
**File:** `docs/policies/03-architecture-rules.md`

**New Section to Add:**
```markdown
## Affiliate Marketing Rules

1. **Commission Calculation:**
   - ALWAYS use lib/affiliate/commission.ts
   - NEVER calculate inline in components or API routes
   - Round to 2 decimal places

2. **Code Validation:**
   - ALWAYS check: exists, active, not expired, user eligible
   - Rate limit validation endpoint (10 attempts / 15 min)
   - Log validation attempts for fraud detection

3. **Stripe Integration:**
   - ALWAYS pass discount code in metadata
   - Create custom price (don't use Stripe coupons for MVP)
   - Create commission ONLY after payment success

4. **Admin Authorization:**
   - ALL /api/admin/affiliate/* routes require ADMIN role
   - Log all admin actions (create, disable, payout)
```

---

### 13.4 Coding Patterns
**File:** `docs/policies/05-coding-patterns.md`

**New Pattern to Add:**
```markdown
## Pattern 8: Affiliate Discount Code Validation

### Use Case
Validate discount code before checkout

### Code Example
\`\`\`typescript
// app/api/affiliate/validate-code/route.ts
import { getServerSession } from 'next-auth';
import { validateDiscountCode } from '@/lib/affiliate/validator';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code } = await req.json();
    const result = await validateDiscountCode(code, session.user);

    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Code validation failed:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
\`\`\`
```

---

### 13.5 Project Structure
**File:** `docs/v5-structure-division.md`

**New Part to Add:**
```markdown
## PART 17: Affiliate Marketing System

**Scope:** Affiliate code management and commission tracking

**Folders & Files:**
\`\`\`
app/admin/affiliates/
├── page.tsx              # Affiliate dashboard
├── codes/page.tsx        # Code management
└── commissions/page.tsx  # Commission reports

app/api/admin/affiliate/
├── codes/route.ts
├── codes/[id]/route.ts
├── commissions/route.ts
└── commissions/bulk-pay/route.ts

app/api/affiliate/
└── validate-code/route.ts

lib/affiliate/
├── commission.ts         # Calculation logic
├── validator.ts          # Validation logic
└── __tests__/
    ├── commission.test.ts
    └── validator.test.ts

components/admin/
├── code-form.tsx
└── commission-table.tsx

components/checkout/
├── discount-code-input.tsx
└── price-breakdown.tsx
\`\`\`

**File Count:** ~15 files
```

---

### 13.6 Testing Guide
**File:** `postman/TESTING-GUIDE.md`

**New Scenario to Add:**
```markdown
## Scenario 6: Affiliate Marketing Flow

### Prerequisites
- Admin user logged in
- FREE tier test user created

### Step 1: Admin Creates Code
\`\`\`
POST /api/admin/affiliate/codes
Authorization: Bearer {{admin_token}}

Body:
{
  "code": "SAVE20PRO",
  "discountPercent": 20,
  "commissionPercent": 30,
  "affiliateEmail": "affiliate@test.com",
  "expiresAt": "2025-12-31T23:59:59Z"
}

Expected: 201 Created, code object returned
Save {{code_id}} for later tests
\`\`\`

### Step 2: User Validates Code
\`\`\`
POST /api/affiliate/validate-code
Authorization: Bearer {{free_user_token}}

Body:
{
  "code": "SAVE20PRO"
}

Expected: 200 OK
{
  "valid": true,
  "discountedPrice": 23.20,
  "savings": 5.80
}
\`\`\`

### Step 3: User Completes Checkout
\`\`\`
POST /api/checkout/create-session
Authorization: Bearer {{free_user_token}}

Body:
{
  "priceId": "price_pro_monthly",
  "discountCode": "SAVE20PRO"
}

Expected: 200 OK, Stripe checkout URL
\`\`\`

### Step 4: Simulate Webhook (Dev Only)
Complete Stripe checkout in test mode
Webhook fires automatically

### Step 5: Verify Commission Created
\`\`\`
GET /api/admin/affiliate/commissions?status=PENDING
Authorization: Bearer {{admin_token}}

Expected: 200 OK
Commission record with:
- commissionAmount: 6.96
- status: PENDING
\`\`\`

### Step 6: Mark Commission as Paid
\`\`\`
POST /api/admin/affiliate/commissions/bulk-pay
Authorization: Bearer {{admin_token}}

Body:
{
  "commissionIds": ["{{commission_id}}"],
  "note": "Paid via PayPal"
}

Expected: 200 OK
\`\`\`

### Step 7: Verify Status Updated
\`\`\`
GET /api/admin/affiliate/commissions/{{commission_id}}
Authorization: Bearer {{admin_token}}

Expected: 200 OK
{
  "status": "PAID",
  "paidAt": "2025-11-14T..."
}
\`\`\`
```

---

### 13.7 Progress Tracking
**File:** `PROGRESS.md`

**Update Phase 3 Build Order:**
```markdown
### PART 17: Affiliate Marketing System (Week 11, 8 hours)

**What:** Discount code generation, commission tracking, admin management.

**Files:** 15 files

**Command:**
\`\`\`bash
Build Part 17: Affiliate Marketing from docs/AFFILIATE-MARKETING-DESIGN.md

Create database schema, admin dashboard, checkout integration, commission tracking.
\`\`\`

**Testing:**
- [ ] Admin can create codes
- [ ] User can apply code at checkout
- [ ] Commission created on payment
- [ ] Admin can mark commissions as paid
- [ ] Emails sent to affiliates
```

---

## 14. SUMMARY & NEXT STEPS

### What We're Building

An affiliate marketing system that allows:
1. **Admins** to generate discount codes with configurable discounts and commissions
2. **Affiliates** to distribute codes and earn commissions
3. **Users** to apply codes during checkout for discounts
4. **Automated** commission tracking and monthly payout process

### Key Features
- ✅ Flexible discount (0-50%) and commission (0-50%) percentages
- ✅ Secure code validation with fraud prevention
- ✅ Automated commission calculation on payment success
- ✅ Admin dashboard for code and commission management
- ✅ Monthly payout workflow with email notifications

### Technical Highlights
- **2 new database tables** (AffiliateCode, Commission)
- **8 new API endpoints** (admin CRUD, validation, reporting)
- **15+ new files** (components, utilities, tests)
- **Stripe integration** via custom pricing and metadata
- **Email notifications** for affiliates

### Time Estimate
**Total:** ~44 hours across 6 phases
- Phase 1: Infrastructure (8h)
- Phase 2: Admin Dashboard (12h)
- Phase 3: Checkout Integration (10h)
- Phase 4: Webhook & Tracking (6h)
- Phase 5: Testing & Docs (8h)
- Phase 6: Optional Enhancements (16h) - Future

### Your Current Status
**Milestone 1.6** - Phase 1 (Documentation & Policies)

### Immediate Next Steps

1. **Review this design document**
   - Ask questions if anything is unclear
   - Suggest modifications if needed

2. **Update affected documents** (see Section 13)
   - `docs/v5-structure-division.md`
   - `docs/trading_alerts_openapi.yaml`
   - `docs/policies/03-architecture-rules.md`
   - `docs/policies/05-coding-patterns.md`
   - `postman/TESTING-GUIDE.md`
   - `PROGRESS.md`

3. **Complete Phase 1** (your current phase)
   - Finish Milestone 1.6 (Aider comprehension tests)
   - Complete Milestone 1.7 (Readiness check)

4. **Proceed with Phase 2-3** (Foundation & Building)
   - Build original 16 parts first
   - Add Part 17 (Affiliate Marketing) after core features complete

5. **Test comprehensively**
   - Unit tests for calculation logic
   - Integration tests for full flow
   - Manual testing checklist

---

## 15. OPEN QUESTIONS & DECISIONS NEEDED

Before implementation, please decide:

1. **Code Format Preference:**
   - Option A: Auto-generated (e.g., TRADE8A3B2C1D)
   - Option B: Admin-provided custom (e.g., SAVE20PRO)
   - Option C: Hybrid (prefix + random, e.g., AFFILIATE-8A3B2C1D)

2. **Maximum Discount:**
   - Current design: 50% max
   - Adjust if needed (e.g., 30% max for safety)

3. **Commission Payment Method:**
   - Current design: Manual (PayPal/Bank Transfer)
   - Future: Automated Stripe payouts?

4. **Affiliate Self-Service:**
   - MVP: Admin manages everything
   - Future: Let affiliates log in to view earnings?

5. **Code Usage Limits:**
   - Current design: Unlimited uses per code
   - Future: Max uses per code? (e.g., first 100 users)

6. **Recurring Commissions:**
   - Current design: One-time commission on signup
   - Future: Recurring commissions on renewals?

---

**Document Status:** Complete Design Specification
**Ready for:** Review & Implementation Planning
**Contact:** Project Owner for decisions on open questions

