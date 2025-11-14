# Affiliate Marketing Integration - Document Modification Checklist

**Project:** Trading Alerts SaaS V7
**Feature:** Affiliate Marketing Program
**Created:** 2025-11-14
**Current Milestone:** 1.6 (Phase 1: Documentation & Policies)

---

## 📋 OVERVIEW

This checklist outlines all existing documents that need updates to integrate the affiliate marketing program into your SaaS V7 project.

**Design Document:** `/docs/AFFILIATE-MARKETING-DESIGN.md`

---

## ✅ DOCUMENTS REQUIRING UPDATES

### 1. DATABASE SCHEMA DOCUMENTATION

**File:** `docs/v5-structure-division.md`

**Section to Update:** Part 2: Database Schema & Migrations

**Changes Required:**

Add to the Prisma schema documentation:

```markdown
## New Tables for Affiliate Marketing

### AffiliateCode Table
- id: String (Primary Key)
- code: String (Unique) - e.g., "SAVE20PRO"
- discountPercent: Int - 0-50%
- commissionPercent: Int - 0-50%
- affiliateEmail: String - Owner's email
- expiresAt: DateTime (Nullable) - Code expiry
- isActive: Boolean - Admin can disable
- createdAt: DateTime
- updatedAt: DateTime
- createdBy: String (Foreign Key → User)

### Commission Table
- id: String (Primary Key)
- codeId: String (Foreign Key → AffiliateCode)
- userId: String (Foreign Key → User)
- subscriptionId: String (Unique, Foreign Key → Subscription)
- regularPrice: Decimal(10,2) - $29.00
- discountPercent: Int
- discountedPrice: Decimal(10,2) - Actual amount charged
- commissionPercent: Int
- commissionAmount: Decimal(10,2) - Amount owed to affiliate
- status: Enum (PENDING, PAID, CANCELLED)
- paidAt: DateTime (Nullable)
- paidBy: String (Nullable, Foreign Key → User)
- createdAt: DateTime
- updatedAt: DateTime

### Updates to Existing Tables

**User table** - Add relations:
- createdCodes: AffiliateCode[]
- commissions: Commission[]
- paidCommissions: Commission[]

**Subscription table** - Add fields:
- discountCodeId: String (Nullable)
- originalPrice: Decimal(10,2) (Nullable)
- discountedPrice: Decimal(10,2) (Nullable)
```

**Status:** ⏳ **TO BE UPDATED**

---

### 2. API SPECIFICATION (OpenAPI)

**File:** `docs/trading_alerts_openapi.yaml`

**Section to Update:** Add new tag and endpoints

**Changes Required:**

```yaml
tags:
  # ... existing tags ...
  - name: Affiliate Marketing
    description: Discount code management and commission tracking

paths:
  # ==========================================
  # AFFILIATE MARKETING ENDPOINTS
  # ==========================================

  /api/admin/affiliate/codes:
    get:
      tags:
        - Affiliate Marketing
      summary: List all discount codes
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [active, disabled, all]
        - name: page
          in: query
          schema:
            type: integer
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Codes list
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AffiliateCodesListResponse'
    post:
      tags:
        - Affiliate Marketing
      summary: Create new discount code
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateAffiliateCodeRequest'
      responses:
        '201':
          description: Code created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AffiliateCode'

  /api/admin/affiliate/codes/{id}:
    patch:
      tags:
        - Affiliate Marketing
      summary: Update discount code
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateAffiliateCodeRequest'
      responses:
        '200':
          description: Code updated

  /api/admin/affiliate/commissions:
    get:
      tags:
        - Affiliate Marketing
      summary: Get commission report
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [PENDING, PAID, CANCELLED, all]
        - name: month
          in: query
          schema:
            type: string
            format: date
        - name: affiliateEmail
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Commission report
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommissionReportResponse'

  /api/admin/affiliate/commissions/bulk-pay:
    post:
      tags:
        - Affiliate Marketing
      summary: Mark commissions as paid
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BulkPayCommissionsRequest'
      responses:
        '200':
          description: Commissions marked as paid

  /api/affiliate/validate-code:
    post:
      tags:
        - Affiliate Marketing
      summary: Validate discount code
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                code:
                  type: string
                  example: SAVE20PRO
      responses:
        '200':
          description: Validation result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CodeValidationResponse'
        '400':
          description: Invalid code

components:
  schemas:
    AffiliateCode:
      type: object
      properties:
        id:
          type: string
        code:
          type: string
        discountPercent:
          type: integer
          minimum: 0
          maximum: 50
        commissionPercent:
          type: integer
          minimum: 0
          maximum: 50
        affiliateEmail:
          type: string
          format: email
        expiresAt:
          type: string
          format: date-time
          nullable: true
        isActive:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateAffiliateCodeRequest:
      type: object
      required:
        - code
        - discountPercent
        - commissionPercent
        - affiliateEmail
      properties:
        code:
          type: string
          pattern: '^[A-Z0-9]{6,20}$'
        discountPercent:
          type: integer
          minimum: 0
          maximum: 50
        commissionPercent:
          type: integer
          minimum: 0
          maximum: 50
        affiliateEmail:
          type: string
          format: email
        expiresAt:
          type: string
          format: date-time

    Commission:
      type: object
      properties:
        id:
          type: string
        codeId:
          type: string
        userId:
          type: string
        subscriptionId:
          type: string
        regularPrice:
          type: number
          format: decimal
        discountPercent:
          type: integer
        discountedPrice:
          type: number
          format: decimal
        commissionPercent:
          type: integer
        commissionAmount:
          type: number
          format: decimal
        status:
          type: string
          enum: [PENDING, PAID, CANCELLED]
        paidAt:
          type: string
          format: date-time
          nullable: true
        createdAt:
          type: string
          format: date-time

    CodeValidationResponse:
      type: object
      properties:
        valid:
          type: boolean
        code:
          type: string
        discountPercent:
          type: integer
        originalPrice:
          type: number
        discountedPrice:
          type: number
        savings:
          type: number
        expiresAt:
          type: string
          format: date-time
        error:
          type: string
          nullable: true
        message:
          type: string
          nullable: true
```

**Also Update:** `/api/checkout/create-session` endpoint

```yaml
  /api/checkout/create-session:
    post:
      # ... existing config ...
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                priceId:
                  type: string
                discountCode:  # NEW FIELD
                  type: string
                  nullable: true
```

**Status:** ⏳ **TO BE UPDATED**

---

### 3. ARCHITECTURE RULES

**File:** `docs/policies/03-architecture-rules.md`

**Section to Add:** New section at end of document

**Changes Required:**

Add this new section:

```markdown
---

## 9. AFFILIATE MARKETING RULES

### 9.1 Commission Calculation

**RULE:** All commission calculations MUST use the centralized utility function.

**Implementation:**
```typescript
// ✅ CORRECT
import { calculateCommission } from '@/lib/affiliate/commission';

const result = calculateCommission(29.00, 20, 30);
```

**DO NOT:**
```typescript
// ❌ WRONG - Inline calculation
const commission = (29.00 * 0.8) * 0.3;  // Error-prone
```

**Rationale:**
- Single source of truth
- Consistent rounding (2 decimals)
- Easier to audit
- Testable

---

### 9.2 Discount Code Validation

**RULE:** Always validate ALL conditions before applying discount.

**Required Checks:**
1. ✅ Code exists in database
2. ✅ Code is active (`isActive = true`)
3. ✅ Code not expired (`expiresAt > now` or null)
4. ✅ User is FREE tier
5. ✅ User has no active subscription
6. ✅ User hasn't used this code before (optional for MVP)

**Implementation:**
```typescript
// Use centralized validator
import { validateDiscountCode } from '@/lib/affiliate/validator';

const result = await validateDiscountCode(code, currentUser);

if (!result.valid) {
  return Response.json(
    { error: result.error, message: result.message },
    { status: 400 }
  );
}
```

**Rate Limiting:**
- Apply rate limit: 10 validation attempts per 15 minutes per IP
- Prevents brute-force code guessing
- Log excessive attempts for fraud detection

---

### 9.3 Stripe Integration

**RULE:** Discount codes MUST be tracked via Stripe metadata.

**Implementation:**
```typescript
// In checkout session creation
const session = await stripe.checkout.sessions.create({
  // ... other fields ...
  line_items: [
    {
      price_data: {
        unit_amount: Math.round(discountedPrice * 100),  // Custom price
        // ...
      }
    }
  ],
  metadata: {
    userId: user.id,
    discountCode: code.code,          // REQUIRED
    codeId: code.id,                  // REQUIRED
    originalPrice: '29.00',           // REQUIRED
    discountedPrice: '23.20'          // REQUIRED
  }
});
```

**Webhook Handler:**
```typescript
// Extract metadata to create commission
if (event.type === 'checkout.session.completed') {
  const metadata = session.metadata;

  if (metadata.codeId) {
    // Create commission record
    await createCommissionFromMetadata(metadata);
  }
}
```

**DO NOT:**
- ❌ Use Stripe coupons (less flexible for our use case)
- ❌ Create commission before payment success
- ❌ Forget to include discount info in metadata

---

### 9.4 Admin Authorization

**RULE:** ALL affiliate management endpoints require ADMIN role.

**Protected Routes:**
- `/api/admin/affiliate/codes` (all methods)
- `/api/admin/affiliate/codes/:id` (all methods)
- `/api/admin/affiliate/commissions` (all methods)
- `/api/admin/affiliate/commissions/bulk-pay`

**Middleware:**
```typescript
async function requireAdmin(req: Request) {
  const session = await getServerSession();

  if (!session || session.user.role !== 'ADMIN') {
    throw new UnauthorizedError('Admin access required');
  }

  return session;
}
```

**Audit Logging:**
- Log all admin actions (create code, disable code, mark paid)
- Include: admin ID, timestamp, action type, affected records
- Retention: 90 days minimum

---

### 9.5 Security Best Practices

**Code Generation:**
```typescript
// Use cryptographically secure random
import crypto from 'crypto';

function generateCode(prefix: string = 'TRADE'): string {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}${random}`;
}
```

**SQL Injection Prevention:**
```typescript
// ✅ SAFE - Prisma parameterized queries
const code = await prisma.affiliateCode.findUnique({
  where: { code: userInput }  // Auto-escaped
});

// ❌ UNSAFE - Never use raw SQL
const code = await prisma.$queryRaw`
  SELECT * FROM AffiliateCode WHERE code = ${userInput}
`;
```

**One-Time Use Enforcement (Optional):**
```typescript
// Check if user already used this code
const existing = await prisma.commission.findFirst({
  where: {
    userId: user.id,
    codeId: code.id
  }
});

if (existing) {
  throw new Error('Code already used');
}
```

---

### 9.6 Data Consistency

**Transaction for Payment + Commission:**
```typescript
// Use Prisma transaction for atomicity
await prisma.$transaction(async (tx) => {
  // 1. Create subscription
  const subscription = await tx.subscription.create({ ... });

  // 2. Upgrade user tier
  await tx.user.update({
    where: { id: userId },
    data: { tier: 'PRO' }
  });

  // 3. Create commission if code used
  if (codeId) {
    await tx.commission.create({ ... });
  }
});
```

**Rationale:** All-or-nothing - prevents partial state if any step fails.

---

### 9.7 Commission Status Lifecycle

**Valid Transitions:**
- `PENDING` → `PAID` (admin marks as paid)
- `PENDING` → `CANCELLED` (subscription refunded)
- `PAID` → `CANCELLED` (refund after payment - rare)

**Invalid Transitions:**
- ❌ `PAID` → `PENDING` (cannot unpay)
- ❌ `CANCELLED` → `PAID` (cannot pay cancelled)

**Implementation:**
```typescript
function updateCommissionStatus(
  current: CommissionStatus,
  next: CommissionStatus
) {
  const validTransitions = {
    PENDING: ['PAID', 'CANCELLED'],
    PAID: ['CANCELLED'],
    CANCELLED: []
  };

  if (!validTransitions[current].includes(next)) {
    throw new Error(`Invalid transition: ${current} → ${next}`);
  }

  // Proceed with update
}
```
```

**Status:** ⏳ **TO BE UPDATED**

---

### 4. CODING PATTERNS

**File:** `docs/policies/05-coding-patterns.md`

**Section to Add:** New Pattern 8

**Changes Required:**

```markdown
---

## Pattern 8: Affiliate Discount Code Validation

### Use Case
- Validate user-provided discount code before checkout
- Check all eligibility criteria
- Return detailed error messages

### Pattern Structure

```typescript
// app/api/affiliate/validate-code/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { validateDiscountCode } from '@/lib/affiliate/validator';
import { z } from 'zod';

// Request schema
const validateCodeSchema = z.object({
  code: z.string().min(6).max(20).regex(/^[A-Z0-9]+$/)
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Input validation
    const body = await req.json();
    const { code } = validateCodeSchema.parse(body);

    // 3. Business logic - validate code
    const result = await validateDiscountCode(code, session.user);

    // 4. Return appropriate response
    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    // 5. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Code validation failed:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
```

### Validation Logic (Business Layer)

```typescript
// lib/affiliate/validator.ts

import { prisma } from '@/lib/db/prisma';
import { User } from '@prisma/client';

export interface CodeValidationResult {
  valid: boolean;
  code?: string;
  discountPercent?: number;
  originalPrice?: number;
  discountedPrice?: number;
  savings?: number;
  expiresAt?: string;
  error?: string;
  message?: string;
}

export async function validateDiscountCode(
  code: string,
  user: User
): Promise<CodeValidationResult> {

  // 1. Check if code exists
  const affiliateCode = await prisma.affiliateCode.findUnique({
    where: { code }
  });

  if (!affiliateCode) {
    return {
      valid: false,
      error: 'invalid_code',
      message: 'Invalid discount code'
    };
  }

  // 2. Check if code is active
  if (!affiliateCode.isActive) {
    return {
      valid: false,
      error: 'code_disabled',
      message: 'This discount code is no longer active'
    };
  }

  // 3. Check if code is expired
  if (affiliateCode.expiresAt && affiliateCode.expiresAt < new Date()) {
    return {
      valid: false,
      error: 'code_expired',
      message: `This code expired on ${affiliateCode.expiresAt.toISOString().split('T')[0]}`
    };
  }

  // 4. Check user tier eligibility
  if (user.tier !== 'FREE') {
    return {
      valid: false,
      error: 'not_eligible',
      message: 'Discount codes are only available for FREE tier users'
    };
  }

  // 5. Check if user has active subscription
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: 'active'
    }
  });

  if (activeSubscription) {
    return {
      valid: false,
      error: 'has_subscription',
      message: 'You already have an active subscription'
    };
  }

  // 6. Calculate prices
  const regularPrice = 29.00;  // PRO tier price
  const discountAmount = regularPrice * (affiliateCode.discountPercent / 100);
  const discountedPrice = regularPrice - discountAmount;

  // 7. Return valid result
  return {
    valid: true,
    code: affiliateCode.code,
    discountPercent: affiliateCode.discountPercent,
    originalPrice: regularPrice,
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
    savings: parseFloat(discountAmount.toFixed(2)),
    expiresAt: affiliateCode.expiresAt?.toISOString()
  };
}
```

### Key Points

1. **Separation of Concerns:**
   - API route: HTTP handling, auth, input validation
   - Business layer: Domain logic, database queries

2. **Comprehensive Validation:**
   - Code exists ✅
   - Code active ✅
   - Code not expired ✅
   - User eligible ✅
   - No active subscription ✅

3. **User-Friendly Errors:**
   - Specific error codes (`invalid_code`, `code_expired`, etc.)
   - Clear messages for end users
   - No technical details exposed

4. **Type Safety:**
   - Zod schema for input validation
   - Typed return interface
   - Prisma for database type safety

5. **Security:**
   - Authentication required
   - Input sanitization via Zod
   - Parameterized queries (Prisma)
   - No SQL injection vectors

### Usage in Frontend

```typescript
// components/checkout/discount-code-input.tsx

const [code, setCode] = useState('');
const [validation, setValidation] = useState<CodeValidationResult | null>(null);
const [loading, setLoading] = useState(false);

async function handleValidate() {
  setLoading(true);

  try {
    const response = await fetch('/api/affiliate/validate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const result = await response.json();
    setValidation(result);

    if (result.valid) {
      // Show discounted price
      onDiscountApplied(result);
    }
  } catch (error) {
    console.error('Validation error:', error);
  } finally {
    setLoading(false);
  }
}
```
```

**Status:** ⏳ **TO BE UPDATED**

---

### 5. POSTMAN TESTING GUIDE

**File:** `postman/TESTING-GUIDE.md`

**Section to Add:** New Scenario 6

**Changes Required:**

Add at the end of the document:

```markdown
---

## Scenario 6: Affiliate Marketing Flow

### Prerequisites
- Admin user logged in and token saved as `{{admin_token}}`
- FREE tier test user created and token saved as `{{free_user_token}}`
- Stripe configured in test mode

---

### Step 1: Admin Creates Discount Code

**Request:**
```
POST {{baseUrl}}/api/admin/affiliate/codes
Authorization: Bearer {{admin_token}}
Content-Type: application/json

Body:
{
  "code": "SAVE20PRO",
  "discountPercent": 20,
  "commissionPercent": 30,
  "affiliateEmail": "affiliate@test.com",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Expected Response (201 Created):**
```json
{
  "id": "clx...",
  "code": "SAVE20PRO",
  "discountPercent": 20,
  "commissionPercent": 30,
  "affiliateEmail": "affiliate@test.com",
  "expiresAt": "2025-12-31T23:59:59Z",
  "isActive": true,
  "createdAt": "2025-11-14T10:00:00Z",
  "updatedAt": "2025-11-14T10:00:00Z"
}
```

**Save Variables:**
- `code_id` = `{{response.id}}`
- `code` = `SAVE20PRO`

---

### Step 2: List All Codes (Admin)

**Request:**
```
GET {{baseUrl}}/api/admin/affiliate/codes?status=active&page=1&limit=10
Authorization: Bearer {{admin_token}}
```

**Expected Response (200 OK):**
```json
{
  "codes": [
    {
      "id": "clx...",
      "code": "SAVE20PRO",
      "discountPercent": 20,
      "commissionPercent": 30,
      "affiliateEmail": "affiliate@test.com",
      "isActive": true,
      "usageCount": 0,
      "totalCommissions": 0
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

---

### Step 3: User Validates Code (FREE User)

**Request:**
```
POST {{baseUrl}}/api/affiliate/validate-code
Authorization: Bearer {{free_user_token}}
Content-Type: application/json

Body:
{
  "code": "SAVE20PRO"
}
```

**Expected Response (200 OK):**
```json
{
  "valid": true,
  "code": "SAVE20PRO",
  "discountPercent": 20,
  "originalPrice": 29.00,
  "discountedPrice": 23.20,
  "savings": 5.80,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

---

### Step 4: User Tries Invalid Code

**Request:**
```
POST {{baseUrl}}/api/affiliate/validate-code
Authorization: Bearer {{free_user_token}}
Content-Type: application/json

Body:
{
  "code": "INVALID123"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "valid": false,
  "error": "invalid_code",
  "message": "Invalid discount code"
}
```

---

### Step 5: User Completes Checkout with Code

**Request:**
```
POST {{baseUrl}}/api/checkout/create-session
Authorization: Bearer {{free_user_token}}
Content-Type: application/json

Body:
{
  "priceId": "price_pro_monthly",
  "discountCode": "SAVE20PRO"
}
```

**Expected Response (200 OK):**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "discountApplied": {
    "code": "SAVE20PRO",
    "discountPercent": 20,
    "originalPrice": 29.00,
    "finalPrice": 23.20
  }
}
```

**Manual Action:**
- Click the Stripe checkout URL
- Complete payment with test card: `4242 4242 4242 4242`
- Stripe webhook fires automatically

---

### Step 6: Verify Commission Created (Admin)

**Request:**
```
GET {{baseUrl}}/api/admin/affiliate/commissions?status=PENDING
Authorization: Bearer {{admin_token}}
```

**Expected Response (200 OK):**
```json
{
  "commissions": [
    {
      "id": "clx...",
      "code": "SAVE20PRO",
      "affiliateEmail": "affiliate@test.com",
      "userName": "Test User",
      "userEmail": "test@example.com",
      "regularPrice": 29.00,
      "discountedPrice": 23.20,
      "commissionAmount": 6.96,
      "status": "PENDING",
      "createdAt": "2025-11-14T10:05:00Z"
    }
  ],
  "summary": {
    "totalCommissions": 6.96,
    "pendingAmount": 6.96,
    "paidAmount": 0,
    "count": 1
  }
}
```

**Save Variable:**
- `commission_id` = `{{response.commissions[0].id}}`

---

### Step 7: Admin Marks Commission as Paid

**Request:**
```
POST {{baseUrl}}/api/admin/affiliate/commissions/bulk-pay
Authorization: Bearer {{admin_token}}
Content-Type: application/json

Body:
{
  "commissionIds": ["{{commission_id}}"],
  "note": "Paid via PayPal on 2025-11-14"
}
```

**Expected Response (200 OK):**
```json
{
  "updated": 1,
  "totalAmount": 6.96,
  "paidAt": "2025-11-14T11:00:00Z"
}
```

---

### Step 8: Verify Commission Status Updated

**Request:**
```
GET {{baseUrl}}/api/admin/affiliate/commissions?status=PAID
Authorization: Bearer {{admin_token}}
```

**Expected Response (200 OK):**
```json
{
  "commissions": [
    {
      "id": "{{commission_id}}",
      "code": "SAVE20PRO",
      "status": "PAID",
      "paidAt": "2025-11-14T11:00:00Z",
      "commissionAmount": 6.96
    }
  ],
  "summary": {
    "paidAmount": 6.96,
    "count": 1
  }
}
```

---

### Step 9: Admin Disables Code

**Request:**
```
PATCH {{baseUrl}}/api/admin/affiliate/codes/{{code_id}}
Authorization: Bearer {{admin_token}}
Content-Type: application/json

Body:
{
  "isActive": false
}
```

**Expected Response (200 OK):**
```json
{
  "id": "{{code_id}}",
  "code": "SAVE20PRO",
  "isActive": false,
  "updatedAt": "2025-11-14T12:00:00Z"
}
```

---

### Step 10: Verify Disabled Code Fails Validation

**Request:**
```
POST {{baseUrl}}/api/affiliate/validate-code
Authorization: Bearer {{free_user_token}}
Content-Type: application/json

Body:
{
  "code": "SAVE20PRO"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "valid": false,
  "error": "code_disabled",
  "message": "This discount code is no longer active"
}
```

---

### Summary Checklist

- [x] Admin created code successfully
- [x] Code appears in admin code list
- [x] FREE user validated code successfully
- [x] Invalid code rejected with clear error
- [x] User completed checkout with discounted price
- [x] Commission record created with PENDING status
- [x] Admin viewed commission report
- [x] Admin marked commission as PAID
- [x] Commission status updated to PAID
- [x] Admin disabled code
- [x] Disabled code validation fails

---

**Scenario Duration:** ~15-20 minutes

**Next Scenario:** Monthly Commission Payout Workflow (Future)
```

**Status:** ⏳ **TO BE UPDATED**

---

### 6. PROJECT STRUCTURE

**File:** `docs/v5-structure-division.md`

**Section to Add:** New Part 17

**Changes Required:**

Add after Part 16:

```markdown
---

## PART 17: Affiliate Marketing System

**Scope:** Discount code management, commission tracking, affiliate dashboard

**Folders & Files:**

```
app/admin/affiliates/
├── page.tsx                        # Affiliate dashboard overview
├── codes/
│   ├── page.tsx                   # Code management page
│   └── create/page.tsx            # Code creation page
└── commissions/
    └── page.tsx                    # Commission reports page

app/api/admin/affiliate/
├── codes/
│   ├── route.ts                   # GET (list), POST (create)
│   └── [id]/route.ts              # PATCH (update), DELETE (future)
├── commissions/
│   ├── route.ts                   # GET (report)
│   └── bulk-pay/route.ts          # POST (mark as paid)

app/api/affiliate/
└── validate-code/
    └── route.ts                    # POST (validate discount code)

lib/affiliate/
├── commission.ts                   # Commission calculation logic
├── validator.ts                    # Code validation logic
├── types.ts                        # TypeScript interfaces
└── __tests__/
    ├── commission.test.ts
    └── validator.test.ts

components/admin/affiliate/
├── code-form.tsx                   # Create/edit code form
├── codes-table.tsx                 # List of codes with actions
├── commission-table.tsx            # Commission report table
└── payout-modal.tsx                # Bulk payment modal

components/checkout/
├── discount-code-input.tsx         # Code input field
└── price-breakdown.tsx             # Price calculation display

lib/email/
└── affiliate-notifications.ts      # Email templates for affiliates

prisma/migrations/
└── YYYYMMDD_add_affiliate_tables/  # Database migration
    └── migration.sql
```

**Key Changes from V4:**
- ✅ NEW: Complete affiliate marketing system
- ✅ NEW: 2 database tables (AffiliateCode, Commission)
- ✅ NEW: 6 API endpoints for admin
- ✅ NEW: 1 public validation endpoint
- ✅ NEW: Admin dashboard for code & commission management
- ✅ NEW: Checkout integration for discount codes

**File Count:** ~20 files

**Implementation Notes:**
- Build AFTER Parts 1-16 (core features must exist first)
- Requires Stripe integration (Part 12) to be complete
- Requires Admin dashboard (Part 14) to be functional
- Update existing checkout flow (Part 12)
- Add commission creation to Stripe webhook handler

**Testing:**
- Unit tests for calculation logic
- Integration tests for validation flow
- E2E test for full checkout with code
- Postman Scenario 6 (affiliate flow)

**Dependencies:**
- Part 2: Database Schema (extend)
- Part 5: Authentication (admin authorization)
- Part 12: E-commerce (Stripe integration)
- Part 14: Admin Dashboard (extend)

---
```

**Status:** ⏳ **TO BE UPDATED**

---

### 7. PROGRESS TRACKING

**File:** `PROGRESS.md`

**Section to Update:** Phase 3 Build Order

**Changes Required:**

Add after Part 16 in the build order:

```markdown
---

### PART 17: Affiliate Marketing System (Week 11, 8 hours)

**What:** Discount code generation, commission tracking, affiliate dashboard, checkout integration.

**Files:** ~20 files

**Prerequisites:**
- ✅ Part 2 complete (Database can be extended)
- ✅ Part 5 complete (Authentication system working)
- ✅ Part 12 complete (Stripe integration working)
- ✅ Part 14 complete (Admin dashboard exists)

**Command:**
```bash
py -3.11 -m aider --model anthropic/MiniMax-M2

Build Part 17: Affiliate Marketing System from docs/AFFILIATE-MARKETING-DESIGN.md

Follow the implementation workflow:
1. Extend Prisma schema (AffiliateCode, Commission tables)
2. Run database migration
3. Create lib/affiliate/commission.ts (calculation logic)
4. Create lib/affiliate/validator.ts (validation logic)
5. Build admin API endpoints (/api/admin/affiliate/*)
6. Build public validation endpoint (/api/affiliate/validate-code)
7. Create admin dashboard pages
8. Update checkout flow with discount code input
9. Update Stripe webhook to create commissions
10. Add email notifications for affiliates
11. Write unit tests
12. Write integration tests
```

**Aider will build:**
- [ ] Database schema extension (2 new tables)
- [ ] Commission calculation utility
- [ ] Code validation logic
- [ ] Admin CRUD API endpoints (6 endpoints)
- [ ] Public validation endpoint
- [ ] Admin dashboard pages (3 pages)
- [ ] Checkout discount code integration
- [ ] Stripe webhook updates
- [ ] Email notification templates
- [ ] Unit tests (commission, validation)

**Testing with Postman:**

After Aider completes Part 17:

1. **Database Migration:**
   ```bash
   npx prisma migrate dev --name add_affiliate_tables
   npx prisma generate
   ```

2. **Postman Testing (Scenario 6):**

   📖 **Follow:** `postman/TESTING-GUIDE.md` → Scenario 6 (Affiliate Marketing)

   - [ ] Admin creates discount code
   - [ ] Admin lists all codes
   - [ ] FREE user validates code (valid response)
   - [ ] User tries invalid code (error response)
   - [ ] User completes checkout with code
   - [ ] Verify commission created (PENDING)
   - [ ] Admin views commission report
   - [ ] Admin marks commission as PAID
   - [ ] Verify commission status updated
   - [ ] Admin disables code
   - [ ] Disabled code validation fails

3. **End-to-End Test:**

   - [ ] Complete Stripe checkout with test card (4242 4242 4242 4242)
   - [ ] Webhook fires and creates commission
   - [ ] User tier upgraded to PRO
   - [ ] Commission amount calculated correctly
   - [ ] Affiliate notification email sent

4. **Edge Case Testing:**

   - [ ] PRO user tries to use code (should fail)
   - [ ] User tries expired code (should fail)
   - [ ] User tries to use same code twice (optional: should fail)
   - [ ] Admin tries to create duplicate code (should fail)
   - [ ] Invalid discount % (>50) rejected
   - [ ] Invalid commission % (>50) rejected

5. **UI Testing:**

   - [ ] Admin code creation form works
   - [ ] Code list displays correctly
   - [ ] Enable/disable toggle works
   - [ ] Commission report filters work
   - [ ] Bulk payment modal functions
   - [ ] Checkout discount input appears
   - [ ] Price breakdown displays correctly
   - [ ] Discounted price shown in Stripe

**Manual Testing Checklist:**

Admin Workflow:
- [ ] Create code with auto-generated name
- [ ] Create code with custom name
- [ ] Set expiry date
- [ ] Disable active code
- [ ] Re-enable disabled code
- [ ] View usage statistics
- [ ] Filter commissions by status
- [ ] Filter commissions by month
- [ ] Mark multiple commissions as paid
- [ ] Verify email sent to affiliate

User Workflow:
- [ ] Navigate to pricing page
- [ ] Click "Upgrade to PRO"
- [ ] See discount code input field
- [ ] Enter valid code
- [ ] See price update (29.00 → 23.20)
- [ ] See savings displayed
- [ ] Complete checkout
- [ ] Receive confirmation email
- [ ] Access PRO features immediately

Security Testing:
- [ ] Non-admin cannot access admin endpoints
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Rate limiting enforced (10/15min)
- [ ] Code validation requires authentication

**If tests fail:**
1. Check database migration completed
2. Review Aider's implementation of calculation logic
3. Verify Stripe webhook metadata includes discount code
4. Check email configuration for notifications
5. Ask Aider to fix specific failures

**Estimated Time:**
- Database migration: 15 min
- Aider builds files: 6 hours
- Your testing: 2 hours
- Bug fixes: 1 hour (if needed)

**After Part 17 Complete:**
- [ ] All 20 files created and tested
- [ ] Commission calculation accurate
- [ ] Discount codes working end-to-end
- [ ] Admin dashboard functional
- [ ] Emails sending correctly
- [ ] All Postman tests passing

**Status:** ⏳ **NOT STARTED**

---
```

Also update the metrics at the top of PROGRESS.md:

```markdown
## 📊 Overall Progress

| Metric | Status | Notes |
|--------|--------|-------|
| **Current Phase** | Phase 1 | Documentation & Policy Creation |
| **Total Files** | 0 / 190 (0%) | 170 core + 20 affiliate | ← UPDATE THIS
| **Parts Completed** | 0 / 17 (0%) | 16 core + 1 affiliate |  ← UPDATE THIS
| **Milestones Done** | 9 / 9 Phase 1 | Milestones 1.0-1.9 complete ✅ |
| **Estimated Time Remaining** | ~61 hours | Phase 2-4 (~53h) + Affiliate (8h) | ← UPDATE THIS
```

**Status:** ⏳ **TO BE UPDATED**

---

## 📊 SUMMARY

### Documents Requiring Updates: 7 Files

1. ✅ **CREATED:** `docs/AFFILIATE-MARKETING-DESIGN.md` (Complete design spec)
2. ⏳ **UPDATE:** `docs/v5-structure-division.md` (Add Part 17, update Part 2)
3. ⏳ **UPDATE:** `docs/trading_alerts_openapi.yaml` (Add 6 endpoints, update checkout)
4. ⏳ **UPDATE:** `docs/policies/03-architecture-rules.md` (Add Section 9)
5. ⏳ **UPDATE:** `docs/policies/05-coding-patterns.md` (Add Pattern 8)
6. ⏳ **UPDATE:** `postman/TESTING-GUIDE.md` (Add Scenario 6)
7. ⏳ **UPDATE:** `PROGRESS.md` (Add Part 17 to build order, update metrics)

### Estimated Time for Updates

- Document updates: ~2 hours
- Schema design review: ~30 min
- OpenAPI specification: ~1 hour
- Total: **~3.5 hours**

---

## 🎯 RECOMMENDED WORKFLOW

### Option A: Update Now (Before Phase 2)

**Pros:**
- ✅ All documentation complete before building starts
- ✅ Aider will know about affiliate system from the start
- ✅ OpenAPI types generated include affiliate endpoints

**Cons:**
- ⏱️ Delays starting Phase 2 by ~3.5 hours
- 📚 More upfront documentation work

**Workflow:**
1. Update all 7 documents now
2. Regenerate OpenAPI types (include affiliate endpoints)
3. Proceed with Phase 2 (Foundation)
4. Build Parts 1-16 (core features)
5. Build Part 17 (Affiliate Marketing) in Week 11

---

### Option B: Update Later (After Part 16 Complete) ✨ **RECOMMENDED**

**Pros:**
- ✅ Focus on core features first
- ✅ Can test PRO tier upgrades before adding discounts
- ✅ Less cognitive overhead during main build

**Cons:**
- ⏱️ Separate documentation update session needed later
- 📝 Need to remember to update before Part 17

**Workflow:**
1. Complete current Phase 1 (Milestones 1.6-1.7)
2. Proceed with Phase 2 (Foundation)
3. Build Parts 1-16 (core features) in Weeks 3-10
4. **PAUSE at Week 10:**
   - Update all 7 documents (3.5 hours)
   - Regenerate OpenAPI types
   - Run Aider comprehension tests again
5. Build Part 17 (Affiliate Marketing) in Week 11
6. Final testing and deployment (Week 12)

---

## ✅ YOUR NEXT ACTIONS

Based on your current milestone (1.6), here's what to do:

### Immediate (This Week):

1. **Review the design document**
   - Read: `docs/AFFILIATE-MARKETING-DESIGN.md`
   - Decide on open questions (Section 15)
   - Approve design or request changes

2. **Choose update workflow**
   - Option A: Update all docs now (before Phase 2)
   - Option B: Update later (after Part 16) ← **Recommended**

3. **Complete Phase 1**
   - Run Aider comprehension tests (Milestone 1.6)
   - Complete readiness check (Milestone 1.7)
   - Sign off on Phase 1

4. **Begin Phase 2**
   - Create Next.js project
   - Setup database
   - Generate OpenAPI types

### Later (Week 10 or 11):

5. **Update documentation** (If Option B)
   - Update all 7 documents listed above
   - Regenerate OpenAPI types
   - Test Aider comprehension

6. **Build Part 17**
   - Database migration
   - API endpoints
   - Admin dashboard
   - Checkout integration
   - Testing

---

## 📞 NEED HELP?

If you have questions about:
- **Design decisions** → Review Section 15 of `AFFILIATE-MARKETING-DESIGN.md`
- **Implementation details** → See Sections 4-11 of design doc
- **Testing strategy** → See Section 12 of design doc
- **Which documents to update** → This checklist (above)
- **When to update** → Choose Option A or B (above)

---

**Document Created:** 2025-11-14
**Status:** Ready for Review
**Next Step:** User decision on workflow option (A or B)
