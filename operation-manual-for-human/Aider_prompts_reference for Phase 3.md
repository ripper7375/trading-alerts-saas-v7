# 🎯 Aider Prompts Reference (CORRECTED)

**Critical Update:** Use `/read-only` for build order files, NOT `/add`

---

## 📌 Starting Part 1 (Foundation)

```bash
# Load files (READ-ONLY!)
/read-only docs/build-orders/part-01-foundation.md
/read-only docs/implementation-guides/v5_part_a.md
```

```
Build Part 1: Foundation & Root Configuration

Follow the build order in part-01-foundation.md exactly.

Requirements:
- Build all 12 files in sequence
- Use patterns from 05-coding-patterns-compress.md
- QUALITY GATES (MANDATORY):
  * All functions must have explicit return types
  * No 'any' types (use proper TypeScript interfaces)
  * Try-catch blocks in all async functions
  * No console.log() statements (use console.error for errors)
  * Protected routes must check session
  * Input validation with Zod schemas for POST/PATCH/PUT
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit each file if approved
- Report progress after every 3 files

Start with File 1/12: .vscode/settings.json
```

---

## 📌 Continuing to Next File in Same Part

```
Continue with next file in Part 1.

Current: File 3/12 completed
Next: File 4/12: tailwind.config.ts

Follow the build order specifications.
```

---

## 📌 Starting Part 2 (Database)

```bash
# Drop Part 1 files first
/drop docs/build-orders/part-01-foundation.md
/drop docs/implementation-guides/v5_part_a.md

# Load Part 2 files (READ-ONLY!)
/read-only docs/build-orders/part-02-database.md
/read-only docs/implementation-guides/v5_part_b.md
```

```
Build Part 2: Database Schema & Migrations

Follow the build order in part-02-database.md exactly.

Requirements:
- Build all 4 files in sequence
- Generate Prisma schema with 2-tier system (FREE/PRO)
- Run prisma generate after schema created
- QUALITY GATES (MANDATORY):
  * All functions must have explicit return types
  * No 'any' types (use proper TypeScript interfaces)
  * Try-catch blocks in all async functions
  * No console.log() statements (use console.error for errors)
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit approved files

Start with File 1/4: prisma/schema.prisma
```

---

## 📌 Starting Part 3 (Type Definitions)

```bash
# Drop Part 2 files
/drop docs/build-orders/part-02-database.md
/drop docs/implementation-guides/v5_part_b.md

# Load Part 3 files (READ-ONLY!)
/read-only docs/build-orders/part-03-types.md
/read-only docs/implementation-guides/v5_part_c.md
```

```
Build Part 3: Type Definitions

Follow the build order in part-03-types.md exactly.

Requirements:
- Build all 6 type files in sequence
- Ensure strict TypeScript compliance
- Match OpenAPI specifications
- QUALITY GATES (MANDATORY):
  * All functions must have explicit return types
  * No 'any' types (use proper TypeScript interfaces)
  * All exports properly typed
  * Import from generated OpenAPI types where applicable
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit approved files

Start with File 1/6: types/user.ts
```

---

## 📌 Starting Part 4 (Tier System)

```bash
/drop docs/build-orders/part-03-types.md
/drop docs/implementation-guides/v5_part_c.md

/read-only docs/build-orders/part-04-tier-system.md
/read-only docs/implementation-guides/v5_part_d.md
```

```
Build Part 4: Tier System

Follow the build order in part-04-tier-system.md exactly.

Requirements:
- Build all 4 tier management files
- Implement FREE and PRO tier logic
- TIER VALIDATION QUALITY GATES (MANDATORY):
  * Symbol/timeframe restrictions enforced
  * Tier checks before all operations
  * Return 403 with clear message if tier insufficient
  * Use validateTierAccess() helper consistently
  * All functions have explicit return types
  * No 'any' types
  * Try-catch blocks in all async functions
- Run validation after each file: npm run validate
- Auto-commit approved files

Start with File 1/4: lib/tier-validation.ts
```

---

## 📌 Starting Part 5 (Authentication)

```bash
/drop docs/build-orders/part-04-tier-system.md
/drop docs/implementation-guides/v5_part_d.md

/read-only docs/build-orders/part-05-authentication.md
/read-only docs/implementation-guides/v5_part_e.md
/read-only docs/policies/08-google-oauth-implementation-rules.md
/read-only docs/OAUTH_IMPLEMENTATION_READY.md
```

```
Build Part 5: Authentication

Follow the build order in part-05-authentication.md exactly.

Requirements:
- Build all 19 authentication files
- Implement Google OAuth + Email/Password
- Follow 08-google-oauth-implementation-rules.md
- SECURITY QUALITY GATES (MANDATORY):
  * Session validation on every protected route
  * Return 401 for missing auth, 403 for forbidden
  * Verify resource ownership (userId matches session.user.id)
  * No hardcoded secrets or credentials
  * Proper error messages (user-friendly)
  * All functions have explicit return types
  * No 'any' types
  * Try-catch blocks in all async functions
- Run validation after each file: npm run validate
- Auto-commit approved files

Start with File 1/19: lib/auth.ts
```

---

## 📌 Starting Part 6 (Flask MT5 Service)

```bash
/drop docs/build-orders/part-05-authentication.md
/drop docs/implementation-guides/v5_part_e.md
/drop docs/policies/08-google-oauth-implementation-rules.md
/drop docs/OAUTH_IMPLEMENTATION_READY.md

/read-only docs/build-orders/part-06-flask-mt5.md
/read-only docs/implementation-guides/v5_part_f.md
/read-only docs/flask_mt5_openapi.yaml
```

```
Build Part 6: Flask MT5 Service

Follow the build order in part-06-flask-mt5.md exactly.

Requirements:
- Build all 15 Flask microservice files
- Follow flask_mt5_openapi.yaml specification
- Implement MT5 integration
- Include error handling and logging
- QUALITY GATES (MANDATORY):
  * All functions must have explicit return types (Python type hints)
  * Try-except blocks in all async functions
  * No print() statements (use logging.error for errors)
  * Protected endpoints must check authentication
  * Input validation with Pydantic models
- Run validation after each file: npm run validate
- Auto-commit approved files

Start with File 1/15: mt5-service/app.py
```

---

## 📌 Complete Part → Implementation Guide Mapping

**IMPORTANT:** Use this table to load the correct implementation guide for each part.

| Part | Build Order File          | Implementation Guide | Status                                 |
| ---- | ------------------------- | -------------------- | -------------------------------------- |
| 1    | part-01-foundation.md     | v5_part_a.md         | ✅ Exists                              |
| 2    | part-02-database.md       | v5_part_b.md         | ✅ Exists                              |
| 3    | part-03-types.md          | v5_part_c.md         | ✅ Exists                              |
| 4    | part-04-tier-system.md    | v5_part_d.md         | ✅ Exists                              |
| 5    | part-05-authentication.md | v5_part_e.md         | ✅ Exists                              |
| 6    | part-06-flask-mt5.md      | v5_part_f.md         | ✅ Exists                              |
| 7    | part-07-indicators-api.md | v5_part_g.md         | ✅ Exists                              |
| 8    | part-08-dashboard.md      | v5_part_h.md         | ✅ Exists                              |
| 9    | part-09-charts.md         | v5_part_i.md         | ✅ Exists                              |
| 10   | part-10-watchlist.md      | v5_part_j.md         | ✅ Exists                              |
| 11   | part-11-alerts.md         | v5_part_k.md         | ✅ Exists                              |
| 12   | part-12-ecommerce.md      | v5_part_l.md         | ✅ Exists                              |
| 13   | part-13-settings.md       | v5_part_m.md         | ✅ Exists                              |
| 14   | part-14-admin.md          | v5_part_n.md         | ✅ Exists                              |
| 15   | part-15-notifications.md  | v5_part_o.md         | ✅ Exists                              |
| 16   | part-16-utilities.md      | v5_part_p.md         | ✅ Exists                              |
| 17   | part-17-affiliate.md      | v5_part_q.md         | ✅ Exists (created 2025-11-21)         |
| 18   | part-18-dlocal.md         | v5_part_r.md         | ✅ Exists (comprehensive - 2680 lines) |

**All 18 implementation guides now exist and are ready for use!**

**Note:** v5_part_s.md also exists for Part 18 (shorter summary - 611 lines), but v5_part_r.md is the primary comprehensive guide.

---

## 📌 Starting Parts 7-16 (Standard Parts)

**Template for Parts 7-16:**

```bash
# Drop previous part files
/drop docs/build-orders/part-0X-[previous].md
/drop docs/implementation-guides/v5_part_[previous].md

# Load new part files (READ-ONLY!)
/read-only docs/build-orders/part-0X-[name].md
/read-only docs/implementation-guides/v5_part_[letter].md
```

**Quick Reference for Parts 7-16:**

- Part 7: v5_part_g.md (Indicators API)
- Part 8: v5_part_h.md (Dashboard)
- Part 9: v5_part_i.md (Charts)
- Part 10: v5_part_j.md (Watchlist)
- Part 11: v5_part_k.md (Alerts)
- Part 12: v5_part_l.md (E-commerce)
- Part 13: v5_part_m.md (Settings)
- Part 14: v5_part_n.md (Admin)
- Part 15: v5_part_o.md (Notifications)
- Part 16: v5_part_p.md (Utilities)

```
Build Part X: [Part Name]

Follow the build order in part-0X-[name].md exactly.

Requirements:
- Build all files in sequence
- Use patterns from 05-coding-patterns-compress.md
- QUALITY GATES (MANDATORY):
  * All functions must have explicit return types
  * No 'any' types (use proper TypeScript interfaces)
  * Try-catch blocks in all async functions
  * No console.log() statements (use console.error for errors)
  * Protected routes must check session
  * Input validation with Zod schemas for POST/PATCH/PUT
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit approved files
- Report progress regularly

Start with File 1/[total]: [first-file]
```

---

## 📌 Part 17 (Affiliate - 67 files) - Multi-Session

### **Session 1: Database & Business Logic (Files 1-11)**

```bash
/drop docs/build-orders/part-16-utilities.md
/drop docs/implementation-guides/v5_part_p.md

/read-only docs/build-orders/part-17-affiliate.md
/read-only docs/implementation-guides/v5_part_r.md
/read-only docs/AFFILIATE-MARKETING-DESIGN.md
```

```
Build Part 17 Session 1: Affiliate Database & Business Logic

Follow the build order in part-17-affiliate.md.

Requirements:
- Build Files 1-11 only (Database Models + Business Logic)
- Follow AFFILIATE-MARKETING-DESIGN.md specifications
- QUALITY GATES (MANDATORY):
  * All functions must have explicit return types
  * No 'any' types (use proper TypeScript interfaces)
  * Try-catch blocks in all async functions
  * No console.log() statements (use console.error for errors)
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit approved files

Start with File 1/67: prisma/schema-affiliate.prisma
Stop after File 11/67.
```

### **Session 2: API Routes (Files 12-30)**

```
Build Part 17 Session 2: Affiliate API Routes

Continue Part 17 with Files 12-30.

Requirements:
- Follow part-17-affiliate.md specifications
- Implement affiliate API endpoints
- QUALITY GATES (MANDATORY):
  * All functions must have explicit return types
  * No 'any' types (use proper TypeScript interfaces)
  * Try-catch blocks in all async functions
  * Protected routes must check session
  * Input validation with Zod schemas
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit approved files

Start with File 12/67.
Stop after File 30/67.
```

### **Session 3: Portal Pages (Files 31-49)**

```
Build Part 17 Session 3: Affiliate Portal Pages

Continue Part 17 with Files 31-49.

Requirements:
- Follow part-17-affiliate.md specifications
- Build affiliate portal components
- QUALITY GATES (MANDATORY):
  * All React components must have explicit return types
  * No 'any' types (use proper TypeScript interfaces)
  * Protected pages must check session
  * Proper error handling in async operations
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit approved files

Start with File 31/67.
Stop after File 49/67.
```

### **Session 4: Final Components (Files 50-67)**

```
Build Part 17 Session 4: Final Affiliate Components

Complete Part 17 with Files 50-67.

Requirements:
- Follow part-17-affiliate.md specifications
- Build remaining components and utilities
- QUALITY GATES (MANDATORY):
  * All functions must have explicit return types
  * No 'any' types (use proper TypeScript interfaces)
  * Try-catch blocks in all async functions
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit approved files

Start with File 50/67.
Complete through File 67/67.
```

---

## 📌 Part 18 (dLocal Payments - 45 files) - Multi-Session

### **Session 1: Database & API (Files 1-9)**

```bash
/drop docs/build-orders/part-17-affiliate.md
/drop docs/implementation-guides/v5_part_r.md
/drop docs/AFFILIATE-MARKETING-DESIGN.md

/read-only docs/build-orders/part-18-dlocal.md
/read-only docs/implementation-guides/v5_part_s.md
/read-only docs/dlocal-openapi-endpoints.yaml
```

```
Build Part 18 Session 1: dLocal Database & API

Follow the build order in part-18-dlocal.md.

Requirements:
- Build Files 1-9 (Database + Core API)
- Follow dlocal-openapi-endpoints.yaml specification
- Follow 07-dlocal-integration-rules-compress.md
- QUALITY GATES (MANDATORY):
  * All functions must have explicit return types
  * No 'any' types (use proper TypeScript interfaces)
  * Try-catch blocks in all async functions
  * Webhook signature verification implemented
  * No hardcoded API keys
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit approved files

Start with File 1/45.
Stop after File 9/45.
```

### **Session 2: Payment Routes (Files 10-18)**

```
Build Part 18 Session 2: dLocal Payment Routes

Continue Part 18 with Files 10-18.

Requirements:
- Implement payment processing routes
- Follow dlocal-openapi-endpoints.yaml
- Handle all 8 emerging markets
- QUALITY GATES (MANDATORY):
  * All functions must have explicit return types
  * Protected routes must check session
  * Input validation with Zod schemas
  * Try-catch blocks in all async functions
  * Proper error messages for payment failures
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit approved files

Start with File 10/45.
Stop after File 18/45.
```

### **Session 3: Webhooks & Components (Files 19-25)**

```
Build Part 18 Session 3: Webhooks & UI Components

Continue Part 18 with Files 19-25.

Requirements:
- Implement webhook handlers
- Build payment UI components
- QUALITY GATES (MANDATORY):
  * Webhook signature verification on all webhook routes
  * All functions must have explicit return types
  * React components must have proper TypeScript types
  * Error handling in payment flows
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit approved files

Start with File 19/45.
Stop after File 25/45.
```

### **Session 4: Final Integration (Files 26-45)**

```
Build Part 18 Session 4: Final Payment Integration

Complete Part 18 with Files 26-45.

Requirements:
- Complete all payment utilities
- Integration testing components
- QUALITY GATES (MANDATORY):
  * All functions must have explicit return types
  * No 'any' types (use proper TypeScript interfaces)
  * Try-catch blocks in all async functions
- Run validation after each file: npm run validate
- Auto-fix minor issues: npm run fix
- Auto-commit approved files

Start with File 26/45.
Complete through File 45/45.
```

---

## 📌 Validation Workflow (NEW - 2025-11-26)

### **After Each File Generated:**

Aider should automatically:

1. Generate code following quality gates
2. (Optional) Run `npm run validate` if uncertain
3. Auto-approve if all checks pass
4. Auto-fix with `npm run fix` if minor issues
5. Escalate if critical issues found

### **After Each Part Complete:**

YOU must manually run:

```bash
npm run validate
```

If it fails:

```bash
npm run fix       # Auto-fix
npm run validate  # Verify fixed
```

### **Before Git Push:**

Pre-push hook will automatically:

- Run TypeScript type checking
- Run quick Jest tests
- Block push if failures

This is GOOD - it prevents CI/CD failures!

### **Validation Commands Quick Reference:**

| Command                   | What It Does           | When to Use       |
| ------------------------- | ---------------------- | ----------------- |
| `npm run validate`        | All checks             | After each part   |
| `npm run validate:types`  | TypeScript only        | Debug type errors |
| `npm run validate:lint`   | ESLint only            | Debug lint errors |
| `npm run validate:format` | Prettier only          | Check formatting  |
| `npm run fix`             | Auto-fix lint + format | Fix minor issues  |
| `npm test`                | Run all tests          | Before final push |

---

## 📌 When Aider Asks for Clarification

```
Follow the build order specification exactly as written in part-0X-[name].md.

If something is ambiguous:
1. Check the implementation guide (v5_part_[letter].md)
2. Check the coding patterns (05-coding-patterns-compress.md)
3. If still unclear, escalate to me with specific question

Proceed with your best interpretation based on policies.
```

---

## 📌 When Aider Escalates

**Option 1: Approve**

```
Approved. Proceed with this implementation.
```

**Option 2: Changes Needed**

```
Make this change: [specific instruction]. Then proceed.
```

**Option 3: Major Issue**

```
Stop. Let me review the requirements. [Provide guidance]
```

---

## 📌 Resuming After Break

```
Resume Part [X] from where we left off.

Last completed: File [N]/[Total]
Next: File [N+1]/[Total]: [filename]

Continue following the build order.
```

---

## 📌 Verification After Part Complete

```
Run verification tests for Part [X]:

1. TypeScript: npx tsc --noEmit
2. Linting: pnpm lint
3. Build: pnpm build (if applicable)
4. Manual checks as specified in part-0X-[name].md

Report results and any issues found.
```

---

## 📌 If Something Goes Wrong

```
Stop current work.

Issue: [describe the problem]

Check these:
1. Are all dependencies met? (previous parts complete?)
2. Does the code follow the correct pattern?
3. Does it validate against policies?

Analyze the issue and provide a fix proposal.
If you cannot fix it, escalate with detailed explanation.
```

---

## 🎯 CRITICAL REMINDERS

### **✅ ALWAYS DO:**

- Use `/read-only` for build order files (NOT `/add`)
- Load implementation guides with `/read-only`
- Let Aider complete each file without interruption
- Trust the validation process
- Check progress reports

### **❌ NEVER DO:**

- Use `/add` for build orders (they become editable!)
- Interrupt Aider mid-file
- Skip verification tests
- Override build order without reason
- Panic when Aider escalates (it's designed to escalate)

---

## 🔧 TROUBLESHOOTING

### **Issue: "Cannot find v5_part_X.md"**

**Symptoms:**

- Aider says it cannot find an implementation guide
- Error: "File not found: docs/implementation-guides/v5_part_k.md"

**Solution:**

```bash
# Check if all 18 guides exist
cd docs/implementation-guides
ls -1 v5_part_{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,r,s}.md | wc -l
# Should return: 18

# If any are missing, check the audit report
# All guides were created on 2025-11-21 and should exist
```

**All 18 guides now exist:**

- Parts 1-10: v5_part_a.md through v5_part_j.md ✅
- Parts 11-16: v5_part_k.md through v5_part_p.md ✅
- Part 17: v5_part_r.md ✅
- Part 18: v5_part_s.md ✅

### **Issue: Token limit exceeded**

**Solution:**

```bash
# Drop unused files
/drop docs/build-orders/part-XX-previous.md
/drop docs/implementation-guides/v5_part_previous.md

# Clear conversation if needed
/clear
```

### **Issue: Aider doesn't load policy files**

**Solution:**

```bash
# Verify .aider.conf.yml exists in project root
ls -la .aider.conf.yml

# Restart Aider to reload configuration
# Exit and start again with start-aider-anthropic.bat
```

---

## 📊 Token Usage Guidelines

| Phase          | Expected Tokens | Notes            |
| -------------- | --------------- | ---------------- |
| Base Load      | 129k            | Always loaded    |
| + Part Files   | +6-15k          | Varies by part   |
| + Conversation | Variable        | Grows over time  |
| **Safe Limit** | 180k            | Stay below this  |
| **Max Limit**  | 204k            | Context overflow |

**If approaching 180k tokens:**

- Drop previous part files
- Clear conversation: `/clear`
- Restart Aider if needed

---

**Document Version:** 2.0 (Corrected)  
**Last Updated:** 2025-11-21  
**Critical Fix:** `/read-only` instead of `/add`  
**Status:** ✅ Tested and Verified
