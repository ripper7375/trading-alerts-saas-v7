# Approval Policies for Aider with MiniMax M2

## Purpose

This document defines when Aider (using MiniMax M2 API) should **auto-approve**, **auto-fix**, or **escalate** during autonomous development. These policies ensure quality code while minimizing human intervention for repetitive decisions.

---

## 1. AUTO-APPROVE CONDITIONS

Aider should **automatically commit** code when ALL of the following conditions are met:

### 1.1 Code Quality Requirements

✅ **TypeScript Types:**
- All functions have explicit return types
- All parameters have type annotations
- No `any` types (except in rare, justified cases with JSDoc explanation)
- Interfaces/types defined for complex objects

**Why this matters:** TypeScript catches bugs before runtime. Without proper types, you lose type safety benefits and may ship bugs to production.

**Example - Good:**
```typescript
function createAlert(userId: string, symbol: string, timeframe: string): Promise<Alert> {
  // Implementation
}
```

**Example - Bad:**
```typescript
function createAlert(userId, symbol, timeframe) {  // ❌ No types
  // Implementation
}
```

---

✅ **Error Handling:**
- All API routes wrapped in try/catch
- All Prisma queries wrapped in try/catch
- All external API calls (MT5, Stripe) wrapped in try/catch
- User-friendly error messages returned (no raw error objects)
- Errors logged with context (user ID, action attempted)

**Why this matters:** Unhandled errors crash the app. Proper error handling keeps the app running and helps you debug issues.

**Example - Good:**
```typescript
export async function GET(req: Request) {
  try {
    const data = await prisma.alert.findMany();
    return Response.json(data);
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return Response.json(
      { error: 'Failed to fetch alerts. Please try again.' },
      { status: 500 }
    );
  }
}
```

---

✅ **JSDoc Comments:**
- All public functions have JSDoc comments
- JSDoc includes: description, @param for each parameter, @returns
- Complex logic has inline comments explaining "why", not "what"

**Why this matters:** JSDoc helps other developers (and future you) understand code. IDEs show JSDoc in autocomplete, making the API self-documenting.

**Example - Good:**
```typescript
/**
 * Creates a new alert for a user with tier validation
 * @param userId - User's unique identifier
 * @param symbol - Trading symbol (e.g., "EURUSD")
 * @param timeframe - Chart timeframe (e.g., "H1")
 * @returns Promise resolving to created alert
 * @throws ForbiddenError if user's tier cannot access symbol/timeframe
 */
async function createAlert(userId: string, symbol: string, timeframe: string): Promise<Alert> {
  // Implementation
}
```

---

### 1.2 Security Requirements

✅ **No Secrets in Code:**
- No API keys, passwords, tokens in code
- All secrets in .env files (gitignored)
- .env.example provided with placeholder values
- No secrets in error messages or logs

**Why this matters:** Committing secrets to GitHub exposes them publicly. Attackers scan GitHub for exposed keys and exploit them within minutes.

**Example - Good:**
```typescript
const apiKey = process.env.MT5_API_KEY;  // ✅ From environment
```

**Example - Bad:**
```typescript
const apiKey = "sk_live_abc123xyz";  // ❌ Hardcoded secret
```

---

✅ **Input Validation:**
- All user inputs validated with Zod schemas
- SQL injection prevented (Prisma handles this, but validate inputs)
- XSS prevention (sanitize user-generated content)
- All API route inputs validated before use

**Why this matters:** User inputs are the #1 attack vector. Validation prevents malicious data from reaching your database or being executed as code.

**Example - Good:**
```typescript
import { z } from 'zod';

const createAlertSchema = z.object({
  symbol: z.string().min(1).max(20),
  timeframe: z.enum(['M5', 'M15', 'M30', 'H1', 'H2', 'H4', 'H8', 'H12', 'D1']),
  condition: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  const body = await req.json();
  const validated = createAlertSchema.parse(body);  // ✅ Throws if invalid
  // Use validated data
}
```

---

✅ **Tier Validation:**
- All endpoints that serve symbol/timeframe data validate tier access
- FREE tier users cannot access PRO-only symbols (AUDJPY, GBPJPY, etc.)
- FREE tier users cannot access PRO-only timeframes (M5, M15, M30, H2, H8, H12)
- Validation happens on BOTH Next.js API routes AND Flask MT5 service

**Why this matters:** Tier validation is your business model. Without it, users get PRO features for free, and you lose revenue.

**Example - Good:**
```typescript
import { validateChartAccess } from '@/lib/tier/validation';

export async function GET(req: Request, { params }: { params: { symbol: string; timeframe: string } }) {
  const session = await getServerSession();
  const userTier = session?.user?.tier || 'FREE';

  // Validate tier access - throws ForbiddenError if unauthorized
  validateChartAccess(userTier, params.symbol, params.timeframe);  // ✅

  // Proceed with data fetching...
}
```

---

### 1.3 API Contract Compliance

✅ **Matches OpenAPI Specification:**
- Response structure matches trading_alerts_openapi.yaml or flask_mt5_openapi.yaml exactly
- All required fields present
- Correct HTTP status codes (200, 400, 401, 403, 404, 500)
- Response types match auto-generated TypeScript types in lib/api-client/

**Why this matters:** OpenAPI spec is your contract with the frontend. Violating it breaks the frontend and causes runtime errors.

**Example - From OpenAPI:**
```yaml
# trading_alerts_openapi.yaml
AlertResponse:
  type: object
  required: [id, userId, symbol, timeframe, condition, isActive, createdAt]
  properties:
    id: { type: string }
    userId: { type: string }
    symbol: { type: string }
    timeframe: { type: string }
    condition: { type: string }
    isActive: { type: boolean }
    createdAt: { type: string, format: date-time }
```

**Corresponding API route - Good:**
```typescript
export async function GET(req: Request) {
  const alerts = await prisma.alert.findMany();

  return Response.json({
    id: alert.id,
    userId: alert.userId,
    symbol: alert.symbol,
    timeframe: alert.timeframe,
    condition: alert.condition,
    isActive: alert.isActive,
    createdAt: alert.createdAt.toISOString(),  // ✅ All required fields, correct format
  });
}
```

---

### 1.4 Architecture Compliance

✅ **Files in Correct Locations:**
- Files placed according to v5-structure-division.md
- API routes in `app/api/`
- Components in `components/`
- Business logic in `lib/`
- Database utilities in `lib/db/`
- Tier logic in `lib/tier/`

**Why this matters:** Consistent structure makes the codebase navigable. Future developers (or AI assistants) can find files easily.

**Example - Correct locations:**
```
app/api/alerts/route.ts                    ✅ API route
components/alerts/alert-form.tsx           ✅ React component
lib/db/alerts.ts                           ✅ Database utilities
lib/tier/validation.ts                     ✅ Tier validation logic
```

---

### 1.5 Claude Code Validation Results

✅ **Validation Thresholds:**
- **0 Critical issues** (security, contract violations)
- **≤2 High issues** (missing error handling, wrong types, tier validation missing)
- Medium/Low issues acceptable (will be auto-fixed if possible)

**Why this matters:** Claude Code validation catches issues before commit. These thresholds balance quality with autonomous progress.

**Validation Severity Levels:**
- **Critical:** Security vulnerabilities, API contract violations, exposed secrets
- **High:** Missing error handling, incorrect types, missing tier validation
- **Medium:** Missing JSDoc, suboptimal patterns
- **Low:** Formatting, style preferences

---

### 1.6 Complete AUTO-APPROVE Checklist

Aider auto-approves and commits when:

- [ ] All functions have TypeScript types
- [ ] All API routes have try/catch error handling
- [ ] All public functions have JSDoc comments
- [ ] No secrets hardcoded
- [ ] All inputs validated with Zod
- [ ] Tier validation present on protected endpoints
- [ ] Response matches OpenAPI schema exactly
- [ ] File in correct location per v5-structure-division.md
- [ ] Claude Code validation: 0 Critical, ≤2 High issues
- [ ] All High issues are auto-fixable

**If ALL conditions met → AUTO-APPROVE → COMMIT**

---

## 2. AUTO-FIX CONDITIONS

Aider should **automatically fix and retry** (max 3 attempts) when issues are **fixable**:

### 2.1 Fixable Issues

✅ **Missing TypeScript Types:**
- Add explicit return types to functions
- Add type annotations to parameters
- Define interfaces for complex objects

**Auto-fix strategy:**
```typescript
// Before (High issue)
function createAlert(userId, symbol) {
  return prisma.alert.create({ data: { userId, symbol } });
}

// After (Auto-fixed)
function createAlert(userId: string, symbol: string): Promise<Alert> {
  return prisma.alert.create({ data: { userId, symbol } });
}
```

---

✅ **Missing Error Handling:**
- Wrap API routes in try/catch
- Wrap Prisma queries in try/catch
- Add error logging

**Auto-fix strategy:**
```typescript
// Before (High issue)
export async function GET(req: Request) {
  const data = await prisma.alert.findMany();
  return Response.json(data);
}

// After (Auto-fixed)
export async function GET(req: Request) {
  try {
    const data = await prisma.alert.findMany();
    return Response.json(data);
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return Response.json(
      { error: 'Failed to fetch alerts. Please try again.' },
      { status: 500 }
    );
  }
}
```

---

✅ **Missing JSDoc Comments:**
- Add JSDoc to all public functions
- Include @param, @returns, description

**Auto-fix strategy:**
```typescript
// Before (Medium issue)
async function createAlert(userId: string, symbol: string): Promise<Alert> {
  // Implementation
}

// After (Auto-fixed)
/**
 * Creates a new alert for a user
 * @param userId - User's unique identifier
 * @param symbol - Trading symbol (e.g., "EURUSD")
 * @returns Promise resolving to created alert
 */
async function createAlert(userId: string, symbol: string): Promise<Alert> {
  // Implementation
}
```

---

✅ **ESLint/Prettier Errors:**
- Run `pnpm lint --fix`
- Run `pnpm format`

---

### 2.2 Auto-Fix Process

```
1. Generate code
2. Run Claude Code validation
3. If fixable issues found (and <3 retry attempts):
   a. Apply auto-fix
   b. Re-run Claude Code validation
   c. If validation passes → AUTO-APPROVE → COMMIT
   d. If still has issues → Retry (up to 3 total attempts)
4. If 3 attempts exhausted → ESCALATE
```

---

### 2.3 Maximum Retry Attempts

**Limit:** 3 retry attempts per file

**Why this matters:** Prevents infinite loops. If Aider can't fix issues in 3 tries, it needs human help.

**After 3 failed attempts → ESCALATE**

---

## 3. ESCALATE CONDITIONS

Aider should **STOP and notify you** when encountering:

### 3.1 Critical Security Vulnerabilities

**Escalate immediately when detecting:**
- SQL injection vulnerabilities
- XSS vulnerabilities
- Authentication bypass attempts
- Exposed secrets/API keys in code
- Missing authentication checks on protected routes
- Tier validation bypasses

**Why escalate:** Security issues require human review. Auto-fixing security bugs can introduce new vulnerabilities.

**Example escalation:**
```
⚠️ ESCALATION: Critical Security Issue

Issue: Missing authentication check on /api/alerts route
File: app/api/alerts/route.ts
Severity: Critical

Problem:
The POST /api/alerts endpoint creates alerts without verifying the user is authenticated.
Any unauthenticated user can create unlimited alerts for any userId.

Policy Violation:
- 01-approval-policies.md section 1.2: "All protected routes must verify authentication"

Suggested Fix:
Add authentication check at route start:

const session = await getServerSession();
if (!session?.user?.id) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

Awaiting human approval before proceeding.
```

---

### 3.2 API Contract Violations (Can't Auto-Fix)

**Escalate when:**
- OpenAPI spec requires a field that doesn't exist in database schema
- Response structure doesn't match OpenAPI schema after 3 fix attempts
- Missing required fields that require schema changes
- Type mismatches between OpenAPI and database that require migration

**Why escalate:** Contract violations often require schema changes or spec updates, which are architectural decisions.

**Example escalation:**
```
⚠️ ESCALATION: API Contract Violation

Issue: OpenAPI spec mismatch with database schema
File: app/api/alerts/route.ts
Severity: High

Problem:
OpenAPI spec (trading_alerts_openapi.yaml) requires field "triggeredAt: string | null"
but Prisma schema doesn't have a "triggeredAt" field on Alert model.

Options:
1. Add "triggeredAt" field to Prisma schema + migration
2. Update OpenAPI spec to remove "triggeredAt" requirement
3. Use a computed field/transform in API response

Which approach should I take?
```

---

### 3.3 Policy Conflicts or Gaps

**Escalate when:**
- Two policies contradict each other
- Scenario not covered by any policy
- Unclear requirements in specs
- Multiple valid approaches, unsure which to choose

**Why escalate:** Policy gaps need human clarification to improve the system.

**Example escalation:**
```
⚠️ ESCALATION: Policy Gap

Issue: Unclear policy on handling inactive users
File: app/api/alerts/route.ts
Severity: Medium

Problem:
User is authenticated but their account isActive=false.
Policies don't specify whether to:
1. Return 403 Forbidden
2. Return 401 Unauthorized
3. Allow access but show warning

Which approach aligns with business requirements?

Recommended policy update:
Add section to 01-approval-policies.md: "Inactive Account Handling"
```

---

### 3.4 Architectural Design Decisions

**Escalate when:**
- Multiple valid architectural approaches exist
- Need to choose a pattern (e.g., server component vs client component)
- New folder structure needed not covered by v5-structure-division.md
- Introducing new abstraction layers

**Why escalate:** Architectural decisions have long-term impacts and should involve human judgment.

**Example escalation:**
```
⚠️ ESCALATION: Architectural Decision

Issue: Alert notification delivery mechanism
File: lib/notifications/alert-notifier.ts
Severity: Medium

Problem:
When an alert triggers, how should we notify the user?

Options:
1. Email immediately (via Resend API)
2. In-app notification only (stored in database)
3. Both email + in-app notification
4. User preference (requires preferences schema)

Decision impacts:
- Cost (email API charges)
- User experience
- Database schema (if option 4)
- Infrastructure (email delivery monitoring)

Which approach should I implement?
```

---

### 3.5 New Dependency Additions

**Escalate when:**
- New npm package needed (not in package.json)
- New pip package needed (for Flask service)
- Dependency adds significant bundle size
- Alternative dependencies available with trade-offs

**Why escalate:** Dependencies add attack surface, bundle size, and maintenance burden. Human approval ensures necessity.

**Example escalation:**
```
⚠️ ESCALATION: New Dependency Required

Issue: Date manipulation library needed
File: lib/utils/date-helpers.ts
Severity: Low

Problem:
Need to format dates, calculate time differences, handle timezones.
JavaScript Date API is verbose and error-prone.

Options:
1. date-fns (functional, tree-shakeable, ~20KB)
2. dayjs (lightweight, ~7KB)
3. Luxon (powerful, timezone support, ~70KB)
4. Native Date (no dependency, but verbose)

Recommendation: date-fns
- Most popular (46M weekly downloads)
- Tree-shakeable (only import what you use)
- Well-typed for TypeScript

Approve adding date-fns?
```

---

### 3.6 Database Schema Changes (Prisma Migrations)

**Escalate when:**
- New table/model needed
- Adding/removing fields from existing models
- Changing field types (data migration required)
- Adding/removing relations

**Why escalate:** Schema changes are irreversible in production. Human review prevents data loss.

**Example escalation:**
```
⚠️ ESCALATION: Database Schema Change

Issue: Need to add "triggeredAt" field to Alert model
File: prisma/schema.prisma
Severity: High

Problem:
To track when alerts are triggered, need new field.

Proposed change:
model Alert {
  id          String   @id @default(cuid())
  userId      String
  symbol      String
  timeframe   String
  condition   String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  triggeredAt DateTime?  // ← NEW FIELD

  user User @relation(fields: [userId], references: [id])
}

Impact:
- Migration required on Railway PostgreSQL
- Existing alerts will have null triggeredAt (safe)
- OpenAPI spec already requires this field

Approve schema change + migration?
```

---

### 3.7 Breaking Changes to Existing APIs

**Escalate when:**
- Changing API response structure that breaks frontend
- Removing API endpoints
- Changing required fields
- Modifying authentication requirements

**Why escalate:** Breaking changes can crash the production app. Need coordination with frontend.

**Example escalation:**
```
⚠️ ESCALATION: Breaking API Change

Issue: Alert API response structure change
File: app/api/alerts/route.ts
Severity: High

Problem:
Current response returns Alert[] directly.
New requirement: Paginated response with metadata.

Current response:
[
  { id: "1", symbol: "EURUSD", ... },
  { id: "2", symbol: "BTCUSD", ... }
]

Proposed response:
{
  data: [
    { id: "1", symbol: "EURUSD", ... },
    { id: "2", symbol: "BTCUSD", ... }
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 45
  }
}

Breaking change: Frontend expects Alert[] directly.

Options:
1. Version API (create /api/v2/alerts with new structure)
2. Add query param (?paginated=true) for opt-in
3. Update frontend first, then backend

Which approach?
```

---

### 3.8 Claude Code Validation Failures (>3 High Issues)

**Escalate when:**
- >3 High severity issues after auto-fix attempts
- Any Critical issues
- Repeated auto-fix failures (3 attempts exhausted)
- Unclear how to fix validation errors

**Why escalate:** Persistent validation failures indicate misunderstanding of requirements or complex issues needing human review.

**Example escalation:**
```
⚠️ ESCALATION: Validation Failure After 3 Attempts

Issue: Persistent High severity issues
File: app/api/indicators/[symbol]/[timeframe]/route.ts
Severity: High

Problem:
After 3 auto-fix attempts, still have 4 High issues:

1. Missing tier validation for timeframe access
2. MT5 API call not wrapped in try/catch
3. Response doesn't match OpenAPI schema (missing "metadata" field)
4. No rate limiting check

Attempted fixes:
- Attempt 1: Added try/catch, missing tier validation
- Attempt 2: Added tier validation, response still incorrect
- Attempt 3: Fixed response, forgot rate limiting

Root cause: Complex endpoint with multiple requirements.

Need human guidance:
- Should rate limiting be middleware or per-route?
- Should MT5 errors be retried automatically?
- What should "metadata" field contain?
```

---

### 3.9 Unclear Requirements from Specs

**Escalate when:**
- Specs are ambiguous or contradictory
- Missing information needed for implementation
- Conflicting requirements from different docs
- Edge cases not covered by specs

**Why escalate:** Implementing based on wrong assumptions wastes time. Better to clarify upfront.

**Example escalation:**
```
⚠️ ESCALATION: Unclear Requirement

Issue: Alert condition syntax not specified
File: lib/alerts/condition-parser.ts
Severity: Medium

Problem:
Specs say users can create "conditions" for alerts, but don't specify format.

Examples from specs:
- "RSI > 70"
- "price crosses above 1.1000"
- "MACD crosses signal line"

Questions:
1. What's the exact syntax? (Free-form text? Structured format?)
2. How do we parse conditions? (Regex? Parser library? Predefined templates?)
3. What operators are supported? (>, <, =, crosses, etc?)
4. How complex can conditions be? (AND/OR logic?)

Need clarification on alert condition specification before implementing parser.
```

---

### 3.10 Test Failures

**Escalate when:**
- TypeScript compilation errors after code generation
- Jest tests fail after changes
- Build failures (pnpm build)
- Integration test failures

**Why escalate:** Test failures indicate broken functionality. Need to fix before proceeding.

**Example escalation:**
```
⚠️ ESCALATION: TypeScript Compilation Error

Issue: Type error in generated code
File: app/api/alerts/route.ts
Severity: High

Error:
app/api/alerts/route.ts:42:18 - error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

Code:
const userId = session?.user?.id;  // Type: string | undefined
await createAlert(userId, symbol, timeframe);  // Expects string

Problem:
TypeScript correctly identifies that userId might be undefined if session is null.

Options:
1. Add null check before calling createAlert
2. Add non-null assertion (userId!)
3. Make createAlert accept string | undefined

Recommended fix:
if (!userId) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
await createAlert(userId, symbol, timeframe);  // Now userId is definitely string

Approve this fix?
```

---

## 4. ESCALATION MESSAGE FORMAT

When escalating, Aider should format messages as:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION REQUIRED ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: [Category from sections 3.1-3.10]
File: [filename with path]
Feature: [what you're building]
Severity: [Critical/High/Medium/Low]

Problem:
[Clear explanation of the issue in 2-3 sentences]

Policy Violation/Gap:
[Which policy is unclear or violated, if applicable]

Context:
[Relevant code snippet, error message, or spec excerpt]

Suggested Solutions:
1. [Option 1 with pros/cons]
2. [Option 2 with pros/cons]
3. [Option 3 with pros/cons]

Recommendation:
[Your best judgment with reasoning]

Awaiting human decision...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 5. HUMAN RESPONSE TO ESCALATIONS

When you (human) receive an escalation:

1. **Read the escalation carefully**
2. **Consider Aider's suggestions**
3. **Make a decision:**
   - Choose an option (1, 2, or 3)
   - Provide alternative solution
   - Ask clarifying questions
4. **Update relevant policy if needed** (so future similar situations auto-approve)
5. **Tell Aider your decision and reasoning**

**Example response:**
```
Decision: Option 1 - Add "triggeredAt" field to Prisma schema

Reasoning:
- OpenAPI spec already requires it (contract-first design)
- Null values safe for existing alerts
- Enables feature: showing alert history with trigger times

Actions:
1. Update prisma/schema.prisma to add triggeredAt field
2. Run migration locally: npx prisma migrate dev
3. Deploy migration to Railway: DATABASE_URL=[Railway] npx prisma migrate deploy
4. Update 03-architecture-rules.md to note: "Schema changes require local + Railway migration"

Proceed with implementing this change.
```

---

## 6. POLICY IMPROVEMENT WORKFLOW

After each escalation resolution:

1. **Identify the policy gap** (what caused the escalation)
2. **Update the relevant policy document:**
   - Add new rule
   - Clarify ambiguous rule
   - Add example
3. **Commit policy update** with clear message
4. **Restart Aider** so it loads updated policies (if needed)

**This creates a learning loop:** Fewer escalations over time as policies become more comprehensive.

---

## Summary Decision Tree

```
Generate code
     ↓
Validate with Claude Code
     ↓
╔════════════════════════════════════════════╗
║ Check ALL approval conditions (Section 1)   ║
╚════════════════════════════════════════════╝
     ↓
     ├─ All conditions met?
     │  └─ YES → AUTO-APPROVE → COMMIT ✅
     │
     ├─ Fixable issues? (Section 2)
     │  └─ YES → AUTO-FIX → Re-validate
     │           ↓
     │           ├─ Fixed? → AUTO-APPROVE → COMMIT ✅
     │           └─ Not fixed after 3 tries? → ESCALATE ⚠️
     │
     └─ Critical issue or unclear? (Section 3)
        └─ YES → ESCALATE ⚠️
```

---

## Approval Conditions Quick Reference

| Condition | Check | Severity if Missing |
|-----------|-------|---------------------|
| TypeScript types | All functions typed | High |
| Error handling | try/catch on all API routes | High |
| JSDoc comments | All public functions | Medium |
| No secrets | No hardcoded keys | Critical |
| Input validation | Zod validation on all inputs | High |
| Tier validation | Symbol/timeframe access checked | Critical |
| OpenAPI compliance | Response matches spec | Critical |
| Architecture compliance | File in correct location | Medium |
| Claude Code validation | 0 Critical, ≤2 High | - |

**If ANY Critical → ESCALATE**
**If >2 High → ESCALATE**
**Otherwise → AUTO-FIX or AUTO-APPROVE**

---

## Example: Full Workflow

**Scenario:** Aider builds `app/api/alerts/route.ts`

```
1. Generate code based on:
   - v5-structure-division.md (Part 11: Alerts)
   - trading_alerts_openapi.yaml (AlertResponse schema)
   - 05-coding-patterns.md (API route pattern)

2. Validate with Claude Code:
   Results:
   - 0 Critical
   - 1 High (missing JSDoc on handler function)
   - 0 Medium
   - 2 Low (formatting)

3. Check approval conditions:
   ✅ TypeScript types: Present
   ✅ Error handling: try/catch present
   ❌ JSDoc comments: MISSING (1 High issue)
   ✅ No secrets: Clean
   ✅ Input validation: Zod validation present
   ✅ Tier validation: Present
   ✅ OpenAPI compliance: Response matches spec
   ✅ Architecture: File in correct location
   ✅ Validation: 0 Critical, 1 High (≤2 threshold)

4. Decision: AUTO-FIX (High issue is fixable)

5. Auto-fix: Add JSDoc comment
   /**
    * GET /api/alerts - Fetch all alerts for authenticated user
    * @returns JSON array of alerts matching AlertResponse schema
    */

6. Re-validate:
   - 0 Critical
   - 0 High
   - 0 Medium
   - 0 Low

7. All conditions met → AUTO-APPROVE

8. Commit:
   feat(alerts): add GET /api/alerts endpoint

   - Validation: 0 Critical, 0 High, 0 Medium issues
   - All approval conditions met: yes
   - Pattern used: API Route Pattern from 05-coding-patterns.md
   - Model: MiniMax M2

   Implements alert fetching with tier validation and
   error handling per OpenAPI specification.
```

---

**End of Approval Policies**

These policies enable Aider with MiniMax M2 to work autonomously while maintaining high quality and security standards. Update this document as you learn from escalations!
