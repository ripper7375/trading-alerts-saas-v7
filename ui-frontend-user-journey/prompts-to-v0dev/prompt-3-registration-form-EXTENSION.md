# PROMPT EXTENSION: Add Affiliate Code to Registration Form

**APPEND THIS TO THE ORIGINAL PROMPT-3**

---

## ADDITIONAL REQUIREMENT: Affiliate Referral Code Input

### 9. AFFILIATE CODE INPUT FIELD (NEW):

**Position:** Add AFTER the "Confirm Password" field and BEFORE the "Terms Checkbox"

**Layout:**
- Label: "Referral Code (Optional)" (font-medium, text-gray-700)
- Helper text: "Have an affiliate code? Get 20% off PRO forever!" (text-xs, text-blue-600, mb-1)
- Input section (flex items-center gap-2):
  - Text input:
    * placeholder="REF-ABC123XYZ"
    * Upper case transformation (automatically converts lowercase to uppercase)
    * Pattern validation: Must match format REF-XXXXXXXXXX (12 chars after REF-)
    * className: "flex-1" (to share space with verify button)
  - Verify button:
    * Text: "Verify"
    * className: "px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm font-medium"
    * onClick: Check if code is valid (API call or mock validation)

**States:**

1. **Empty state (default):**
   - Input: Normal border (border-gray-300)
   - No icon

2. **Typing state:**
   - Input: Normal border
   - "Verify" button enabled when input length >= 15 characters

3. **Valid code (after verify):**
   - Input: border-green-500, bg-green-50
   - Green checkmark icon appears on the right of input
   - Success message below:
     * "✅ Valid code! You'll get 20% off PRO ($23.20/month instead of $29)"
     * className: "text-sm text-green-600 mt-1 flex items-center gap-1"
   - Discount badge appears: "🎉 20% DISCOUNT APPLIED" (bg-green-100, text-green-800, px-3, py-1, rounded-full, text-sm, font-semibold, mt-2, inline-block)

4. **Invalid code:**
   - Input: border-red-500, bg-red-50
   - Red X icon appears on the right
   - Error message below:
     * "❌ Invalid or expired referral code"
     * className: "text-sm text-red-600 mt-1 flex items-center gap-1"

5. **Pre-filled from URL:**
   - If page loads with `?ref=AFFILIATE_CODE` parameter:
     * Auto-fill the input field
     * Auto-verify the code
     * Show success state if valid

### 10. UPDATED VALIDATION SCHEMA:

```typescript
const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  referralCode: z.string().optional(), // NEW: Optional affiliate code
  agreedToTerms: z.boolean().refine((val) => val === true, "You must agree to terms")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})
```

### 11. FORM SUBMISSION UPDATE:

When form is submitted:
1. Include `referralCode` in the submitted data
2. If code is verified and valid, include discount flag: `{ discountApplied: true, discountPercent: 20 }`
3. Pass affiliate code to backend for commission tracking

**Mock submit example:**
```typescript
const onSubmit = async (data: RegistrationFormData) => {
  setIsLoading(true)

  // Include affiliate code if present
  const submitData = {
    ...data,
    referralCode: verifiedCode || null,
    discountApplied: isCodeValid,
  }

  console.log("Form submitted with affiliate code:", submitData)

  // API call to create account
  await createAccount(submitData)

  setIsLoading(false)
  setIsSuccess(true)
}
```

### 12. SUCCESS MESSAGE UPDATE:

**Original success message:**
- "Account created successfully!"
- "Redirecting to dashboard..."

**Updated success message (when discount applied):**
- Green checkmark animation
- "Account created successfully!"
- **NEW:** "🎉 20% discount activated! You'll pay $23.20/month for PRO."
- "Redirecting to dashboard..."

### 13. FOOTER LINKS UPDATE:

**Add new link after "Forgot password?":**
- Separator: "—" (text-gray-300)
- Link: "Don't have a referral code? Join our Affiliate Program" (text-blue-600, hover:underline, text-sm)
- Opens: /affiliate/join page

### 14. TECHNICAL IMPLEMENTATION:

```typescript
// State management
const [referralCode, setReferralCode] = useState('')
const [verifiedCode, setVerifiedCode] = useState<string | null>(null)
const [isCodeValid, setIsCodeValid] = useState(false)
const [codeError, setCodeError] = useState('')

// Pre-fill from URL on mount
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const refCode = urlParams.get('ref')
  if (refCode) {
    setReferralCode(refCode)
    verifyCode(refCode)
  }
}, [])

// Verify code function
const verifyCode = async (code: string) => {
  // Mock validation (replace with API call)
  const isValid = code.startsWith('REF-') && code.length === 15

  if (isValid) {
    setIsCodeValid(true)
    setVerifiedCode(code)
    setCodeError('')
  } else {
    setIsCodeValid(false)
    setVerifiedCode(null)
    setCodeError('Invalid or expired referral code')
  }
}
```

### 15. VISUAL LAYOUT UPDATE:

**Order of fields (top to bottom):**
1. Full Name
2. Email
3. Password (with requirements)
4. Confirm Password
5. **→ Referral Code (NEW)** ← Insert here
6. Terms Checkbox
7. Submit Button
8. Footer Links

### 16. MOBILE RESPONSIVE:

- Input + Verify button: Stack vertically on very small screens (<360px)
- Discount badge: Full width on mobile, text-center
- Success message: Text wrap, maintain gap icon spacing

### 17. ACCESSIBILITY:

- Add aria-label="Referral code input" to input
- Add aria-describedby linking to helper text
- Announce validation result to screen readers
- Keyboard navigation: Tab between input and verify button

---

**VISUAL HIERARCHY:**
1. Optional field - doesn't block registration
2. Clear benefit messaging (20% off)
3. Visual feedback (green/red states)
4. Prominent discount badge when valid

**END OF EXTENSION**
