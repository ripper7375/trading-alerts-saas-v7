# PROMPT EXTENSION: Add Affiliate Program to Marketing Homepage

**APPEND THIS TO THE ORIGINAL PROMPT-1**

---

## ADDITIONAL REQUIREMENT: Affiliate Program Promotion

### 8. PRO TIER PRICING UPDATE (Section 3):

**Update PRO pricing card to show affiliate discount option:**

**CARD 2: PRO TIER - Enhanced**

**Original content:**
- Badge: "PRO TIER ⭐"
- Price: "$29/month"
- Features list
- CTA: "Start 7-Day Trial"

**Add BEFORE the price:**
- **Discount option toggle/banner:**
  - Container: bg-yellow-50, border-l-4 border-yellow-400, p-2, rounded-lg, mb-3
  - Text: "💡 Have a referral code? Get 20% off!" (text-sm, font-medium, text-yellow-800)
  - Link: "Apply code →" (text-yellow-600, text-xs, underline, cursor-pointer)

**Update pricing display with "from" qualifier:**
- Label: "Starting at" (text-sm, text-gray-500, uppercase, font-semibold, mb-1)
- Price: "from $23.20/month" (text-5xl, font-bold)
- Details below: "($29/month without referral code)" (text-sm, text-gray-500)

**Update CTA:**
- Primary button: "Start 7-Day Trial"
- Secondary link below: "Have a referral code? Apply here →" (text-blue-600, text-sm, hover:underline, cursor-pointer)

### 9. NEW SECTION: AFFILIATE PROGRAM CALLOUT:

**Add AFTER "Pricing Preview" section and BEFORE "Footer":**

**Position:** Full-width section, py-16, px-4

**Background:** bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50

**Layout:** max-w-6xl mx-auto, text-center

**Content:**

1. **Icon:** 🤝 (text-6xl, mb-4)

2. **Heading:** "Become an Affiliate Partner" (text-4xl, font-bold, bg-gradient-to-r from-blue-600 to-purple-600, bg-clip-text, text-transparent, mb-4)

3. **Subheading:** "Earn 20% commission for every PRO subscriber you refer" (text-xl, text-gray-700, mb-6)

4. **Features Grid (3 columns on desktop, 1 on mobile):**

   **Column 1:**
   - Icon: 💰 (text-4xl, mb-2)
   - Title: "Generous Commissions" (font-semibold, text-lg, mb-1)
   - Text: "Earn 20% of every subscription ($5.80/month per referral)" (text-sm, text-gray-600)

   **Column 2:**
   - Icon: 🔗 (text-4xl, mb-2)
   - Title: "Easy to Share" (font-semibold, text-lg, mb-1)
   - Text: "Get your unique referral code and share it anywhere" (text-sm, text-gray-600)

   **Column 3:**
   - Icon: 📊 (text-4xl, mb-2)
   - Title: "Track Performance" (font-semibold, text-lg, mb-1)
   - Text: "Real-time dashboard to monitor your earnings" (text-sm, text-gray-600)

5. **Stats Row (3 stats, flex justify-center gap-12):**

   - Stat 1: "500+ Active Affiliates" (text-3xl, font-bold, text-blue-600 + text-sm, text-gray-600)
   - Stat 2: "$50K+ Paid Out" (text-3xl, font-bold, text-green-600 + text-sm, text-gray-600)
   - Stat 3: "No Approval Required" (text-3xl, font-bold, text-purple-600 + text-sm, text-gray-600)

6. **CTA Buttons (flex justify-center gap-4, mt-8):**
   - Primary: "Join Affiliate Program" (bg-blue-600, text-white, px-8, py-4, text-lg, rounded-xl, shadow-lg, hover:bg-blue-700)
   - Secondary: "Learn More →" (border-2, border-blue-600, text-blue-600, px-8, py-4, text-lg, rounded-xl, hover:bg-blue-50)

7. **Fine print (mt-6):**
   - "Quick signup • No minimum sales • Monthly payouts" (text-sm, text-gray-500)

### 10. NAVIGATION BAR UPDATE (Section 5):

**Add new navigation link:**

**Original nav:**
- Logo: "📊 Trading Alerts"
- Right side: [Login] [Sign Up]

**Enhanced nav (add before Login):**
- Desktop navigation (hidden on mobile):
  - Links: [Features] [Pricing] [**Affiliates**] [Login] [Sign Up]
  - "Affiliates" link: text-blue-600, font-medium, hover:underline
- Mobile menu (hamburger):
  - Add "Become an Affiliate" menu item

### 11. FOOTER UPDATE (Section 4):

**Add new link category:**

**Original footer:**
- Company name + Copyright
- Links: Privacy Policy, Terms of Service, Contact

**Enhanced footer (add two-column layout):**

**Left column:**
- Company name: "Trading Alerts"
- Copyright: "© 2025 Trading Alerts. All rights reserved."

**Right column (2 groups):**

Group 1 - Product:
- Pricing
- Features
- FAQ

Group 2 - Partners:
- **Affiliate Program** ← NEW
- **Become a Partner** ← NEW
- Privacy Policy
- Terms of Service
- Contact

### 12. HERO SECTION UPDATE (Minor):

**Add trust badge below CTA buttons:**

**Original:**
- Primary: "Get Started Free"
- Secondary: "See Pricing"

**Add below buttons (text-center, mt-6):**
- "✨ Trusted by 10,000+ traders • 🤝 Join our affiliate program and earn" (text-sm, text-gray-600)
- "affiliate program" is clickable link → scrolls to affiliate section

### 13. URL PARAMETER SUPPORT:

**Add affiliate code URL parameter handling:**

```typescript
import { useSearchParams } from 'next/navigation'

export default function HomePage() {
  const searchParams = useSearchParams()
  const affiliateCode = searchParams.get('ref')

  // If ?ref=CODE in URL, show special banner and update pricing
  const showAffiliateBanner = !!affiliateCode

  return (
    <div>
      {/* Show banner at top if affiliate code present */}
      {showAffiliateBanner && (
        <div className="bg-green-500 text-white py-3 px-4 text-center">
          <p className="text-sm">
            🎉 <strong>Special Offer!</strong> Sign up now with code{" "}
            <code className="bg-white/20 px-2 py-1 rounded">{affiliateCode}</code>
            {" "}and get <strong>20% off PRO</strong> forever!
          </p>
        </div>
      )}

      {/* Rest of homepage */}
    </div>
  )
}
```

### 14. PRICING SECTION ENHANCEMENT:

**Add visual indicator when affiliate code is in URL:**

**PRO card gets additional badge if ?ref=CODE:**
- Position: Absolute, top-left (opposite to "Most Popular")
- Badge: "20% OFF WITH YOUR CODE" (bg-green-500, text-white, px-3, py-1, rounded-full, text-xs, font-bold, shadow-lg)
- Pulsing animation to draw attention

### 15. TECHNICAL IMPLEMENTATION:

```typescript
export default function HomePage() {
  const searchParams = useSearchParams()
  const affiliateCode = searchParams.get('ref')

  // Pricing calculation
  const proPriceMonthly = affiliateCode ? 23.20 : 29.00

  return (
    <div className="min-h-screen flex flex-col">
      {/* Affiliate banner if code present */}
      {affiliateCode && <AffiliateBanner code={affiliateCode} />}

      {/* Hero */}
      <section>{/* ... */}</section>

      {/* Features */}
      <section>{/* ... */}</section>

      {/* Pricing with discount */}
      <section>
        <PricingCards
          proPrice={proPriceMonthly}
          hasDiscount={!!affiliateCode}
        />
      </section>

      {/* NEW: Affiliate program section */}
      <section>
        <AffiliateProgramCallout />
      </section>

      {/* Footer */}
      <footer>{/* ... */}</footer>
    </div>
  )
}
```

### 16. RESPONSIVE DESIGN:

- Affiliate section: 3 columns → 1 column on mobile
- Stats row: Wrap on smaller screens, maintain spacing
- Banner: Full width, text-center on mobile
- Footer groups: Stack vertically on mobile

### 17. SOCIAL PROOF UPDATE:

**Update hero subheading trust indicator:**

**Original:**
- "Join thousands of traders using our platform"

**Enhanced:**
- "Join 10,000+ traders • 500+ affiliate partners earn with us"
- Link "affiliate partners" → scrolls to affiliate section

---

**VISUAL HIERARCHY:**
1. Subtle affiliate hint in pricing section
2. Dedicated affiliate section with clear value proposition
3. Green banner if referral code in URL (high visibility)
4. Footer and nav links for discoverability

**CONVERSION OPTIMIZATION:**
- Multiple touchpoints for affiliate program (nav, pricing hint, dedicated section, footer)
- Clear commission value ($5.80/month)
- Low friction (no approval required)
- Trust signals (500+ affiliates, $50K paid)

**END OF EXTENSION**
