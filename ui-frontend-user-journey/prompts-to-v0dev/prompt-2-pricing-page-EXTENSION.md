# PROMPT EXTENSION: Add Affiliate Discount to Pricing Page

**APPEND THIS TO THE ORIGINAL PROMPT-2**

---

## ADDITIONAL REQUIREMENT: Affiliate Referral Discount Feature

### 8. AFFILIATE DISCOUNT DISPLAY (on PRO TIER CARD):

**Add to PRO TIER card header (between badge and price):**

- **Discount Banner** (conditional - shown when `?ref=AFFILIATE_CODE` is in URL):
  - Container: bg-yellow-50, border-l-4 border-yellow-400, p-3, mb-4, rounded-lg
  - Icon: 🎉 (text-xl, inline)
  - Text: "**Affiliate Discount Active!**" (font-semibold, text-yellow-800)
  - Subtext: "20% off applied with code: **REF-ABC123**" (text-sm, text-yellow-700)

**Update PRO TIER pricing display:**

- **Original implementation (no discount):**
  - Price: "$29" (text-6xl, font-bold)
  - Period: "/month"

- **New implementation (with affiliate discount):**
  - Original price: "$29" (text-3xl, text-gray-400, line-through, mr-2)
  - Discounted price: "$23.20" (text-6xl, font-bold, text-green-600)
  - Period: "/month"
  - Savings text: "Save $5.80/month with affiliate code!" (text-sm, text-green-600, font-medium, mt-1)

**Update yearly option:**
- Original: "$290/year" → New: "$232/year" (with discount)
- Savings: "Save $58 + $69.60 affiliate discount = $127.60 total!" (text-green-600)

### 9. CTA BUTTON UPDATE (PRO TIER):

- **Without discount:**
  - Button text: "Start 7-Day Trial"
  - Note: "7-day free trial, then $29/month"

- **With discount:**
  - Button text: "Start 7-Day Trial (20% Off)"
  - Note: "7-day free trial, then $23.20/month with affiliate code"

### 10. COMPARISON TABLE UPDATE:

**Add new row to the detailed comparison table:**

| Feature | FREE | PRO |
|---------|------|-----|
| ... (all existing rows) ... |
| **Affiliate Discount Eligible** | ❌ | ✅ 20% off with referral code |

### 11. FAQ UPDATE:

**Add new FAQ item:**

**Question:** "What is the affiliate discount?"
**Answer:** "When you sign up using an affiliate referral code, you'll receive 20% off your PRO subscription permanently. This brings the monthly price from $29 to $23.20 ($290 to $232 yearly). The discount applies as long as you maintain your subscription. You can apply an affiliate code during registration."

### 12. FINAL CTA UPDATE:

**Add promotional banner above final CTA:**
- Container: bg-gradient-to-r from-green-50 to-blue-50, border-2 border-green-200, rounded-xl, p-6, mb-8
- Icon: 🤝 (text-3xl)
- Heading: "Have an affiliate code?" (text-2xl, font-bold, mb-2)
- Text: "Get 20% off PRO tier forever when you sign up with a referral code from our partners." (text-gray-700, mb-4)
- Link: "Learn about our Affiliate Program →" (text-blue-600, hover:underline, font-medium)

### 13. TECHNICAL IMPLEMENTATION:

```typescript
// Add to component
import { useSearchParams } from 'next/navigation'

export default function PricingPage() {
  const searchParams = useSearchParams()
  const affiliateCode = searchParams.get('ref') // Get ?ref=CODE from URL

  // Price calculation
  const proMonthlyPrice = affiliateCode ? 23.20 : 29.00
  const proYearlyPrice = affiliateCode ? 232.00 : 290.00
  const monthlySavings = affiliateCode ? 5.80 : 0

  // In JSX, conditionally render discount banner and updated pricing
  // Store affiliate code in localStorage or pass to checkout

  return (
    // ... existing JSX with conditional discount display
  )
}
```

### 14. URL PARAMETER HANDLING:

- When page loads with `?ref=AFFILIATE_CODE` parameter:
  - Display yellow discount banner on PRO card
  - Show discounted pricing
  - Update CTA buttons
  - Store affiliate code in component state
  - When user clicks "Start Trial", pass affiliate code to checkout/registration

### 15. MOBILE RESPONSIVE:

- Discount banner: Full width on mobile, text-center
- Original/discounted price: Stack vertically on mobile
- Affiliate code text: Truncate long codes with ellipsis on mobile

---

**VISUAL HIERARCHY:**
1. PRO card stands out with blue border (existing)
2. Discount banner adds yellow accent when affiliate code present
3. Green pricing emphasizes savings
4. Clear before/after pricing comparison

**END OF EXTENSION**
