# Escalation Triggers for Aider with MiniMax M2

## Purpose

This document defines EXACTLY when Aider (using MiniMax M2) should stop autonomous work and notify you (the human developer). Escalations are exceptions that require human judgment - they're learning opportunities that improve the system over time.

**Key Principle:** Escalate early rather than making wrong assumptions. It's better to ask than to build the wrong thing.

---

## ESCALATION CATEGORIES

Aider should escalate in these 10 situations:

1. Critical Security Issues
2. API Contract Violations (Can't Auto-Fix)
3. Policy Conflicts or Gaps
4. Architectural Design Decisions
5. Dependency Additions
6. Database Migrations
7. Breaking Changes
8. Claude Code Validation Failures
9. Unclear Requirements
10. Test Failures

---

## 1. CRITICAL SECURITY ISSUES

### When to Escalate

**Escalate IMMEDIATELY when detecting:**
- SQL injection vulnerabilities
- XSS (Cross-Site Scripting) vulnerabilities
- Authentication bypass attempts
- Exposed secrets/API keys in code or logs
- Missing authentication checks on protected routes
- Tier validation bypass opportunities
- Insecure password storage
- CSRF (Cross-Site Request Forgery) vulnerabilities
- Insecure direct object references

### What Information to Include

```
Issue Type: Critical Security Issue
File: [filename]
Severity: Critical
Security Type: [SQL Injection | XSS | Auth Bypass | etc.]

Problem:
[Clear explanation of the vulnerability and how it could be exploited]

Vulnerable Code:
[Code snippet showing the issue]

Potential Impact:
- Who is affected: [All users | Admin users | etc.]
- Data at risk: [User passwords | Payment info | etc.]
- Attack scenario: [How attacker could exploit this]

Suggested Fix:
[Specific remediation steps]

Policy Violated:
[Which policy section addresses this]
```

### Example Escalation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: Critical Security Issue ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: Critical Security Issue
File: app/api/alerts/route.ts
Severity: Critical
Security Type: Missing Authentication Check

Problem:
The POST /api/alerts endpoint creates alerts without verifying that
the user is authenticated. Any unauthenticated user can create unlimited
alerts for any userId by directly calling this endpoint.

Vulnerable Code:
export async function POST(req: Request) {
  const body = await req.json();
  const alert = await prisma.alert.create({
    data: {
      userId: body.userId,  // ❌ Accepting userId from client!
      symbol: body.symbol,
      // ...
    }
  });
  return Response.json(alert);
}

Potential Impact:
- Who is affected: All users (any unauthenticated person can create alerts)
- Data at risk: Alert data, user privacy
- Attack scenario:
  1. Attacker discovers endpoint via OpenAPI spec
  2. Sends POST request without authentication
  3. Creates malicious alerts for real users
  4. Could fill database with spam alerts
  5. Could trigger unwanted notifications to users

Suggested Fix:
Add authentication check at the start of the handler:

export async function POST(req: Request) {
  // 1. Verify authentication
  const session = await getServerSession();
  if (!session?.user?.id) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 2. Use userId from session (trusted source)
  const body = await req.json();
  const alert = await prisma.alert.create({
    data: {
      userId: session.user.id,  // ✅ From session, not client
      symbol: body.symbol,
      // ...
    }
  });
  return Response.json(alert);
}

Policy Violated:
01-approval-policies.md Section 1.2: "All protected routes must verify authentication"

Awaiting human approval to implement the suggested fix.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### How Human Should Respond

```
Decision: Implement the suggested fix + add to policy

Actions:
1. Apply the authentication fix
2. Scan ALL API routes for similar missing auth checks
3. Add to 01-approval-policies.md:
   "CRITICAL CHECK: Every /api/* route MUST start with authentication check.
    Use userId from session, NEVER accept userId from request body."
4. Create test case to verify auth is checked

Proceed with implementation.
```

---

## 2. API CONTRACT VIOLATIONS (CAN'T AUTO-FIX)

### When to Escalate

**Escalate when:**
- OpenAPI spec requires a field that doesn't exist in database schema
- Response structure doesn't match OpenAPI after 3 auto-fix attempts
- Missing required fields that require schema changes
- Type mismatches between OpenAPI and Prisma schema
- Endpoint defined in OpenAPI but requirements unclear
- Status codes in implementation don't match spec

### What Information to Include

```
Issue Type: API Contract Violation
File: [filename]
Severity: High
Contract: [trading_alerts_openapi.yaml | flask_mt5_openapi.yaml]

Problem:
[Explain the mismatch between OpenAPI spec and implementation]

OpenAPI Spec Says:
[Relevant YAML excerpt]

Current Implementation:
[Code snippet]

Why Auto-Fix Failed:
[What you tried and why it didn't work]

Options:
1. [Change database schema to match OpenAPI]
   Pros: [...]
   Cons: [...]

2. [Change OpenAPI spec to match database]
   Pros: [...]
   Cons: [...]

3. [Add transformation layer]
   Pros: [...]
   Cons: [...]

Recommendation:
[Your suggested approach with reasoning]
```

### Example Escalation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: API Contract Violation ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: API Contract Violation
File: app/api/alerts/route.ts
Severity: High
Contract: trading_alerts_openapi.yaml

Problem:
OpenAPI spec defines AlertResponse with a "triggeredAt" field (string | null),
but the Prisma Alert model doesn't have this field. Can't return field that
doesn't exist in database.

OpenAPI Spec Says:
AlertResponse:
  type: object
  required: [id, userId, symbol, timeframe, condition, isActive, createdAt, triggeredAt]
  properties:
    # ...
    triggeredAt:
      type: string
      format: date-time
      nullable: true
      description: "When the alert was last triggered"

Current Prisma Schema:
model Alert {
  id          String   @id @default(cuid())
  userId      String
  symbol      String
  timeframe   String
  condition   String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  // ❌ No triggeredAt field

  user User @relation(fields: [userId], references: [id])
}

Why Auto-Fix Failed:
- Attempt 1: Tried returning null for triggeredAt, but OpenAPI requires it to match DateTime format when present
- Attempt 2: Tried transforming createdAt to triggeredAt, but semantically incorrect
- Attempt 3: Can't auto-add database fields (requires schema migration)

Options:
1. Add "triggeredAt DateTime?" to Prisma schema + migration
   Pros:
   - Matches OpenAPI contract
   - Useful feature (track when alerts trigger)
   - Null-safe for existing alerts
   Cons:
   - Requires database migration on Railway
   - Adds complexity to alert triggering logic

2. Remove "triggeredAt" from OpenAPI spec
   Pros:
   - No database changes needed
   - Simpler implementation
   Cons:
   - Loses planned feature
   - May have been in spec for a reason

3. Return computed value (e.g., always null or always createdAt)
   Pros:
   - No database changes
   - Keeps OpenAPI contract
   Cons:
   - Misleading data
   - Not semantically correct

Recommendation: Option 1 (Add to database schema)

Reasoning:
- "triggeredAt" is semantically different from "createdAt"
- Feature makes sense: track when alert last triggered
- OpenAPI-first design: if it's in the spec, it was planned
- Migration is safe: nullable field, existing alerts get null

Migration Impact:
- Existing alerts: triggeredAt will be null (safe)
- New alerts: triggeredAt will be null until first trigger
- No data loss risk

Awaiting human decision on which option to pursue.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### How Human Should Respond

```
Decision: Option 1 - Add triggeredAt to database schema

Actions:
1. Update prisma/schema.prisma:
   model Alert {
     // ... existing fields ...
     triggeredAt DateTime?  // ← Add this
   }

2. Create migration:
   npx prisma migrate dev --name add_triggered_at_to_alerts

3. Deploy migration to Railway:
   DATABASE_URL=[Railway] npx prisma migrate deploy

4. Verify migration in Railway dashboard

5. Update 03-architecture-rules.md:
   "Schema changes must be tested locally, then deployed to Railway
    before continuing with implementation."

6. After migration complete, continue implementing API route

Proceed with schema change.
```

---

## 3. POLICY CONFLICTS OR GAPS

### When to Escalate

**Escalate when:**
- Two policies contradict each other
- Scenario not covered by any existing policy
- Unclear which policy takes precedence
- Multiple valid interpretations of a policy
- Edge case that policies don't address
- Ambiguous wording in policy documents

### What Information to Include

```
Issue Type: Policy Conflict / Policy Gap
File: [filename]
Severity: Medium
Policy Documents: [which policies are involved]

Problem:
[Explain the contradiction or gap]

Conflicting Policies:
Policy A (01-approval-policies.md): [excerpt]
Policy B (03-architecture-rules.md): [excerpt]

OR

Missing Policy:
Scenario: [describe the situation]
Current policies don't address: [what's unclear]

Impact on Current Task:
[How this blocks progress]

Suggested Policy Update:
[Proposed clarification or new policy]
```

### Example Escalation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: Policy Gap ⚠━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: Policy Gap
File: app/api/users/[id]/route.ts
Severity: Medium
Policy Documents: 01-approval-policies.md, 02-quality-standards.md

Problem:
Implementing GET /api/users/[id] endpoint. User requests their own profile
but their account has isActive=false. Policies don't specify how to handle
inactive accounts.

Missing Policy:
Scenario: Authenticated user with isActive=false tries to access their data

Options:
1. Return 401 Unauthorized (treat as not authenticated)
2. Return 403 Forbidden (treat as authenticated but restricted)
3. Return 200 OK with data (allow read access to inactive accounts)
4. Return 200 OK with warning message (allow access + notify)

Each approach is valid, but policy doesn't specify which to use.

Impact on Current Task:
Can't complete GET /api/users/[id] endpoint without knowing how to handle
inactive users. Same question will arise for other endpoints.

Similar Scenarios:
- POST /api/alerts with isActive=false user
- GET /api/dashboard with isActive=false user
- All protected routes need consistent behavior

Suggested Policy Update:
Add to 01-approval-policies.md Section 1.2 "Authentication Requirements":

"Inactive Account Handling:
- isActive=false users are authenticated but restricted
- GET requests to own data: Allow (200 OK) + include warning
- POST/PATCH/DELETE requests: Deny (403 Forbidden)
- Response for restricted actions:
  {
    error: 'Account inactive',
    message: 'Contact support to reactivate your account',
    supportEmail: 'support@example.com'
  }
- All endpoints must check isActive for write operations"

Awaiting human decision on inactive account handling.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### How Human Should Respond

```
Decision: Approve suggested policy with minor modification

Modification:
Allow inactive users to view their own data, but deny ALL modifications.
Also deny access to dashboard (force to account reactivation page).

Updated Policy:
"Inactive Account Handling (isActive=false):
- Authentication: User is authenticated (session valid)
- Authorization: Restricted to read-only of own data
- GET /api/users/{self}: Allow (200 OK) with { warning: 'Account inactive' }
- GET /api/dashboard: Redirect to /account/reactivate (or 403)
- POST/PATCH/DELETE: Deny (403 Forbidden) with reactivation message
- Other users accessing inactive user's data: Treated as not found (404)"

Actions:
1. Add this policy to 01-approval-policies.md Section 1.2
2. Create lib/auth/check-active.ts helper function:
   export function requireActiveAccount(user: User) {
     if (!user.isActive) {
       throw new ForbiddenError('Account inactive. Contact support.');
     }
   }
3. Use this helper in all write operations
4. Continue implementing endpoints with this pattern

Proceed with policy update and implementation.
```

---

## 4. ARCHITECTURAL DESIGN DECISIONS

### When to Escalate

**Escalate when:**
- Multiple valid architectural approaches exist
- Need to choose between patterns (Server Component vs Client Component)
- Introducing new folder structure not in v5-structure-division.md
- Choosing state management approach (local vs context vs URL)
- Deciding data fetching strategy (Server Component vs API route)
- Choosing component composition pattern
- Performance trade-offs with multiple valid solutions

### What Information to Include

```
Issue Type: Architectural Decision
File: [filename or feature]
Severity: Medium
Decision Area: [State Management | Component Pattern | Data Fetching | etc.]

Problem:
[Describe the architectural question]

Context:
[Why this decision is needed now]

Options:
1. [Approach 1]
   Pros: [...]
   Cons: [...]
   Performance: [...]
   Maintainability: [...]

2. [Approach 2]
   Pros: [...]
   Cons: [...]
   Performance: [...]
   Maintainability: [...]

3. [Approach 3]
   Pros: [...]
   Cons: [...]
   Performance: [...]
   Maintainability: [...]

Impact:
- Affects: [which parts of the codebase]
- Future implications: [what this locks in]
- Reversibility: [easy to change later? or permanent decision?]

Recommendation:
[Your suggested approach with detailed reasoning]
```

### Example Escalation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: Architectural Decision ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: Architectural Decision
File: app/dashboard/alerts/page.tsx (and related components)
Severity: Medium
Decision Area: Data Fetching Strategy

Problem:
Need to decide how to fetch and display alerts on the dashboard page.
Multiple valid approaches in Next.js 15 App Router.

Context:
- Dashboard needs to show user's alerts
- Alerts update when user creates/deletes via forms
- Need real-time-ish updates (within ~30 seconds)
- Good UX requires loading states

Options:

1. Server Component with Database Direct Fetch
export default async function AlertsPage() {
  const alerts = await prisma.alert.findMany({ where: { userId } });
  return <AlertList alerts={alerts} />;
}

Pros:
  - No API route needed (less code)
  - Fastest initial page load (no client fetch)
  - SEO friendly (fully rendered HTML)
  - Zero client JavaScript for data fetching

Cons:
  - Refresh requires full page reload
  - Can't easily poll for updates
  - Hard to show optimistic updates after creating alert
  - Database queries in page files (couples presentation to data layer)

Performance: Excellent (initial load), Poor (updates)
Maintainability: Medium (database logic in pages)

2. Server Component + Client Component with API Polling
// app/dashboard/alerts/page.tsx (Server Component)
export default async function AlertsPage() {
  const initialAlerts = await prisma.alert.findMany({ where: { userId } });
  return <AlertListClient initialAlerts={initialAlerts} />;
}

// components/alerts/alert-list-client.tsx (Client Component)
'use client';
export function AlertListClient({ initialAlerts }) {
  const [alerts, setAlerts] = useState(initialAlerts);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      setAlerts(data);
    }, 30000);  // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return <AlertList alerts={alerts} />;
}

Pros:
  - Fast initial load (Server Component)
  - Auto-updates every 30s (polling)
  - Can show optimistic updates
  - Separation of concerns (API route handles data)

Cons:
  - More code (Server Component + Client Component + API route)
  - Polling adds API requests (rate limit consideration)
  - Slight delay before updates appear

Performance: Excellent (initial), Good (updates every 30s)
Maintainability: High (clear separation)

3. Client Component Only with SWR/React Query
'use client';
export function AlertsPage() {
  const { data: alerts, mutate } = useSWR('/api/alerts', fetcher, {
    refreshInterval: 30000,
  });

  if (!alerts) return <Loading />;
  return <AlertList alerts={alerts} onUpdate={mutate} />;
}

Pros:
  - Built-in caching, revalidation, polling
  - Easy optimistic updates
  - Deduplicates requests
  - Well-tested library

Cons:
  - Requires SWR dependency
  - Client-side only (no SSR of alerts)
  - Slower initial page load (shows loading spinner)
  - SEO: no alert data in HTML

Performance: Poor (initial load), Excellent (updates)
Maintainability: High (library handles complexity)

Impact:
- Affects: All dashboard pages (alerts, watchlist, charts)
- Future implications: Sets pattern for all data fetching
- Reversibility: Medium (can change, but affects many components)

Recommendation: Option 2 (Hybrid Server + Client with Polling)

Reasoning:
1. Best of both worlds: Fast initial load + auto-updates
2. No new dependencies (uses built-in Next.js features)
3. SEO friendly (Server Component renders initial data)
4. Polling acceptable for FREE tier (60 req/h supports 2 req/min)
5. Can add WebSocket later without changing architecture
6. Maintains separation of concerns (API routes for data)
7. Easy to add optimistic updates when needed

FREE tier impact:
- 60 requests/hour limit
- 30s polling = 2 requests/min = ~120 requests/hour IF user stays on page
- Problem: Exceeds limit if user stays on dashboard for >30 minutes

Solution: Pause polling when tab not focused
window.addEventListener('visibilitychange', () => {
  if (document.hidden) clearInterval(interval);
  else startPolling();
});

Awaiting human decision on data fetching architecture.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### How Human Should Respond

```
Decision: Option 2 (Hybrid) with visibility-based polling

Modifications:
- Use 60s polling (not 30s) to reduce API calls
- Pause polling when tab hidden (save requests)
- For PRO tier: can use 30s polling (higher rate limit)

Additional Requirements:
- Show "Last updated: X seconds ago" timestamp
- Add manual refresh button
- Clear polling interval on unmount

Actions:
1. Add to 03-architecture-rules.md:
   "Data Fetching Pattern for Dashboard Pages:
    - Use Server Component for initial data fetch (SSR)
    - Pass to Client Component for polling/updates
    - Polling intervals: FREE 60s, PRO 30s
    - Pause polling when tab not visible
    - Always provide manual refresh button"

2. Create utility: lib/hooks/use-polling.ts for reusable polling logic
3. Implement pattern for alerts page
4. Use same pattern for watchlist, charts pages

Proceed with implementation.
```

---

## 5. DEPENDENCY ADDITIONS

### When to Escalate

**Escalate when:**
- New npm package needed (not in pre-approved list)
- New pip package needed for Flask
- Alternative library proposed (e.g., dayjs vs date-fns)
- Dependency adds significant bundle size (>100KB)
- Dependency has security vulnerabilities reported
- Dependency is not actively maintained
- Multiple dependencies solve same problem

### What Information to Include

```
Issue Type: New Dependency Required
File: [where you need it]
Severity: Low/Medium
Package: [npm package name] OR [pip package name]

Problem:
[Why you need this dependency]

Use Cases:
[Specific features you need from this package]

Options:
1. [Package A]
   - Bundle size: [size]
   - Weekly downloads: [number]
   - Last updated: [date]
   - Pros: [...]
   - Cons: [...]

2. [Package B]
   - Bundle size: [size]
   - Weekly downloads: [number]
   - Last updated: [date]
   - Pros: [...]
   - Cons: [...]

3. [No dependency - implement yourself]
   - Effort: [hours]
   - Pros: [...]
   - Cons: [...]

Security:
- Known vulnerabilities: [check npm audit or snyk]
- Maintainer reputation: [...]
- TypeScript support: [yes/no]

Recommendation:
[Your suggested approach with reasoning]
```

### Example Escalation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: New Dependency Required ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: New Dependency Required
File: lib/utils/date-helpers.ts
Severity: Low
Package: date-fns (npm)

Problem:
Need to format dates, calculate time differences, and handle timezones
for alert timestamps and chart data. JavaScript's native Date API is
verbose and error-prone for these operations.

Use Cases:
1. Format alert createdAt: "2 hours ago", "Yesterday", "Jan 5, 2024"
2. Calculate time until alert triggers
3. Convert MT5 timestamps to user's timezone
4. Parse ISO dates from API responses

Options:

1. date-fns
   - Bundle size: ~20KB (tree-shakeable, only import what you use)
   - Weekly downloads: 46 million
   - Last updated: 2 weeks ago
   - TypeScript: Full TypeScript support
   - Pros:
     * Functional, immutable approach
     * Tree-shakeable (small bundle impact)
     * Most popular (proven, well-tested)
     * Excellent TypeScript types
     * Large community, many examples
   - Cons:
     * No timezone support built-in (needs date-fns-tz)
     * Slightly verbose API

2. dayjs
   - Bundle size: ~7KB (smaller)
   - Weekly downloads: 18 million
   - Last updated: 6 months ago
   - TypeScript: TypeScript types available
   - Pros:
     * Smaller bundle size
     * API similar to moment.js (familiar)
     * Plugin system for features
   - Cons:
     * Less popular than date-fns
     * Mutable API (less functional)
     * Plugin system adds complexity

3. Luxon
   - Bundle size: ~70KB (much larger)
   - Weekly downloads: 8 million
   - Last updated: 3 months ago
   - TypeScript: Full TypeScript support
   - Pros:
     * Excellent timezone support built-in
     * Immutable
     * Modern API
   - Cons:
     * Large bundle size (70KB)
     * Less popular
     * Steeper learning curve

4. Native Date + Intl API (no dependency)
   - Bundle size: 0KB
   - Effort: ~4 hours to implement helpers
   - Pros:
     * No dependency
     * Zero bundle size
     * Built into browser
   - Cons:
     * Verbose, complex code
     * Easy to make timezone mistakes
     * Need to write and maintain custom helpers
     * No relative time formatting built-in

Security:
- date-fns: No known vulnerabilities
- dayjs: No known vulnerabilities
- Luxon: No known vulnerabilities
- All three are actively maintained by reputable developers

Recommendation: date-fns + date-fns-tz

Reasoning:
1. Most popular (46M weekly downloads = battle-tested)
2. Tree-shakeable (only import formatDistanceToNow, not entire library)
3. Actual bundle impact: ~5KB (only the functions we use)
4. Excellent TypeScript support (better DX)
5. date-fns-tz adds timezone support when needed
6. Functional, immutable API (aligns with React patterns)
7. Widely used in React/Next.js ecosystem

Usage estimate:
- Import only: formatDistanceToNow, format, parseISO, differenceInSeconds
- Estimated bundle impact: 5-7KB
- Used in: ~10 files (alert lists, dashboards, charts)

Approve adding date-fns + date-fns-tz?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### How Human Should Respond

```
Decision: Approved - Add date-fns + date-fns-tz

Actions:
1. Install: pnpm add date-fns date-fns-tz
2. Add to 03-architecture-rules.md pre-approved dependencies:
   - date-fns (date formatting and manipulation)
   - date-fns-tz (timezone support)
3. Create helper file: lib/utils/date-helpers.ts with common functions:
   - formatRelativeTime(date: Date): string
   - formatDateTime(date: Date): string
   - calculateTimeUntil(date: Date): string
4. Import only what you need (tree-shaking)
5. Document in 02-quality-standards.md:
   "Use date-fns for date operations, NOT native Date manipulation"

Proceed with installation and implementation.
```

---

## 6. DATABASE MIGRATIONS

### When to Escalate

**Escalate when:**
- Adding new table/model to Prisma schema
- Adding/removing fields from existing models
- Changing field types (data migration may be required)
- Adding/removing relations between models
- Changing unique constraints or indexes
- Any schema change that affects production data

### What Information to Include

```
Issue Type: Database Schema Change
File: prisma/schema.prisma
Severity: High
Migration Type: [Add Table | Add Field | Change Type | etc.]

Problem:
[Why this schema change is needed]

Proposed Schema Change:
[Before/after diff of schema.prisma]

Migration SQL (preview):
[Run: npx prisma migrate dev --create-only]
[Show SQL that Prisma will generate]

Impact Analysis:
- Existing data: [what happens to existing rows]
- Downtime: [is downtime required?]
- Reversibility: [can this be rolled back?]
- Affected queries: [what code needs updates]

Risk Assessment:
- Data loss risk: [Low/Medium/High]
- Performance impact: [adding indexes, large table scans, etc.]
- Breaking changes: [does existing code break?]

Migration Plan:
1. Local: [test migration locally]
2. Railway: [deploy migration to production]
3. Verification: [how to verify migration succeeded]
4. Rollback plan: [if migration fails]
```

### Example Escalation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: Database Schema Change ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: Database Schema Change
File: prisma/schema.prisma
Severity: High
Migration Type: Add Field (nullable)

Problem:
Need to add "triggeredAt" field to Alert model to track when alerts
were last triggered. Required to match OpenAPI spec and implement
alert triggering feature.

Proposed Schema Change:

BEFORE:
model Alert {
  id          String   @id @default(cuid())
  userId      String
  symbol      String
  timeframe   String
  condition   String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isActive])
}

AFTER:
model Alert {
  id          String   @id @default(cuid())
  userId      String
  symbol      String
  timeframe   String
  condition   String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  triggeredAt DateTime?  // ← NEW FIELD (nullable)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isActive])
}

Migration SQL (preview):
-- AlterTable
ALTER TABLE "Alert" ADD COLUMN "triggeredAt" TIMESTAMP(3);

Impact Analysis:
- Existing data: All existing alerts will have triggeredAt = NULL (safe)
- Downtime: No downtime (adding nullable field is non-blocking in PostgreSQL)
- Reversibility: Can rollback easily (just remove column)
- Affected queries:
  * No existing queries break (field is nullable)
  * New code needs to handle null vs date

Risk Assessment:
- Data loss risk: LOW (no data deleted)
- Performance impact: NONE (nullable field, no default value computation)
- Breaking changes: NONE (existing code unaffected)

Migration Plan:

1. Local Testing:
   ```
   npx prisma migrate dev --name add_triggered_at_to_alert
   npx prisma studio  # Verify existing alerts have null triggeredAt
   ```

2. Railway Deployment:
   ```
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

3. Verification:
   - Check Railway dashboard for migration success
   - Run query: SELECT id, triggeredAt FROM "Alert" LIMIT 5;
   - Verify existing alerts have NULL triggeredAt
   - Create test alert, verify structure

4. Rollback Plan (if needed):
   ```sql
   ALTER TABLE "Alert" DROP COLUMN "triggeredAt";
   ```

5. Code Updates After Migration:
   - Update API responses to include triggeredAt
   - Implement alert triggering logic to set this field
   - Update frontend to display "Last triggered: X ago"

Awaiting human approval to proceed with migration.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### How Human Should Respond

```
Decision: Approved - Proceed with migration

Pre-Migration Checklist:
- [ ] Backup Railway database (Railway dashboard → Database → Create backup)
- [ ] Migration tested locally successfully
- [ ] Migration SQL reviewed (just ADD COLUMN, no data changes)
- [ ] Low-risk migration (nullable field, no constraints)

Actions:
1. Test migration locally (DONE per your message)
2. Create Railway backup (I'll do this now)
3. Run migration on Railway:
   DATABASE_URL=[Railway URL] npx prisma migrate deploy
4. Verify in Railway:
   - Check migrations table
   - Query Alert table
   - Confirm triggeredAt column exists
5. Continue implementing alert triggering logic
6. Update PROGRESS.md: "Added triggeredAt field via migration"

Proceed after confirming Railway backup is complete.
```

---

## 7. BREAKING CHANGES

### When to Escalate

**Escalate when:**
- Changing API response structure that frontend depends on
- Removing API endpoints
- Changing required fields in request/response
- Modifying authentication requirements
- Changing URL structure
- Renaming database fields that affect queries
- Changing function signatures in shared utilities

### What Information to Include

```
Issue Type: Breaking Change
File: [filename]
Severity: High
Change Type: [API Response | Endpoint Removal | Schema Change | etc.]

Problem:
[Why this breaking change is needed]

Current Behavior:
[What currently exists]

Proposed Behavior:
[What you want to change to]

Breaking Impact:
- Frontend: [what breaks in UI]
- API contracts: [which endpoints affected]
- Database: [schema changes needed]
- External services: [integrations affected]

Migration Path:
[How to transition from old to new]

Options:
1. [Immediate breaking change]
2. [Versioned API approach]
3. [Gradual migration with deprecation]
```

### Example Escalation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: Breaking Change ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: Breaking Change
File: app/api/alerts/route.ts
Severity: High
Change Type: API Response Structure

Problem:
Current GET /api/alerts endpoint returns Alert[] directly (array).
To support pagination, sorting, and filtering, need to wrap response
in object with metadata. This changes response structure.

Current Behavior:
GET /api/alerts → Returns:
[
  { id: "1", symbol: "EURUSD", ... },
  { id: "2", symbol: "BTCUSD", ... }
]

Frontend code expects:
const res = await fetch('/api/alerts');
const alerts: Alert[] = await res.json();
setAlerts(alerts);

Proposed Behavior:
GET /api/alerts → Returns:
{
  data: [
    { id: "1", symbol: "EURUSD", ... },
    { id: "2", symbol: "BTCUSD", ... }
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 45,
    totalPages: 3
  },
  filters: {
    isActive: true
  }
}

Frontend code must change to:
const res = await fetch('/api/alerts?page=1');
const json = await res.json();
const alerts = json.data;  // ← Changed
setAlerts(alerts);

Breaking Impact:
- Frontend: All components fetching /api/alerts will break
  * components/alerts/alert-list.tsx
  * app/dashboard/alerts/page.tsx
  * hooks/use-alerts.ts
- API contract: Violates current OpenAPI spec
- Database: No changes needed
- External services: None (internal API only)

Migration Path:

Option 1: Immediate Breaking Change (NOT RECOMMENDED)
1. Update API route to return new structure
2. Update frontend to expect new structure
3. Deploy both simultaneously
Pros: Simple, clean break
Cons: Must update all frontend code before deploying
      Risk of missing a component

Option 2: Versioned API (/api/v1/alerts vs /api/v2/alerts)
1. Create new endpoint: /api/v2/alerts with new structure
2. Keep /api/alerts unchanged (old structure)
3. Migrate frontend components one by one to /api/v2/alerts
4. Once all migrated, deprecate /api/alerts
Pros: No breakage, gradual migration
Cons: Maintains two endpoints temporarily
      More code to maintain

Option 3: Query Parameter Opt-In (RECOMMENDED)
1. Update API to check query param: ?paginated=true
2. If ?paginated=true → return new structure
3. If no param → return old structure (backward compatible)
4. Migrate frontend components to use ?paginated=true
5. After all migrated, make pagination default (remove param)
6. Eventually remove old structure support
Pros: Backward compatible, gradual migration, no duplicate endpoints
Cons: Slight complexity in API route logic temporarily

Recommended: Option 3 (Query Parameter Opt-In)

Implementation:
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paginated = searchParams.get('paginated') === 'true';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  const alerts = await getUserAlerts(userId);

  if (paginated) {
    // New structure
    return Response.json({
      data: alerts.slice((page - 1) * pageSize, page * pageSize),
      pagination: {
        page,
        pageSize,
        total: alerts.length,
        totalPages: Math.ceil(alerts.length / pageSize),
      },
    });
  } else {
    // Old structure (backward compatible)
    return Response.json(alerts);
  }
}

Migration Timeline:
- Week 1: Deploy API with opt-in pagination
- Week 2: Update frontend components to use ?paginated=true
- Week 3: Make pagination default, deprecate old structure
- Week 4: Remove old structure support

Awaiting human decision on breaking change approach.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### How Human Should Respond

```
Decision: Option 3 (Query Parameter Opt-In) - Approved

Actions:
1. Implement dual-mode API route as suggested
2. Update OpenAPI spec to document both modes
3. Add deprecation notice to old mode:
   WARNING header: "Deprecated - use ?paginated=true for new structure"
4. Update 03-architecture-rules.md:
   "Breaking API Changes: Use query param opt-in for gradual migration"
5. Create tracking issue: "Migrate all components to paginated API"
6. After ALL components migrated (verify via grep), remove old mode

Proceed with implementation. Create TODO in code:
// TODO: Remove backward compatibility (non-paginated mode) after 2024-02-01
//       when all frontend components migrated
```

---

Due to character limits, I'll create a second file to continue with sections 8-10 and the summary.
## 8. CLAUDE CODE VALIDATION FAILURES

### When to Escalate

**Escalate when:**
- >3 High severity issues after auto-fix attempts
- Any Critical issues detected
- Repeated auto-fix failures (3 attempts exhausted for same issue)
- Unclear how to fix validation errors
- Validation errors contradict policy requirements
- False positives from validator

### What Information to Include

```
Issue Type: Claude Code Validation Failure
File: [filename]
Severity: Critical/High
Attempts: [number of fix attempts made]

Validation Results:
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

Issue Details:
[List each High/Critical issue with line numbers]

Auto-Fix Attempts:
Attempt 1: [what you tried]
Result: [still failed - why?]

Attempt 2: [what you tried]
Result: [still failed - why?]

Attempt 3: [what you tried]
Result: [still failed - why?]

Root Cause Analysis:
[Why fixes aren't working - misunderstood requirement? conflicting policies?]

Options:
1. [Try different approach]
2. [Update policy that's causing conflict]
3. [Accept validation issue as false positive]
```

### Example Escalation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: Claude Code Validation Failure ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: Claude Code Validation Failure
File: app/api/indicators/[symbol]/[timeframe]/route.ts
Severity: High
Attempts: 3 (exhausted)

Validation Results:
- Critical: 0
- High: 4
- Medium: 2
- Low: 1

High Severity Issues:
1. Line 45: Missing tier validation for timeframe access
2. Line 67: MT5 API call not wrapped in try/catch
3. Line 89: Response doesn't match OpenAPI schema (missing "metadata" field)
4. Line 102: No rate limiting check before expensive operation

Auto-Fix Attempts:

Attempt 1:
- Added try/catch around MT5 call (fixed issue #2)
- Added tier validation for symbol (but forgot timeframe - issue #1 remains)
Result: Still 3 High issues

Attempt 2:
- Added timeframe validation (fixed issue #1)
- Added "metadata" field to response (fixed issue #3)
Result: Still 2 High issues (new issue appeared: metadata structure wrong)

Attempt 3:
- Fixed metadata structure
- Added rate limiting check (fixed issue #4)
Result: 1 High issue remains (metadata now causes schema mismatch)

Root Cause Analysis:
The "metadata" field requirement is unclear:
- Claude Code validation requires it (based on OpenAPI)
- OpenAPI spec shows: metadata?: { fetchedAt: string; source: string }
- But when I add it, validation says structure doesn't match
- Possible issues:
  1. My understanding of metadata structure is wrong
  2. OpenAPI spec has error
  3. Claude Code validation has false positive
  4. Missing type definition somewhere

Current Code:
export async function GET(
  req: Request,
  { params }: { params: { symbol: string; timeframe: string } }
) {
  // 1. Authentication ✅
  const session = await getServerSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Rate limiting ✅
  await checkRateLimit(session.user.id);

  // 3. Tier validation ✅
  const userTier = session.user.tier || 'FREE';
  validateChartAccess(userTier, params.symbol, params.timeframe);

  // 4. Fetch data ✅
  try {
    const data = await fetchFromMT5(params.symbol, params.timeframe);

    return Response.json({
      symbol: params.symbol,
      timeframe: params.timeframe,
      indicators: data.indicators,
      metadata: {  // ← Validation says this is wrong, but matches spec?
        fetchedAt: new Date().toISOString(),
        source: 'MT5'
      }
    });
  } catch (error) {
    console.error('MT5 fetch error:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

OpenAPI Spec (trading_alerts_openapi.yaml):
IndicatorResponse:
  type: object
  required: [symbol, timeframe, indicators]
  properties:
    symbol: { type: string }
    timeframe: { type: string }
    indicators: { $ref: '#/components/schemas/IndicatorData' }
    metadata:  # ← Optional field
      type: object
      properties:
        fetchedAt: { type: string, format: date-time }
        source: { type: string }

My metadata structure matches the spec exactly, but validation still flags it.

Options:
1. Generate types from OpenAPI and use them (ensures exact match)
   sh scripts/openapi/generate-nextjs-types.sh
   import { IndicatorResponse } from '@/lib/api-client'
   Pros: Type-safe, guaranteed to match
   Cons: Should have done this from start

2. Make metadata optional and omit if validation fails
   Pros: Unblocks progress
   Cons: Loses potentially useful field

3. Ask human to review OpenAPI spec for errors
   Pros: Might find actual spec issue
   Cons: Delays progress

Recommendation: Option 1 (Use auto-generated types)

Reasoning:
- Should be using generated types anyway (policy requirement)
- Guarantees match with OpenAPI spec
- Type-safe at compile time
- Solves root cause (not using contract-first types)

Awaiting human guidance on validation failure resolution.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### How Human Should Respond

```
Decision: Option 1 - Use auto-generated types

Root Cause:
You're manually constructing response instead of using generated types from OpenAPI.
This is exactly why we have type generation - to prevent these mismatches.

Actions:
1. Generate types (if not already done):
   sh scripts/openapi/generate-nextjs-types.sh

2. Import and use generated types:
   import type { IndicatorResponse } from '@/lib/api-client';

   export async function GET(...): Promise<Response> {
     // ...
     const response: IndicatorResponse = {
       symbol: params.symbol,
       timeframe: params.timeframe,
       indicators: data.indicators,
       metadata: {
         fetchedAt: new Date().toISOString(),
         source: 'MT5'
       }
     };

     return Response.json(response);
   }

3. TypeScript will now catch any mismatch at compile time

4. Update 01-approval-policies.md to emphasize:
   "CRITICAL: Always use auto-generated types from lib/api-client.
    Never manually define response shapes that exist in OpenAPI."

5. Add to 02-quality-standards.md:
   "Import response types from OpenAPI-generated lib/api-client, not manual interfaces."

Lesson Learned:
This validation failure happened because policy wasn't specific enough about
ALWAYS using generated types. Update policies to prevent future occurrences.

Proceed with using generated types.
```

---

## 9. UNCLEAR REQUIREMENTS

### When to Escalate

**Escalate when:**
- Specs are ambiguous or contradictory
- Missing information needed for implementation
- Conflicting requirements from different docs
- Edge cases not covered by specs
- Business logic unclear
- Multiple valid interpretations possible

### What Information to Include

```
Issue Type: Unclear Requirement
File: [filename]
Severity: Medium
Requirement Source: [which spec/doc]

Problem:
[Explain what's unclear or contradictory]

What the Specs Say:
[Excerpts from relevant specs]

Ambiguity:
[What's unclear about the requirement]

Interpretation Options:
1. [Interpretation A]
   - Assumes: [...]
   - Implementation: [...]
   - Edge cases: [...]

2. [Interpretation B]
   - Assumes: [...]
   - Implementation: [...]
   - Edge cases: [...]

Impact of Wrong Choice:
[What happens if we choose wrong interpretation]

Questions for Human:
1. [Specific question]
2. [Specific question]
3. [Specific question]
```

### Example Escalation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: Unclear Requirement ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: Unclear Requirement
File: lib/alerts/condition-evaluator.ts
Severity: Medium
Requirement Source: v5_part_k.md (Alert Conditions)

Problem:
The spec mentions users can create "conditions" for alerts (e.g., "RSI > 70"),
but doesn't specify the exact syntax, how to parse them, or what operators
are supported.

What the Specs Say:

From v5_part_k.md:
"Users can set conditions for alerts. When condition is met, alert triggers.
Examples: 'RSI > 70', 'price crosses above 1.1000', 'MACD crosses signal line'"

From trading_alerts_openapi.yaml:
condition:
  type: string
  minLength: 1
  maxLength: 500
  description: "Alert trigger condition"
  example: "RSI > 70"

Ambiguity:
1. Is condition free-form text or structured format?
2. How do we parse and evaluate conditions?
3. What indicators are supported? (RSI, MACD, price, etc.)
4. What operators are supported? (>, <, =, crosses, etc.)
5. Can conditions be combined? (AND/OR logic)
6. Who evaluates conditions? (Frontend? Backend? External service?)

Interpretation Options:

Option A: Free-Form Text (Simple, No Validation)
- Condition stored as-is in database
- No parsing or validation
- Manual user interpretation
- No automatic triggering
Pros: Simple to implement, flexible
Cons: Can't auto-trigger alerts, no validation, unclear UX
Implementation: Just store string, display it to user

Option B: Predefined Templates (Structured, Limited)
- Dropdown selection: "RSI above", "Price below", etc.
- User fills in values: threshold, symbol, timeframe
- Backend evaluates conditions against MT5 data
Pros: Parseable, validatable, can auto-trigger
Cons: Limited flexibility, more UI complexity
Implementation:
  type ConditionType = 'RSI_ABOVE' | 'RSI_BELOW' | 'PRICE_ABOVE' | 'PRICE_BELOW'
  { type: 'RSI_ABOVE', value: 70, symbol: 'EURUSD', timeframe: 'H1' }

Option C: Simple Expression Parser (Flexible, Complex)
- Support syntax: "RSI > 70", "price < 1.2000"
- Parse with regex or parser library
- Evaluate against MT5 data
Pros: Flexible like free-form, but parseable
Cons: Complex parser, validation edge cases, security risk (code injection)
Implementation: Use expression parser library (e.g., mathjs or custom regex)

Impact of Wrong Choice:
- Option A: Can't implement auto-triggering feature (major feature loss)
- Option B: Users complain about limited flexibility
- Option C: Security risk if parser allows code injection

Questions for Human:
1. Should alerts auto-trigger based on conditions? (If no → Option A ok)
2. If yes, who evaluates conditions? (Backend cron job? Real-time?)
3. What indicators must be supported? (Just RSI? MACD? All indicators?)
4. Should we support complex conditions (AND/OR)? Or simple single conditions?
5. Is there a budget for expression parser library? Or build custom?

Recommended Approach (for MVP):
Option B (Predefined Templates) - Start simple
- Phase 1 (MVP): Support 4 simple conditions:
  * RSI > [value]
  * RSI < [value]
  * Price > [value]
  * Price < [value]
- Phase 2 (Post-MVP): Add more indicators, complex conditions
- Pros: Fast to implement, secure, validatable, auto-triggerable
- Cons: Limited (but sufficient for MVP)

Awaiting human clarification on alert condition requirements.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### How Human Should Respond

```
Decision: Option B (Predefined Templates) for MVP

Clarifications:
1. Yes, alerts should auto-trigger (key feature)
2. Backend cron job evaluates every 5 minutes
3. MVP supports: RSI, MACD, Price (3 indicators)
4. Simple single conditions only (no AND/OR for MVP)
5. No external parser library - build simple regex matcher

MVP Condition Types:
- RSI > [value]
- RSI < [value]
- MACD_LINE > SIGNAL_LINE (MACD crosses above signal)
- MACD_LINE < SIGNAL_LINE (MACD crosses below signal)
- PRICE > [value]
- PRICE < [value]

Implementation:
1. Create lib/alerts/condition-types.ts with enum
2. Frontend: Dropdown to select type + input for value
3. Store as JSON in database:
   { type: 'RSI_ABOVE', threshold: 70 }
4. Backend cron: lib/alerts/evaluator.ts evaluates conditions
5. OpenAPI spec: Define ConditionInput schema with discriminated union

Post-MVP (Phase 2):
- Add more indicators (Bollinger Bands, Moving Averages)
- Add AND/OR logic for combining conditions
- Add "crosses above/below" operators

Actions:
1. Update v5_part_k.md with specific condition types for MVP
2. Create ConditionType enum in lib/alerts/condition-types.ts
3. Update OpenAPI spec with structured ConditionInput schema
4. Implement dropdown UI for condition selection
5. Implement backend evaluator (lib/alerts/evaluator.ts)

Proceed with Option B implementation.
```

---

## 10. TEST FAILURES

### When to Escalate

**Escalate when:**
- TypeScript compilation errors after code generation
- Jest unit tests fail after changes
- Integration tests fail unexpectedly
- Build failures (pnpm build)
- E2E tests fail
- Tests pass locally but fail in CI/CD

### What Information to Include

```
Issue Type: Test Failure
File: [test file or source file causing failure]
Severity: High
Test Type: [Unit | Integration | E2E | Compilation | Build]

Error Message:
[Full error message from test runner]

Code Causing Failure:
[Relevant code snippet]

What Changed:
[What you just implemented that triggered the failure]

Why Test is Failing:
[Your analysis of the root cause]

Attempted Fixes:
[What you tried to fix it]

Options:
1. [Fix code to pass test]
2. [Update test to match new behavior]
3. [Disable test temporarily (NOT RECOMMENDED)]
```

### Example Escalation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: Test Failure ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: Test Failure
File: app/api/alerts/route.ts
Severity: High
Test Type: TypeScript Compilation Error

Error Message:
app/api/alerts/route.ts:42:18 - error TS2345: Argument of type 'string | undefined' 
is not assignable to parameter of type 'string'.

  42   await createAlert(userId, symbol, timeframe);
                         ~~~~~~

Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.

Code Causing Failure:
export async function POST(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id;  // Type: string | undefined

  const body = await req.json();
  const { symbol, timeframe, condition } = body;

  // createAlert expects userId: string, but we have string | undefined
  await createAlert(userId, symbol, timeframe);  // ❌ Type error
}

Function signature:
async function createAlert(
  userId: string,  // Required, not optional
  symbol: string,
  timeframe: string
): Promise<Alert>

What Changed:
Just implemented POST /api/alerts endpoint. Added authentication check
which gets userId from session. TypeScript correctly identifies that
session might be null, making userId possibly undefined.

Why Test is Failing:
TypeScript's strict null checks are working as intended. The code has
a potential bug: if session is null/undefined, userId is undefined,
but createAlert requires a string. This would cause a runtime error.

Attempted Fixes:

Option 1: Non-null assertion (UNSAFE - don't do this)
await createAlert(userId!, symbol, timeframe);  // ❌ Bypasses type safety

Option 2: Add null check (CORRECT)
if (!userId) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
await createAlert(userId, symbol, timeframe);  // ✅ userId is now definitely string

Option 3: Make createAlert accept undefined (WRONG - bad API design)
async function createAlert(userId: string | undefined, ...) {
  // Creates alerts with undefined userId? Bad data model
}

Analysis:
Option 2 is correct. The code should check authentication BEFORE
calling createAlert. If userId is undefined, return 401 Unauthorized.
After the check, TypeScript's control flow analysis knows userId is string.

Recommended Fix:
export async function POST(req: Request) {
  // 1. Get session
  const session = await getServerSession();

  // 2. Check authentication EARLY
  if (!session?.user?.id) {
    return Response.json(
      { error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  // 3. After check, userId is guaranteed to be string
  const userId = session.user.id;  // Type: string (TypeScript knows it's defined)

  // 4. Rest of logic
  const body = await req.json();
  const { symbol, timeframe, condition } = body;

  await createAlert(userId, symbol, timeframe);  // ✅ No type error
}

This follows 01-approval-policies.md Section 1.2: "All protected routes must
verify authentication BEFORE business logic."

Awaiting approval to implement Option 2 (null check).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### How Human Should Respond

```
Decision: Approved - Implement Option 2 (null check)

This is exactly what TypeScript is supposed to catch! Good job on the
strict type checking.

Actions:
1. Implement the recommended fix (null check before createAlert)
2. Verify TypeScript compilation passes: pnpm type-check
3. Add to 02-quality-standards.md:
   "PATTERN: Always check session?.user?.id for null BEFORE using userId.
    Return 401 if null. After check, TypeScript knows it's defined."
4. This pattern applies to ALL protected API routes

Good example of:
- TypeScript catching bugs at compile time (not runtime)
- Following authentication-first pattern
- Using TypeScript's control flow analysis

Proceed with implementation.
```

---

## ESCALATION MESSAGE FORMAT (STANDARD)

All escalations should follow this format for consistency:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ESCALATION: [CATEGORY] ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue Type: [One of 10 categories]
File: [filename with path]
Severity: [Critical/High/Medium/Low]

Problem:
[Clear 2-3 sentence explanation of the issue]

[Category-Specific Sections - see examples above]

Options:
1. [Option 1]
   Pros: [...]
   Cons: [...]

2. [Option 2]
   Pros: [...]
   Cons: [...]

3. [Option 3]
   Pros: [...]
   Cons: [...]

Recommendation:
[Your best judgment with detailed reasoning]

Awaiting human decision...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## SUMMARY: When to Escalate

| Category | Trigger | Severity | Can Wait? |
|----------|---------|----------|-----------|
| 1. Security Issues | SQL injection, XSS, auth bypass, exposed secrets | Critical | ❌ No - Escalate immediately |
| 2. API Contract Violations | Response doesn't match OpenAPI after 3 fixes | High | ✅ Yes - After exhausting auto-fixes |
| 3. Policy Conflicts/Gaps | Two policies contradict, scenario not covered | Medium | ✅ Yes - Document and ask |
| 4. Architectural Decisions | Multiple valid approaches, long-term impact | Medium | ✅ Yes - Present options |
| 5. Dependency Additions | New npm/pip package needed | Low | ✅ Yes - Provide analysis |
| 6. Database Migrations | Schema changes, adding/removing fields | High | ❌ No - Requires approval before execution |
| 7. Breaking Changes | API changes that break frontend | High | ❌ No - Coordinate before implementing |
| 8. Validation Failures | >3 High issues or any Critical after 3 attempts | High | ✅ Yes - After 3 attempts |
| 9. Unclear Requirements | Ambiguous specs, missing info | Medium | ✅ Yes - Clarify before implementing |
| 10. Test Failures | TypeScript errors, failed tests | High | ❌ No - Must fix before proceeding |

---

## ESCALATION WORKFLOW

```
1. Detect escalation condition
   ↓
2. STOP autonomous work
   ↓
3. Format escalation message
   ↓
4. Present to human with:
   - Clear problem statement
   - Relevant context/code
   - Options with pros/cons
   - Your recommendation
   ↓
5. WAIT for human response
   ↓
6. Receive decision
   ↓
7. Update relevant policy (if gap found)
   ↓
8. Resume autonomous work
```

**Never:**
- ❌ Continue working while waiting for escalation response
- ❌ Make assumptions about human's decision
- ❌ Skip escalation to "save time"
- ❌ Escalate trivial issues (use auto-fix first)

**Always:**
- ✅ Provide complete context
- ✅ Analyze options thoroughly
- ✅ Make a recommendation
- ✅ Wait patiently for response
- ✅ Update policies after resolution

---

## POLICY IMPROVEMENT AFTER ESCALATION

After every escalation resolution:

1. **Identify the Gap:** What policy was missing/unclear?
2. **Update Policy:** Add rule/clarification to prevent future escalations
3. **Document Decision:** Add example to relevant policy
4. **Test Understanding:** Verify policy now covers the scenario
5. **Commit Policy Update:** Clear commit message explaining what was learned

**Example:**

```bash
git add docs/policies/01-approval-policies.md
git commit -m "Add policy: Always check authentication before userId usage

Learned from escalation: TypeScript caught that session?.user?.id might be
undefined. Added explicit rule to check authentication FIRST, then use userId.

This prevents similar escalations for all protected routes."
git push
```

**Result:** Future similar scenarios auto-approve (no escalation needed).

---

## LEARNING LOOP

```
Escalation
    ↓
Human Decision
    ↓
Policy Update
    ↓
Fewer Future Escalations
    ↓
More Autonomous Work
```

**Goal:** Each escalation makes the system smarter. Over time, escalations decrease as policies become more comprehensive.

---

**End of Escalation Triggers**

These triggers enable Aider with MiniMax M2 to work autonomously while seeking human guidance for exceptions. Update this document as you learn from escalations!

