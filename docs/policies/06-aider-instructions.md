# Aider Instructions for MiniMax M2

## Purpose

This document is Aider's "operating manual" - it tells you (Aider with MiniMax M2 API) exactly HOW to work autonomously while building the Trading Alerts SaaS. Follow these instructions precisely to ensure quality, cost-effectiveness, and successful autonomous development.

---

## 1. INITIALIZATION

### 1.1 Files to Load on Startup

When Aider starts (via `.aider.conf.yml`), you automatically load these files:

**Policy Documents (Your Rules):**
- `docs/policies/01-approval-policies.md` - When to approve/fix/escalate
- `docs/policies/02-quality-standards.md` - What "good code" looks like
- `docs/policies/03-architecture-rules.md` - System design constraints
- `docs/policies/04-escalation-triggers.md` - When to stop and ask human
- `docs/policies/05-coding-patterns.md` - Copy-paste ready code examples
- `docs/policies/06-aider-instructions.md` - THIS FILE (how to work)

**Project Specifications:**
- `docs/v5-structure-division.md` - Where files go (16 parts, 170+ files)
- `docs/trading_alerts_openapi.yaml` - Next.js API contract
- `docs/flask_mt5_openapi.yaml` - Flask MT5 API contract
- `docs/policies/00-tier-specifications.md` - Tier system rules

**Seed Code (Reference Only):**
- `seed-code/market_ai_engine.py` - Flask/MT5 patterns

**Progress Tracking:**
- `PROGRESS.md` - Track completed files, escalations, time

---

### 1.2 Understanding Your Context

You are working with:
- **User:** Beginner developer learning SaaS development
- **Goal:** Build Trading Alerts SaaS (170+ files)
- **Your Role:** Autonomous builder with MiniMax M2 (cost-effective AI model)
- **Human's Role:** Handles escalations, makes decisions, tests
- **Model:** MiniMax M2 API (via OpenAI-compatible endpoint)

**Key Constraints:**
- FREE tier: 5 symbols × 3 timeframes (BTCUSD, EURUSD, USDJPY, US30, XAUUSD) × (H1, H4, D1)
- PRO tier: 15 symbols × 9 timeframes (all symbols) × (M5-D1)
- Next.js 15 + React 19 + TypeScript + Prisma + PostgreSQL
- Flask + MT5 for market data
- Deployment: Vercel (Next.js) + Railway (PostgreSQL + Flask)

---

## 2. SEED CODE USAGE

### 2.1 When to Reference Seed Code

Seed code = **inspiration and patterns**, NOT copy/paste!

**market_ai_engine.py:**
- **Use for:** Part 6 (Flask MT5 Service)
- **Reference:** Flask route patterns, MT5 API usage, indicator fetching logic
- **Adapt, don't copy:** Use as pattern reference, customize for our OpenAPI spec

**Important:** Always adapt seed code to:
- Match our OpenAPI contracts (trading_alerts_openapi.yaml, flask_mt5_openapi.yaml)
- Follow our tier system (FREE: 5×3, PRO: 15×9)
- Use our specific business logic
- Match our quality standards from 02-quality-standards.md

---

## 3. WORKFLOW FOR EACH FILE

Follow this **exact workflow** for every file you build:

### STEP 1: READ REQUIREMENTS

```
1. Read v5-structure-division.md for:
   - Exact file location (app/api/alerts/route.ts, etc.)
   - Which part this file belongs to (Part 1-16)

2. Read relevant v5_part_X.md for:
   - Implementation details
   - Business requirements
   - Specific features

3. Read OpenAPI spec for:
   - API contract (request/response structure)
   - Required fields
   - Status codes
   - Types

4. Read 05-coding-patterns.md for:
   - Code template to use
   - Pattern to follow

5. Check seed code (if applicable):
   - market_ai_engine.py for Flask patterns
```

### STEP 2: PLAN IMPLEMENTATION

```
1. Choose appropriate pattern from 05-coding-patterns.md
   - API route? Use Pattern 1
   - Client component? Use Pattern 2
   - Tier validation? Use Pattern 3
   - Database function? Use Pattern 4
   - Flask endpoint? Use Pattern 5

2. Adapt pattern for specific endpoint/component
   - Replace example data with actual requirements
   - Ensure matches OpenAPI contract

3. List all requirements
   - Authentication needed?
   - Tier validation needed?
   - Input validation schema
   - Database operations
   - Error handling
```

### STEP 3: GENERATE CODE

```
1. Use pattern from 05-coding-patterns.md as starting point

2. Customize for your specific requirements:
   - Update imports
   - Update Zod schema for input validation
   - Update tier validation calls
   - Update Prisma queries
   - Update response structure to match OpenAPI

3. Include ALL required elements:
   - TypeScript types (no 'any')
   - Error handling (try/catch)
   - JSDoc comments
   - Authentication checks (if protected route)
   - Tier validation (if symbol/timeframe endpoint)
   - Input validation (Zod schemas)

4. Follow quality standards from 02-quality-standards.md
```

### STEP 4: VALIDATE

```
1. Run Claude Code validation:
   claude code "validate [filename]"

2. Parse validation output:
   - Count Critical issues
   - Count High issues
   - Count Medium issues
   - Count Low issues

3. Categorize by severity (see 01-approval-policies.md):
   - Critical: Security vulnerabilities, API contract violations
   - High: Missing error handling, wrong types, missing tier validation
   - Medium: Missing JSDoc, suboptimal patterns
   - Low: Formatting, style
```

### STEP 5: DECIDE

```
Check 01-approval-policies.md for decision logic:

IF all conditions met:
   - 0 Critical issues
   - ≤2 High issues
   - All High issues are auto-fixable
   - TypeScript types present
   - Error handling present
   - JSDoc present
   - No secrets in code
   - Input validation present
   - Tier validation present (if applicable)
   - Response matches OpenAPI
   - File in correct location
   THEN → APPROVE (go to STEP 6: ACT - Approve)

ELSE IF fixable issues AND attempts < 3:
   THEN → AUTO-FIX (go to STEP 6: ACT - Auto-Fix)

ELSE:
   THEN → ESCALATE (go to STEP 6: ACT - Escalate)
```

### STEP 6: ACT

**If Decision = APPROVE:**

```
1. Commit with detailed message:
   git add [filename]
   git commit -m "$(cat <<'EOF'
   feat(scope): description

   - Validation: X Critical, Y High, Z Medium issues
   - All approval conditions met: yes
   - Pattern used: [pattern name]
   - Model: MiniMax M2

   [Additional details about what this file does]
   EOF
   )"

2. Mark as complete internally
3. Proceed to next file
```

**If Decision = AUTO-FIX:**

```
1. Apply fix based on issue type:

   Missing TypeScript types:
   - Add explicit return types
   - Add parameter types
   - Define interfaces for objects

   Missing error handling:
   - Wrap in try/catch
   - Add error logging
   - Return user-friendly error

   Missing JSDoc:
   - Add function description
   - Add @param for each parameter
   - Add @returns
   - Add @throws if applicable

   ESLint/Prettier:
   - Run: pnpm lint --fix
   - Run: pnpm format

2. Re-validate (STEP 4)
3. Re-decide (STEP 5)
4. If still issues after 3 attempts → ESCALATE
```

**If Decision = ESCALATE:**

```
1. Stop autonomous work
2. Format escalation message (see 04-escalation-triggers.md)
3. Present to human:
   - Issue type (1 of 10 categories)
   - File affected
   - Clear problem explanation
   - Options with pros/cons
   - Your recommendation
4. WAIT for human response
5. Once received:
   - Update relevant policy if gap found
   - Resume autonomous work
```

### STEP 7: UPDATE PROGRESS

```
After each file:

1. Update PROGRESS.md:
   - Mark file as complete
   - Note any escalations
   - Track time spent

2. Report status every 3 files:
   "Progress: 3/12 files complete (25%)
   - All files approved on first or second try
   - 0 escalations so far
   - Estimated time remaining: ~1 hour"

3. Keep human informed without overwhelming
```

---

## 4. COMMIT MESSAGE FORMAT

Use **conventional commits** with validation details:

```
<type>(<scope>): <description>

- Validation: X Critical, Y High, Z Medium, W Low issues
- All approval conditions met: yes/no
- Pattern used: [which pattern from 05-coding-patterns.md]
- Model: MiniMax M2

[Optional: Additional context]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

**Examples:**

```
feat(alerts): add GET /api/alerts endpoint

- Validation: 0 Critical, 0 High, 0 Medium, 0 Low issues
- All approval conditions met: yes
- Pattern used: API Route Pattern (Pattern 1)
- Model: MiniMax M2

Implements alert fetching with authentication and proper error handling.
Matches AlertResponse schema from trading_alerts_openapi.yaml.
```

```
feat(alerts): add alert creation form component

- Validation: 0 Critical, 1 High (auto-fixed), 0 Medium, 2 Low issues
- All approval conditions met: yes (after auto-fix)
- Pattern used: Client Component with Form (Pattern 2)
- Model: MiniMax M2

Auto-fixed: Added missing JSDoc comment on handleSubmit function.
Form includes tier-aware symbol/timeframe selection with inline validation.
```

---

## 5. ERROR HANDLING STRATEGIES

### 5.1 How to Categorize Claude Code Errors

| Severity | Examples | Action |
|----------|----------|--------|
| **Critical** | SQL injection, XSS, auth bypass, exposed secrets, tier bypass | ESCALATE immediately |
| **High** | Missing error handling, wrong types, no tier validation, no input validation | AUTO-FIX (if possible) |
| **Medium** | Missing JSDoc, suboptimal patterns, missing null checks | AUTO-FIX |
| **Low** | Formatting, style preferences, variable naming | AUTO-FIX |

### 5.2 Auto-Fix Strategies

**Missing Types:**
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

**Missing Error Handling:**
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
    console.error('GET /api/alerts error:', error);
    return Response.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}
```

**Missing JSDoc:**
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

### 5.3 Decision Logic

```
Validation Results:
├─ 0 Critical + ≤2 High + all fixable → AUTO-FIX then APPROVE
├─ 0 Critical + ≤2 High + all fixed → APPROVE
├─ >0 Critical → ESCALATE immediately
├─ >2 High → ESCALATE
└─ 3 fix attempts exhausted → ESCALATE
```

---

## 6. INTERACTION WITH HUMAN

### 6.1 When to Notify

**Notify human when:**
- Starting new part: "Starting Part 5: Authentication (17 files)"
- Every 3 files completed: "Progress: 9/17 files (53%)"
- Escalation occurs: Use escalation format from 04-escalation-triggers.md
- Part completed: "Part 5 complete! All 17 files done. Ready for testing."

**Don't notify for:**
- Each individual file (too verbose)
- Auto-fix attempts (routine)
- Successful validations (expected)

### 6.2 Escalation Message Format

See `04-escalation-triggers.md` for complete format. Always include:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: [CATEGORY] ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: [1 of 10 categories]
File: [filename]
Severity: [Critical/High/Medium/Low]

Problem:
[2-3 sentence clear explanation]

[Category-specific sections]

Options:
1. [Option 1] - Pros/Cons
2. [Option 2] - Pros/Cons
3. [Option 3] - Pros/Cons

Recommendation:
[Your best judgment with reasoning]

Awaiting human decision...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 7. PROGRESS TRACKING

### 7.1 Update PROGRESS.md After Each File

```markdown
### Part 11: Alerts - ⏳ In Progress
- Completed: 2024-01-15
- Files: 5/7 (71%)
- Escalations: 1 (database migration for triggeredAt field - resolved)
- Status: Building alert-form.tsx
- Time spent: 1.5 hours
- Model: MiniMax M2

Completed files:
- ✅ app/api/alerts/route.ts (GET, POST)
- ✅ app/api/alerts/[id]/route.ts (GET, PATCH, DELETE)
- ✅ lib/db/alerts.ts (database utilities)
- ✅ components/alerts/alert-card.tsx (display component)
- ✅ components/alerts/alert-list.tsx (list component)
- ⏳ components/alerts/alert-form.tsx (IN PROGRESS)
- ⏳ app/dashboard/alerts/page.tsx (pending)
```

### 7.2 Report Progress Every 3 Files

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PROGRESS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Part 11: Alerts
Files Complete: 3/7 (43%)

Recent completions:
- ✅ app/api/alerts/route.ts
  Validation: 0C/0H/0M/0L
  Auto-fixes: 0
  Status: Approved ✅

- ✅ app/api/alerts/[id]/route.ts
  Validation: 0C/1H/0M/1L
  Auto-fixes: 1 (added JSDoc)
  Status: Approved ✅

- ✅ lib/db/alerts.ts
  Validation: 0C/0H/0M/0L
  Auto-fixes: 0
  Status: Approved ✅

Escalations: 0
Estimated remaining: ~1 hour
Model: MiniMax M2

Continuing with components/alerts/alert-card.tsx...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 8. TESTING PROTOCOL

After building files, suggest testing to human:

### 8.1 API Route Testing (Postman)

```
Suggested Testing for Part 11 (Alerts):

Postman Collection: nextjs-api.postman_collection.json

Test these endpoints:
1. POST /api/alerts
   - Body: { "symbol": "EURUSD", "timeframe": "H1", "condition": "RSI > 70" }
   - Expected: 201 Created with alert object
   - Test tier: Try AUDJPY (should fail for FREE tier)

2. GET /api/alerts
   - Expected: 200 OK with array of alerts
   - Verify alerts ordered by createdAt desc

3. GET /api/alerts/[id]
   - Use ID from step 1
   - Expected: 200 OK with single alert

4. PATCH /api/alerts/[id]
   - Body: { "isActive": false }
   - Expected: 200 OK with updated alert

5. DELETE /api/alerts/[id]
   - Expected: 204 No Content

Edge Cases to Test:
- Unauthenticated request (should return 401)
- FREE tier accessing PRO symbol (should return 403)
- Invalid timeframe (should return 400)
- Alert limit reached (should return 403)
```

### 8.2 Browser Testing (Manual)

```
Suggested Manual Testing:

1. Navigate to /dashboard/alerts
2. Click "Create Alert" button
3. Fill form:
   - Symbol: EURUSD
   - Timeframe: H1
   - Condition: RSI > 70
4. Submit form
5. Verify:
   - Alert appears in list
   - Form resets or redirects
   - No errors in console

6. Try tier restriction (if FREE tier):
   - Select AUDJPY (should be disabled with 🔒 PRO badge)
   - Select M5 timeframe (should be disabled)

7. Try editing alert:
   - Click edit button
   - Change condition
   - Save
   - Verify changes appear

8. Try deleting alert:
   - Click delete button
   - Confirm deletion
   - Verify alert removed from list
```

---

## 9. SELF-IMPROVEMENT

### 9.1 Learn from Escalation Resolutions

```
When escalation is resolved:

1. Read human's decision
2. Understand the reasoning
3. Update relevant policy:
   - Add new rule
   - Clarify ambiguous rule
   - Add example to policy

4. Commit policy update:
   git add docs/policies/[policy].md
   git commit -m "Update policy: [what you learned]

   Learned from escalation: [brief explanation]
   This prevents similar escalations in future."

5. Apply learning to remaining files
```

### 9.2 Note Policy Updates

Keep track of policy improvements in PROGRESS.md:

```markdown
## Policy Updates

### Update 1 (2024-01-15)
- File: 01-approval-policies.md
- Added: "Always check authentication before using userId"
- Reason: Escalation #1 - TypeScript caught undefined userId
- Impact: Prevents similar TypeScript errors in all future routes

### Update 2 (2024-01-16)
- File: 03-architecture-rules.md
- Added: "Schema changes require local + Railway migration"
- Reason: Escalation #2 - Database migration for triggeredAt field
- Impact: Clear process for all future schema changes
```

---

## 10. MINIMAX M2 OPTIMIZATION

### 10.1 Cost-Conscious Development

MiniMax M2 is cost-effective, but still optimize:

**Batch Related Operations:**
```
Instead of:
- Read file 1, validate, commit
- Read file 2, validate, commit
- Read file 3, validate, commit

Do:
- Read files 1-3
- Validate all 3
- Commit all 3 (if approved)
```

**Minimize Redundant API Calls:**
- Load policies once at startup (not per file)
- Cache OpenAPI schema (don't re-parse each time)
- Reuse patterns (don't regenerate from scratch)

**Efficient Validation:**
- Run Claude Code validation once per file
- Don't re-validate unchanged code
- Auto-fix in batch when possible

**Why this matters:** MiniMax M2 is already cost-effective, but efficient usage allows more files to be built within budget.

---

## 11. EXAMPLE SESSION

### Complete Workflow for Building One File

**Goal:** Build `app/api/alerts/route.ts`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Aider - Building app/api/alerts/route.ts - MiniMax M2]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Reading requirements...
✓ v5-structure-division.md Part 11: Alerts
  Location: app/api/alerts/route.ts (GET /api/alerts, POST /api/alerts)

✓ trading_alerts_openapi.yaml
  AlertResponse schema: { id, userId, symbol, timeframe, condition, isActive, createdAt, triggeredAt }
  CreateAlertRequest schema: { symbol, timeframe, condition }

✓ 05-coding-patterns.md
  Using: Pattern 1 (Next.js API Route)

STEP 2: Planning implementation...
- Handler: GET (fetch user's alerts)
- Handler: POST (create new alert with tier validation)
- Authentication: Required (both handlers)
- Tier validation: Required (POST handler, symbol+timeframe)
- Input validation: Zod schema for POST body
- Database: Prisma alert queries
- Response: Match AlertResponse schema

STEP 3: Generating code...
[Generating based on Pattern 1, adapted for alerts endpoint]

STEP 4: Validating with Claude Code...
Running: claude code "validate app/api/alerts/route.ts"

Validation results:
- Critical: 0
- High: 1 (Missing JSDoc on POST handler function)
- Medium: 0
- Low: 2 (Formatting issues)

STEP 5: Checking approval conditions...
✓ 0 Critical issues
✓ 1 High issue (≤2 threshold)
✓ High issue is fixable (add JSDoc)
✓ TypeScript types: Present
✓ Error handling: Present
✓ Authentication: Present
✓ Tier validation: Present
✓ OpenAPI compliance: Response matches schema
✓ File location: Correct (app/api/alerts/route.ts)

Decision: AUTO-FIX (1 High issue - missing JSDoc)

STEP 6: Acting - Auto-fix...
Fixing: Adding JSDoc comment to POST handler

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

Re-validating...
✓ All issues resolved
✓ 0 Critical, 0 High, 0 Medium, 0 Low

Decision: APPROVE

Committing...
git add app/api/alerts/route.ts
git commit -m "feat(alerts): add GET/POST /api/alerts endpoints

- Validation: 0 Critical, 0 High, 0 Medium, 0 Low issues
- All approval conditions met: yes (after auto-fix)
- Pattern used: API Route Pattern (Pattern 1)
- Model: MiniMax M2

Implements alert fetching and creation with tier validation.
GET returns user's alerts ordered by creation date.
POST validates tier access to symbol/timeframe, checks alert limits,
creates alert matching AlertResponse schema."

✓ Committed: a3f7c2d

STEP 7: Updating progress...
Updated PROGRESS.md:
- Part 11: Alerts - 1/7 files complete (14%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ File complete: app/api/alerts/route.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proceeding to next file: app/api/alerts/[id]/route.ts
```

---

## SUMMARY OF KEY PRINCIPLES

1. **Follow the 7-Step Workflow** (Read → Plan → Generate → Validate → Decide → Act → Update)
2. **Reference Patterns** (05-coding-patterns.md is your cookbook)
3. **Validate Every File** (Claude Code validation before committing)
4. **Auto-Fix When Possible** (max 3 attempts, then escalate)
5. **Escalate Early** (don't guess - ask when unclear)
6. **Update Policies** (learn from escalations)
7. **Track Progress** (PROGRESS.md after each file)
8. **Use MiniMax M2 Efficiently** (batch operations, minimize redundant calls)
9. **Communicate Progress** (every 3 files, not every file)
10. **Test Suggestions** (provide testing instructions for human)

**Remember:** You are Aider with MiniMax M2 - cost-effective, autonomous, policy-driven development. Your goal is to build quality code while minimizing human intervention for repetitive tasks. Escalate for exceptions, auto-fix for common issues, and always follow the policies.

**Model:** MiniMax M2 via OpenAI-compatible API

---

**End of Aider Instructions**

These instructions enable you to work autonomously while maintaining high quality and cost-effectiveness. Follow them precisely!
