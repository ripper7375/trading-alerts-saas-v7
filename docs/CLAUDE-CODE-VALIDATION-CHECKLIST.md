# Claude Code Validation Checklist

**Created:** 2025-11-18
**Purpose:** Comprehensive checklist for Claude Code to validate generated code
**For:** Trading Alerts SaaS V7 autonomous building with Aider

---

## Overview

This checklist defines **exactly what Claude Code should validate** after Aider generates each file. Use this as the definitive validation criteria to ensure consistent, high-quality code across all 170+ files.

---

## 🏗️ Build-Order Compliance Checks (NEW)

These checks ensure files are built in the correct sequence with proper dependencies.

### 1. Build Sequence Validation

- [ ] **File built in correct order**
  - File number matches build-order sequence (e.g., "File 3/12")
  - Not building file 5/12 before files 1-4/12 are complete
  - Build-order file specifies this is the correct file to build now

- [ ] **Dependencies met**
  - All prerequisite files exist (check build-order dependencies section)
  - Example: If building `app/api/alerts/route.ts` depends on `lib/tier-validation.ts`, verify it exists
  - No forward dependencies (file doesn't depend on files not yet built)

- [ ] **Correct part**
  - File belongs to the part currently being built
  - Part number matches v5-structure-division.md

### 2. Pattern Reference Compliance

- [ ] **Uses specified pattern**
  - Build-order file specifies which pattern from 05-coding-patterns.md to use
  - Generated code follows that pattern exactly
  - Pattern number matches (Pattern 1, Pattern 2, etc.)

- [ ] **Pattern adaptations correct**
  - Pattern customized for this specific file's requirements
  - All pattern elements present (imports, types, error handling, etc.)
  - No pattern deviations unless documented in build-order

### 3. OpenAPI Reference Compliance

- [ ] **Matches specified OpenAPI section**
  - Build-order file references specific OpenAPI schemas
  - Generated code uses those exact schemas
  - Request/response types match OpenAPI definitions

- [ ] **HTTP methods correct**
  - HTTP method (GET, POST, PUT, DELETE) matches build-order specification
  - Matches OpenAPI operation definition

---

## 📋 Policy Compliance Checks (9 Constitutions)

These checks ensure code follows all project policies (00-08).

### 4. Tier Specifications (00-tier-specifications.md)

- [ ] **FREE tier restrictions enforced**
  - 5 symbols: BTCUSD, EURUSD, USDJPY, US30, XAUUSD
  - 3 timeframes: H1, H4, D1
  - Validation logic present where applicable

- [ ] **PRO tier restrictions enforced**
  - 15 symbols (all available symbols)
  - 9 timeframes: M5, M15, M30, H1, H4, D1, W1, MN1
  - Proper tier checking logic

- [ ] **Tier validation implemented**
  - Uses `validateTierAccess()` utility function
  - Returns 403 status with clear upgrade message for tier violations
  - Checks both symbol AND timeframe restrictions

### 5. Approval Policies (01-approval-policies.md)

- [ ] **Code meets auto-approve criteria**
  - All TypeScript types defined (no `any`)
  - Error handling comprehensive
  - Follows patterns exactly
  - API contract compliant
  - Security standards met
  - Tier validation present (if applicable)

- [ ] **Auto-fix criteria clear**
  - If issues found, are they minor and fixable?
  - Type errors, missing imports, wrong status codes, pattern deviations

- [ ] **Escalation criteria clear**
  - Architectural decisions documented
  - No ambiguous requirements remain
  - Security-sensitive operations handled correctly

### 6. Quality Standards (02-quality-standards.md)

- [ ] **Code quality metrics met**
  - No linting errors
  - No TypeScript errors
  - Consistent formatting
  - Clear variable names
  - Appropriate comments

- [ ] **Performance standards**
  - No obvious performance issues
  - Database queries optimized (no N+1 queries)
  - Appropriate caching where needed

- [ ] **Maintainability**
  - Code is readable and understandable
  - Functions are appropriately sized
  - Complexity is manageable

### 7. Architecture Rules (03-architecture-rules.md)

- [ ] **System design constraints followed**
  - Next.js 15 App Router patterns
  - Correct file locations
  - Proper component structure
  - Database access patterns correct

- [ ] **Architectural decisions implemented**
  - Tier validation uses utility function (not middleware)
  - Notifications use async queue (if applicable)
  - Authentication patterns match decisions

### 8. Escalation Triggers (04-escalation-triggers.md)

- [ ] **No escalation triggers present**
  - No architectural decisions needed
  - No ambiguous requirements
  - No security-sensitive operations without clear guidance
  - No cross-part dependencies unresolved
  - No breaking changes required

### 9. Coding Patterns (05-coding-patterns.md)

- [ ] **Pattern followed exactly**
  - Matches specified pattern from build-order
  - All pattern elements present
  - Pattern customizations appropriate

- [ ] **Pattern elements complete**
  - Imports correct
  - Types defined
  - Error handling present
  - Validation schemas included
  - Authentication checks (if required)
  - Tier validation (if required)

### 10. dLocal Integration Rules (07-dlocal-integration-rules.md)

*(Only for Part 18: dLocal Payment Integration)*

- [ ] **dLocal-specific requirements met**
  - Payment flow correct
  - Webhook handling implemented
  - Error handling for dLocal responses
  - Currency and country handling

### 11. Google OAuth Rules (08-google-oauth-implementation-rules.md)

*(Only for Part 5: Authentication)*

- [ ] **OAuth integration correct**
  - NextAuth v4 configuration
  - Google provider setup
  - Session management
  - Error handling for OAuth failures

---

## ✅ TypeScript Type Safety Checks

These checks ensure complete type safety across the codebase.

### 12. Type Definitions

- [ ] **No `any` types**
  - All variables have explicit types
  - All function parameters typed
  - All return types specified
  - No implicit `any`

- [ ] **Imports from generated types**
  - Uses types from `@/lib/api-client` (OpenAPI-generated)
  - Types match OpenAPI schemas exactly
  - No manually duplicated type definitions

- [ ] **Type consistency**
  - Types match across file
  - No type casting without justification
  - Proper union types where needed

### 13. Function Signatures

- [ ] **All parameters typed**
  ```typescript
  // ✅ GOOD
  function createAlert(data: CreateAlertRequest): Promise<Alert>

  // ❌ BAD
  function createAlert(data)
  ```

- [ ] **All return types specified**
  ```typescript
  // ✅ GOOD
  export async function POST(req: NextRequest): Promise<NextResponse<Alert | { error: string }>>

  // ❌ BAD
  export async function POST(req: NextRequest)
  ```

- [ ] **Async functions return Promise types**
  - All async functions have `Promise<T>` return type
  - Promise types match actual return values

---

## 🛡️ Error Handling Checks

These checks ensure robust error handling throughout the application.

### 14. Try-Catch Blocks

- [ ] **Present for all risky operations**
  - Database operations wrapped in try-catch
  - External API calls wrapped in try-catch
  - File system operations wrapped in try-catch

- [ ] **Specific error types caught**
  ```typescript
  // ✅ GOOD
  catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation error
    }
    if (error.code === 'P2002') {
      // Handle Prisma unique constraint violation
    }
  }

  // ❌ BAD
  catch (error) {
    return { error: 'Error' }
  }
  ```

### 15. Error Messages

- [ ] **User-friendly messages**
  - Clear, actionable error messages
  - No technical jargon exposed to users
  - No stack traces in production responses

- [ ] **Proper HTTP status codes**
  - 200: Success
  - 201: Created
  - 400: Bad request (validation error)
  - 401: Unauthorized (not logged in)
  - 403: Forbidden (logged in but not allowed)
  - 404: Not found
  - 409: Conflict (duplicate resource)
  - 500: Internal server error

- [ ] **Error logging implemented**
  ```typescript
  // ✅ GOOD
  catch (error) {
    console.error('Alert creation failed:', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
  ```

### 16. Edge Cases Handled

- [ ] **Null/undefined checks**
  - All potentially null values checked
  - Proper default values where appropriate

- [ ] **Empty array/object handling**
  - Empty responses handled gracefully
  - No undefined access errors

- [ ] **Network failures handled**
  - Retry logic where appropriate
  - Timeout handling

---

## 🔐 Security Standards Checks

These checks ensure application security.

### 17. Authentication Checks

- [ ] **Authentication required where needed**
  ```typescript
  // ✅ GOOD - Protected route
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  ```

- [ ] **Session validation correct**
  - Uses NextAuth `getServerSession()`
  - Checks for null session
  - Returns 401 for unauthenticated requests

### 18. Authorization Logic

- [ ] **Resource ownership checked**
  ```typescript
  // ✅ GOOD - Ownership check
  const alert = await prisma.alert.findUnique({ where: { id } })
  if (alert.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  ```

- [ ] **Tier-based authorization**
  - Tier restrictions enforced
  - Returns 403 with upgrade message for violations

### 19. Input Validation

- [ ] **All inputs validated**
  - Uses Zod schemas for validation
  - Validation occurs before processing
  - Validation errors return 400 status

- [ ] **SQL injection prevention**
  - Uses Prisma (parameterized queries)
  - No raw SQL without proper escaping
  - No string concatenation in queries

- [ ] **XSS prevention**
  - No innerHTML usage without sanitization
  - React automatically escapes (using JSX)
  - Proper Content-Security-Policy headers

### 20. Sensitive Data Handling

- [ ] **No sensitive data exposed**
  - Passwords never returned in responses
  - API keys not logged
  - No PII in logs

- [ ] **Proper data sanitization**
  - Remove sensitive fields before returning
  - Use select/exclude in Prisma queries

---

## 📡 API Contract Compliance Checks

These checks ensure API endpoints match OpenAPI specifications.

### 21. Request Type Compliance

- [ ] **Request body matches OpenAPI schema**
  ```typescript
  // OpenAPI defines CreateAlertRequest
  const body: CreateAlertRequest = await req.json()
  ```

- [ ] **Request parameters correct**
  - Path parameters match OpenAPI
  - Query parameters match OpenAPI
  - Header requirements met

### 22. Response Type Compliance

- [ ] **Response type matches OpenAPI schema**
  ```typescript
  // ✅ GOOD - Matches OpenAPI Alert type
  export async function GET(req: NextRequest): Promise<NextResponse<Alert[]>>

  // ❌ BAD - Wrong return type
  export async function GET(req: NextRequest): Promise<NextResponse<string>>
  ```

- [ ] **Response structure correct**
  - All required fields present
  - Field types match schema
  - Nested objects correct

### 23. HTTP Method Compliance

- [ ] **Correct HTTP method used**
  - GET for retrieval
  - POST for creation
  - PUT/PATCH for updates
  - DELETE for deletion

- [ ] **Method matches OpenAPI operation**
  - OpenAPI spec defines operation
  - Generated code uses same method

### 24. Status Code Compliance

- [ ] **Status codes match OpenAPI**
  - 200 for successful GET
  - 201 for successful POST (creation)
  - 204 for successful DELETE (no content)
  - Error codes match spec

---

## 🎨 Code Pattern Compliance Checks

These checks ensure consistent code patterns across the codebase.

### 25. File Structure

- [ ] **Imports organized correctly**
  - React/Next imports first
  - Third-party imports next
  - Local imports last
  - Types imported from generated client

- [ ] **Consistent file structure**
  - Validation schemas at top
  - Helper functions before exports
  - Export statement at bottom

### 26. Naming Conventions

- [ ] **Consistent naming**
  - camelCase for variables and functions
  - PascalCase for types and components
  - UPPER_CASE for constants
  - Descriptive names

- [ ] **File naming correct**
  - route.ts for API routes
  - page.tsx for pages
  - Component names match file names

### 27. Comment Style

- [ ] **JSDoc comments present**
  ```typescript
  /**
   * Creates a new alert with tier validation
   * @param req - Next.js request object
   * @returns Alert object or error
   */
  ```

- [ ] **Inline comments where needed**
  - Complex logic explained
  - Not obvious operations commented
  - No redundant comments

---

## 🧪 Testing Considerations

These checks help ensure testability.

### 28. Testability

- [ ] **Functions are testable**
  - Pure functions where possible
  - Dependencies injected
  - No tight coupling

- [ ] **Error paths testable**
  - Error handling can be triggered
  - Edge cases identifiable

---

## 📊 Validation Decision Matrix

Use this matrix to determine validation outcome:

| Category | Critical Issues | High Issues | Medium Issues | Low Issues | Decision |
|----------|----------------|-------------|---------------|------------|----------|
| Build Order | 0 | 0 | 0 | any | ✅ APPROVE |
| Build Order | 1+ | - | - | - | 🚨 ESCALATE |
| Build Order | 0 | 1-2 | any | any | 🔧 FIX |
| Types | 0 | 0 | 0-1 | any | ✅ APPROVE |
| Types | 0 | 1+ | - | - | 🔧 FIX |
| Types | 1+ | - | - | - | 🔧 FIX |
| Errors | 0 | 0 | 0-2 | any | ✅ APPROVE |
| Errors | 0 | 1-2 | - | - | 🔧 FIX |
| Errors | 1+ | - | - | - | 🔧 FIX |
| Security | 0 | 0 | 0 | any | ✅ APPROVE |
| Security | 1+ | - | - | - | 🚨 ESCALATE |
| Security | 0 | 1+ | - | - | 🔧 FIX |
| API Contract | 0 | 0 | 0 | any | ✅ APPROVE |
| API Contract | 1+ | - | - | - | 🔧 FIX |
| Patterns | 0 | 0 | 0-3 | any | ✅ APPROVE |
| Patterns | 0 | 1+ | - | - | 🔧 FIX |

### Issue Severity Definitions

**Critical (🔴):**
- Security vulnerabilities
- Build sequence violations
- Missing dependencies
- Breaking changes

**High (🟠):**
- Type safety violations
- Missing error handling
- API contract mismatches
- Authentication/authorization missing

**Medium (🟡):**
- Incomplete error messages
- Pattern deviations (minor)
- Missing comments
- Suboptimal performance

**Low (🟢):**
- Style inconsistencies
- Non-critical missing comments
- Naming convention deviations

---

## 📝 Validation Report Template

Use this template for all validation reports:

```
📝 Claude Code Validation Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: [file path]
Build Order: Part [X], File [Y]/[Total]
Pattern: [Pattern number from build-order]

BUILD-ORDER COMPLIANCE:
[✅/⚠️/❌] Build sequence correct
[✅/⚠️/❌] Dependencies met
[✅/⚠️/❌] Pattern reference compliance

TYPE SAFETY:
[✅/⚠️/❌] All types defined
[✅/⚠️/❌] No 'any' types
[✅/⚠️/❌] Return types specified

ERROR HANDLING:
[✅/⚠️/❌] Try-catch blocks present
[✅/⚠️/❌] Specific error types caught
[✅/⚠️/❌] User-friendly messages

SECURITY:
[✅/⚠️/❌] Authentication checks
[✅/⚠️/❌] Authorization logic
[✅/⚠️/❌] Input validation

TIER SYSTEM:
[✅/⚠️/❌/N/A] Tier validation present
[✅/⚠️/❌/N/A] Symbol restrictions enforced
[✅/⚠️/❌/N/A] Timeframe restrictions enforced

API CONTRACT:
[✅/⚠️/❌] Request types match OpenAPI
[✅/⚠️/❌] Response types match OpenAPI
[✅/⚠️/❌] HTTP methods correct
[✅/⚠️/❌] Status codes appropriate

CODE PATTERNS:
[✅/⚠️/❌] Follows specified pattern
[✅/⚠️/❌] Import organization correct
[✅/⚠️/❌] File structure consistent

ISSUES FOUND:
[If any issues, list them here with severity and fix suggestions]

DECISION: [✅ APPROVED / 🔧 FIX NEEDED / 🚨 ESCALATE]
Action: [Next step]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎯 Quick Reference: Validation Priority

When validating, check in this order:

1. **Build-Order Compliance** (Is this the right file at the right time?)
2. **Security Standards** (Is this safe?)
3. **Type Safety** (Are all types correct?)
4. **Error Handling** (Can this handle failures?)
5. **API Contract** (Does this match the spec?)
6. **Code Patterns** (Is this consistent?)
7. **Quality Standards** (Is this maintainable?)

---

## ✅ Success Criteria

A file passes validation when:

- ✅ All Critical checks pass (no 🔴 issues)
- ✅ All High checks pass (no 🟠 issues)
- ✅ Medium checks have ≤2 issues (≤2 🟡 issues)
- ✅ Low issues are acceptable (any 🟢 issues)

---

## 📚 Related Documentation

- **CLAUDE.md** - Complete Claude Code guide
- **docs/policies/01-approval-policies.md** - Approval criteria
- **docs/policies/02-quality-standards.md** - Quality requirements
- **docs/policies/05-coding-patterns.md** - Code patterns
- **docs/build-orders/README.md** - Build-order system guide

---

**Last Updated:** 2025-11-18
**Version:** 1.0.0
**Maintained By:** Claude Code validation system
