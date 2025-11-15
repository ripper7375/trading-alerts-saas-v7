# PROMPT EXTENSION: Add Affiliate Discount to Settings Billing Tab

**APPEND THIS TO THE ORIGINAL PROMPT-11**

---

## ADDITIONAL REQUIREMENT: Affiliate Discount Information in Billing Tab

### 11. TAB 4: BILLING - ENHANCED WITH AFFILIATE DISCOUNT:

**Update the existing Billing tab content to include affiliate discount information**

---

#### A) CURRENT PLAN CARD UPDATE:

**Original structure:**
```
- Card Header: "Pro Plan" + "Current Plan" badge
- Price: $29/month
- Features list
- Next billing date
```

**Enhanced structure (when user has affiliate discount):**

**Add AFTER "Current Plan" badge:**
- **Discount indicator badge:**
  - Badge: "🎉 20% AFFILIATE DISCOUNT" (bg-green-100, text-green-800, px-3, py-1, rounded-full, text-sm, font-semibold)
  - Position: Next to "Current Plan" badge (flex gap-2)

**Update pricing display:**
- Container: flex items-baseline gap-3
- Original price: "$29" (text-2xl, text-gray-400, line-through)
- Discounted price: "$23.20" (text-4xl, font-bold, text-green-600)
- Period: "/month"
- Savings label below: "You save $5.80/month with referral code" (text-sm, text-green-600, mt-1)

**Add AFTER features list:**
- **Discount details section:**
  - Container: bg-green-50, border-l-4 border-green-500, p-3, rounded-lg, mt-4
  - Layout: flex items-start gap-2
  - Icon: ℹ️
  - Content:
    * Heading: "Lifetime Affiliate Discount" (font-semibold, text-green-800, text-sm)
    * Details: "Applied with code: **REF-ABC123XYZ**" (text-green-700, text-xs, mt-1)
    * Notice: "Your discount is permanent as long as you maintain your subscription" (text-green-600, text-xs, italic, mt-1)

**Update "Next billing date":**
- Original: "Next billing date: January 15, 2025"
- Enhanced: "Next billing date: January 15, 2025 (you'll be charged **$23.20**)"

---

#### B) NEW SUBSECTION: AFFILIATE DISCOUNT SUMMARY:

**Add AFTER "Payment Method" section and BEFORE "Usage Statistics":**

**Section heading:** "🎁 Your Affiliate Benefits" (text-lg, font-semibold, mb-4)

**Card:** bg-gradient-to-r from-green-50 to-blue-50, rounded-xl, p-6, border-2 border-green-200

**Layout: Grid 3 columns on desktop, 1 on mobile**

**Column 1 - Savings Summary:**
- Label: "Total Saved So Far" (text-sm, text-gray-600, mb-1)
- Value: "$17.40" (text-3xl, font-bold, text-green-600)
- Subtext: "Across 3 billing cycles" (text-xs, text-gray-500)

**Column 2 - Monthly Savings:**
- Label: "Monthly Savings" (text-sm, text-gray-600, mb-1)
- Value: "$5.80" (text-3xl, font-bold, text-blue-600)
- Subtext: "20% off regular price" (text-xs, text-gray-500)

**Column 3 - Your Code:**
- Label: "Your Referral Code" (text-sm, text-gray-600, mb-1)
- Code display:
  * Code: "REF-ABC123XYZ" (bg-white, px-3, py-2, rounded-lg, font-mono, text-sm, border border-gray-300)
  * Copy button: Small icon button next to code
- Subtext: "This code gave you the discount" (text-xs, text-gray-500, mt-1)

---

#### C) BILLING HISTORY TABLE UPDATE:

**Update billing history rows to reflect discount:**

**Original rows:**
```typescript
{ date: "Dec 15, 2024", description: "Pro Plan", amount: "$29.00", status: "Paid" }
{ date: "Nov 15, 2024", description: "Pro Plan", amount: "$29.00", status: "Paid" }
```

**Enhanced rows (with discount):**
```typescript
{
  date: "Dec 15, 2024",
  description: "Pro Plan (20% off)",
  amount: "$23.20",
  status: "Paid",
  originalAmount: "$29.00", // For tooltip
  savings: "$5.80" // For tooltip
}
```

**Add tooltip on hover over description:**
- Shows: "Original: $29.00 | Discount: -$5.80 | Paid: $23.20"
- Visual: Info icon (ℹ️) next to "(20% off)"

---

#### D) MANAGE SUBSCRIPTION SECTION UPDATE:

**Add new warning banner if user tries to cancel/downgrade:**

**Add BEFORE "Manage Subscription" button:**

- **Warning card** (only show when hovering cancel/downgrade buttons):
  - Container: bg-yellow-50, border-l-4 border-yellow-400, p-4, rounded-lg, mb-4
  - Icon: ⚠️ (text-xl)
  - Heading: "Important: You'll lose your affiliate discount" (font-semibold, text-yellow-800, mb-2)
  - Details:
    * "If you cancel or downgrade, you'll permanently lose your 20% discount" (text-yellow-700, text-sm)
    * "You will NOT be able to re-apply the affiliate code later" (text-yellow-700, text-sm, font-semibold)
  - List of what you'll lose:
    * "❌ $5.80/month savings ($69.60/year)"
    * "❌ Your exclusive affiliate pricing"
    * "❌ Cannot be reactivated after cancellation"

**Update "Manage Subscription" button:**
- Add dropdown with options:
  * "Change payment method"
  * "Switch to annual billing"
  * "Update plan" (disabled if affiliate discount active - shows tooltip)
  * Separator
  * "Cancel subscription" (text-red-600)

---

#### E) TECHNICAL IMPLEMENTATION UPDATE:

**Update TypeScript interface for Billing tab state:**

```typescript
interface BillingData {
  currentPlan: {
    name: string
    price: number // 23.20 or 29.00
    originalPrice?: number // 29.00 (if discount applied)
    features: string[]
    nextBillingDate: string
    memberSince: string
  }
  affiliateDiscount?: {
    active: boolean
    code: string
    discountPercent: number // 20
    monthlySavings: number // 5.80
    totalSaved: number // 17.40
    cyclesSaved: number // 3
    appliedDate: string // When discount was first applied
  }
  paymentMethod: {
    type: string
    last4: string
    expiry: string
  }
  usageStats: {
    apiCalls: { used: number; total: number }
    alertsSent: { used: number; total: number }
  }
  billingHistory: Array<{
    date: string
    description: string
    amount: string
    originalAmount?: string
    savings?: string
    status: string
  }>
}
```

**Conditional rendering logic:**

```typescript
const BillingTab = ({ billingData }: { billingData: BillingData }) => {
  const hasDiscount = billingData.affiliateDiscount?.active || false

  return (
    <div>
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex gap-2">
            <Badge>Current Plan</Badge>
            {hasDiscount && (
              <Badge className="bg-green-100 text-green-800">
                🎉 20% AFFILIATE DISCOUNT
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Price display */}
          <div className="flex items-baseline gap-3">
            {hasDiscount && (
              <span className="text-2xl text-gray-400 line-through">
                ${billingData.currentPlan.originalPrice}
              </span>
            )}
            <span className="text-4xl font-bold text-green-600">
              ${billingData.currentPlan.price}
            </span>
            <span className="text-gray-600">/month</span>
          </div>

          {hasDiscount && (
            <p className="text-sm text-green-600 mt-1">
              You save ${billingData.affiliateDiscount.monthlySavings}/month
              with referral code
            </p>
          )}

          {/* Rest of content */}
        </CardContent>
      </Card>

      {/* Affiliate Benefits Section (only if discount active) */}
      {hasDiscount && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-4">🎁 Your Affiliate Benefits</h3>
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            {/* Savings summary grid */}
          </Card>
        </section>
      )}

      {/* Rest of billing tab content */}
    </div>
  )
}
```

---

#### F) MOCK DATA UPDATE:

**Add affiliate discount data to sample:**

```typescript
const sampleBillingDataWithDiscount: BillingData = {
  currentPlan: {
    name: "Pro Plan",
    price: 23.20,
    originalPrice: 29.00,
    features: ["Unlimited alerts", "Advanced analytics", "Priority support"],
    nextBillingDate: "January 15, 2025",
    memberSince: "October 15, 2024"
  },
  affiliateDiscount: {
    active: true,
    code: "REF-PARTNER2024",
    discountPercent: 20,
    monthlySavings: 5.80,
    totalSaved: 17.40,
    cyclesSaved: 3,
    appliedDate: "October 15, 2024"
  },
  billingHistory: [
    {
      date: "Dec 15, 2024",
      description: "Pro Plan (20% off)",
      amount: "$23.20",
      originalAmount: "$29.00",
      savings: "$5.80",
      status: "Paid"
    },
    // ... more entries
  ]
}
```

---

#### G) VISUAL ENHANCEMENTS:

**Color coding:**
- Discount indicators: Green (green-600, green-100)
- Savings text: Green (text-green-600)
- Warning (cancel): Yellow/Orange (yellow-400, orange-600)
- Current plan: Blue (existing)

**Interactive elements:**
- Hover on billing history description → show tooltip with breakdown
- Click on referral code → copy to clipboard with toast notification
- Hover on "Cancel subscription" → show warning banner

**Responsive design:**
- 3-column affiliate benefits grid → 1 column on mobile
- Discount badges wrap on mobile
- Code display scrolls horizontally if too long on mobile

---

**INTEGRATION NOTES:**
- Only show affiliate content if `affiliateDiscount.active === true`
- All original content remains when no discount
- Graceful degradation - page works without affiliate data
- Clear visual distinction between discounted and regular pricing

**END OF EXTENSION**
