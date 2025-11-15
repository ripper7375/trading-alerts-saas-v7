# PROMPT EXTENSION: Add Affiliate Discount to Billing Page

**APPEND THIS TO THE ORIGINAL PROMPT-8**

---

## ADDITIONAL REQUIREMENT: Show Affiliate Discount Information

### 8. AFFILIATE DISCOUNT INDICATOR (in Current Plan Card):

**Add AFTER the member since date and BEFORE features grid:**

- **Discount Badge Section** (conditional - only shown if user signed up via affiliate):
  - Container: bg-white/20, rounded-lg, p-3, mt-4, mb-4, border border-white/30
  - Layout: flex items-center gap-3
  - Icon: 🎉 (text-2xl)
  - Content (flex-1):
    * Heading: "Affiliate Discount Active" (font-semibold, text-lg)
    * Details: "20% off • Code: REF-ABC123XYZ" (text-white/90, text-sm)
    * Savings: "You save $5.80/month" (text-white/80, text-xs)

**Update pricing display in Current Plan Card:**

- **WITHOUT affiliate discount (original):**
  - Price: "$29/month" (text-5xl, font-bold)

- **WITH affiliate discount (new):**
  - Container: flex items-baseline gap-3
  - Original price: "$29" (text-3xl, text-white/60, line-through)
  - Discounted price: "$23.20" (text-5xl, font-bold, text-white)
  - Period: "/month" (text-xl, text-white/90)
  - Savings label: "Lifetime 20% off" (bg-green-400, text-green-900, px-2 py-1, rounded-full, text-xs, font-semibold, ml-2)

### 9. BILLING HISTORY UPDATE:

**Update table data to show discounted amounts:**

**WITHOUT discount (original):**
```
| Feb 15, 2025 | Pro Plan - Monthly | $29.00 | Paid ✓ |
| Jan 15, 2025 | Pro Plan - Monthly | $29.00 | Paid ✓ |
| Dec 15, 2024 | Pro Plan - Monthly | $29.00 | Paid ✓ |
```

**WITH discount (new):**
```
| Feb 15, 2025 | Pro Plan - Monthly (20% off) | $23.20 | Paid ✓ |
| Jan 15, 2025 | Pro Plan - Monthly (20% off) | $23.20 | Paid ✓ |
| Dec 15, 2024 | Pro Plan - Monthly (20% off) | $23.20 | Paid ✓ |
```

**Add tooltip/hover on description column:**
- Hover text: "Original price: $29.00 • Affiliate discount: -$5.80 • Total: $23.20"
- Visual: Small info icon (ℹ️) next to "(20% off)" text

### 10. RENEWAL DATE UPDATE:

**Add discount renewal notice:**

**WITHOUT discount:**
- "Renews on Feb 15, 2025" (text-xl, text-white/90)

**WITH discount:**
- "Renews on Feb 15, 2025 at $23.20" (text-xl, text-white/90)
- Sub-text: "Your 20% affiliate discount is permanent" (text-sm, text-white/80, mt-1)

### 11. SUBSCRIPTION ACTIONS UPDATE:

**Update "Switch to Annual" card pricing:**

**WITHOUT discount:**
- "Save $58/year by switching"
- Button click → Charge $290/year

**WITH discount:**
- "Save $58/year by switching"
- Discount details: "Annual price with your 20% discount: $232/year" (text-sm, text-green-600, font-medium, mt-1)
- Original annual: "$290/year" (text-gray-400, line-through, text-sm)
- Discounted annual: "$232/year" (text-green-600, font-semibold, text-lg)
- Total savings: "Save $127.60/year (includes affiliate discount)" (text-xs, text-gray-600)

### 12. NEW SECTION: AFFILIATE DISCOUNT DETAILS:

**Add AFTER "Usage Statistics" section and BEFORE "Billing History":**

- Section heading: "🎁 Your Affiliate Discount" (text-2xl, font-bold, mb-6, mt-12)
- Card: bg-gradient-to-r from-green-50 to-blue-50, border-2 border-green-200, rounded-xl, shadow-lg, p-6
- Layout (grid 2 columns on desktop, 1 on mobile):

  **Left Column:**
  - Icon: 🤝 (text-4xl, mb-3)
  - Heading: "Lifetime 20% Discount" (text-2xl, font-bold, text-gray-900, mb-2)
  - Description: "You're saving $5.80/month ($69.60/year) with your affiliate code." (text-gray-700, mb-4)
  - Code display:
    * Label: "Your referral code:" (text-sm, text-gray-600)
    * Code: "REF-ABC123XYZ" (bg-white, px-4, py-2, rounded-lg, font-mono, text-lg, border-2 border-gray-300, mt-1)

  **Right Column (Stats):**
  - Stat 1:
    * Label: "Total Saved So Far" (text-sm, text-gray-600)
    * Value: "$17.40" (text-3xl, font-bold, text-green-600)
    * Subtext: "Across 3 billing cycles" (text-xs, text-gray-500)
  - Stat 2 (mt-4):
    * Label: "Projected Annual Savings" (text-sm, text-gray-600)
    * Value: "$69.60" (text-2xl, font-bold, text-blue-600)
    * Subtext: "Over 12 months" (text-xs, text-gray-500)

**Important Notice (below card):**
- Text: "ℹ️ Your discount is permanent and will continue as long as you maintain your subscription. If you cancel and re-subscribe, the discount will no longer apply." (text-sm, text-gray-600, italic, mt-4)

### 13. DOWNGRADE SECTION UPDATE:

**Add affiliate discount warning:**

**Original warning list:**
```
⚠️ Limited to 5 symbols (currently: 10)
⚠️ Only 3 timeframes (currently: 9)
⚠️ Only 5 alerts (currently: 20)
```

**Add new warning:**
```
⚠️ Limited to 5 symbols (currently: 10)
⚠️ Only 3 timeframes (currently: 9)
⚠️ Only 5 alerts (currently: 20)
⚠️ You'll LOSE your 20% affiliate discount permanently (cannot be re-applied)
```

- Make last warning more prominent: text-red-600, font-semibold, bg-red-50, p-2, rounded

### 14. TECHNICAL IMPLEMENTATION:

```typescript
interface BillingPageProps {
  tier?: "FREE" | "PRO"
  subscriptionStatus?: "active" | "trial" | "canceled"
  affiliateDiscount?: {
    active: boolean
    code: string
    discountPercent: number // 20
    monthlySavings: number // 5.80
    totalSaved: number // 17.40
    cyclesSaved: number // 3
  }
}

export default function BillingPage({
  tier = "PRO",
  subscriptionStatus = "active",
  affiliateDiscount = null // null if no discount, object if active
}: BillingPageProps) {

  // Price calculation
  const baseMonthlyPrice = 29.00
  const baseYearlyPrice = 290.00

  const monthlyPrice = affiliateDiscount?.active
    ? baseMonthlyPrice * (1 - affiliateDiscount.discountPercent / 100)
    : baseMonthlyPrice

  const yearlyPrice = affiliateDiscount?.active
    ? baseYearlyPrice * (1 - affiliateDiscount.discountPercent / 100)
    : baseYearlyPrice

  // Update billing history
  const billingHistory = [
    {
      date: "Feb 15, 2025",
      description: affiliateDiscount?.active
        ? "Pro Plan - Monthly (20% off)"
        : "Pro Plan - Monthly",
      amount: `$${monthlyPrice.toFixed(2)}`,
      status: "Paid",
    },
    // ... more entries
  ]

  return (
    // ... JSX with conditional discount display
  )
}
```

### 15. MOCK DATA UPDATE:

**Add affiliate discount data:**
```typescript
const sampleDataWithDiscount = {
  tier: "PRO",
  subscriptionStatus: "active",
  affiliateDiscount: {
    active: true,
    code: "REF-PARTNER2024",
    discountPercent: 20,
    monthlySavings: 5.80,
    totalSaved: 17.40,
    cyclesSaved: 3
  }
}
```

### 16. RESPONSIVE DESIGN:

- Affiliate discount card: Stack stats vertically on mobile
- Code display: Full width on mobile, horizontal scroll for long codes
- Two-column grid collapses to single column on mobile (<768px)

---

**VISUAL HIERARCHY:**
1. Discount badge prominent in gradient card
2. Green/blue gradient for affiliate section stands out
3. Clear before/after pricing comparison
4. Warning about losing discount in downgrade section

**END OF EXTENSION**
