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
- Validate against all policies
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
- Validate against all policies
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
- Validate against all policies
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
- Include tier validation middleware
- Validate against all policies
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
- Validate against all policies
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
- Validate against all policies
- Auto-commit approved files

Start with File 1/15: mt5-service/app.py
```

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

```
Build Part X: [Part Name]

Follow the build order in part-0X-[name].md exactly.

Requirements:
- Build all files in sequence
- Use patterns from 05-coding-patterns-compress.md
- Validate against all policies
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
- Validate against all policies
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
- Validate against all policies
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
- Validate against all policies
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
- Validate against all policies
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
- Validate against all policies
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
- Validate against all policies
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
- Validate against all policies
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
- Validate against all policies
- Auto-commit approved files

Start with File 26/45.
Complete through File 45/45.
```

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

## 📊 Token Usage Guidelines

| Phase | Expected Tokens | Notes |
|-------|----------------|-------|
| Base Load | 129k | Always loaded |
| + Part Files | +6-15k | Varies by part |
| + Conversation | Variable | Grows over time |
| **Safe Limit** | 180k | Stay below this |
| **Max Limit** | 204k | Context overflow |

**If approaching 180k tokens:**
- Drop previous part files
- Clear conversation: `/clear`
- Restart Aider if needed

---

**Document Version:** 2.0 (Corrected)  
**Last Updated:** 2025-11-21  
**Critical Fix:** `/read-only` instead of `/add`  
**Status:** ✅ Tested and Verified