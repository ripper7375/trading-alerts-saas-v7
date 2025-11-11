# Trading Alerts SaaS V7 - Development Progress & Roadmap

**Last Updated:** 2025-11-11
**Project Start:** 2025-11-09
**Target Completion:** Week 12 (from start)
**Current Phase:** Phase 1 - Documentation & Policies

---

## 📖 HOW TO USE THIS ROADMAP (For Beginners)

This document is your **complete step-by-step guide** from start to finish. Follow it sequentially:

1. ✅ **Check your current phase** in the "Overall Progress" section
2. ✅ **Read the phase instructions** - Every phase has detailed steps
3. ✅ **Complete each step in order** - Don't skip steps!
4. ✅ **Mark checkboxes** as you complete tasks
5. ✅ **Refer to documentation** links when needed
6. ✅ **Test as you build** - Use testing tools at the right times

**Key Tools You'll Use:**
- **OpenAPI Scripts** (Milestone 1.2) → Used in Phase 3 Step 1
- **Postman Testing** (Milestone 1.3) → Used after each API endpoint in Phase 3
- **Aider with MiniMax M2** → Used throughout Phase 3 for autonomous building

---

## 📊 Overall Progress

| Metric | Status | Notes |
|--------|--------|-------|
| **Current Phase** | Phase 1 | Documentation & Policy Creation |
| **Total Files** | 0 / 170 (0%) | Will increase in Phase 3 |
| **Parts Completed** | 0 / 16 (0%) | 16 parts to build |
| **Milestones Done** | 6 / 8 Phase 1 | Milestones 1.0-1.6 complete |
| **Estimated Time Remaining** | ~58 hours | Phase 2-4 |
| **Ready for Phase 2?** | ⚠️ Pending | Complete readiness check first |

---

# 🗺️ COMPLETE DEVELOPMENT ROADMAP

---

## 📅 PHASE 0: Local Environment Setup (4 hours) ✅ COMPLETE

**Objective:** Set up your development environment with all required tools.

**Timeline:** Day 1

### Step 1: Install Core Tools (1 hour) ✅
- [x] Python 3.11 installed
- [x] Node.js 18+ installed
- [x] PostgreSQL installed
- [x] MetaTrader 5 installed
- [x] VS Code installed

### Step 2: Install Development Tools (30 minutes) ✅
- [x] Git installed and configured
- [x] Aider installed (`pip install aider-chat`)
- [x] Postman installed

### Step 3: Configure MiniMax M2 API (30 minutes) ✅
- [x] Get MiniMax M2 API key
- [x] Set `ANTHROPIC_API_KEY` environment variable
- [x] Test API connection

### Step 4: Test All Tools (30 minutes) ✅
- [x] Verify Python: `python --version`
- [x] Verify Node: `node --version`
- [x] Verify PostgreSQL: `psql --version`
- [x] Verify Aider: `aider --version`

**Status:** ✅ **COMPLETE**

**Documentation:** `docs/v7/v7_phase_0_setup.md`

---

## 📅 PHASE 1: Documentation & Policy Creation (14 hours) 🔄 IN PROGRESS

**Objective:** Create the "AI constitution" - policies and documentation that guide Aider.

**Timeline:** Week 1, Days 1-7

**Why This Matters:** These policies will guide Aider to build 170+ files autonomously with high quality.

---

### MILESTONE 1.0: Setup Project Repository (1.5 hours) ✅ COMPLETE

#### Step 1: Create GitHub Repository (15 minutes) ✅
- [x] Created repository: `trading-alerts-saas-v7`
- [x] Initialized with README
- [x] Set visibility (Public/Private)

#### Step 2: Clone Repository Locally (5 minutes) ✅
- [x] Cloned to local machine
- [x] Verified folder structure

#### Step 3: Create Folder Structure (10 minutes) ✅
- [x] `docs/` folder created
- [x] `docs/policies/` folder created
- [x] `docs/v7/` folder created
- [x] `scripts/openapi/` folder created
- [x] `postman/` folder created
- [x] `seed-code/` folder created

#### Step 4: Copy Essential Documents (20 minutes) ✅
- [x] Copied v5 documentation files
- [x] Copied OpenAPI specifications
- [x] Copied seed code repositories

#### Step 5: Initial Commit (10 minutes) ✅
- [x] Committed all documentation
- [x] Pushed to GitHub

**Status:** ✅ **COMPLETE**

---

### MILESTONE 1.1: Create Policy Documents (8 hours) ✅ COMPLETE

**What:** Create 7 comprehensive policy documents that tell Aider how to work.

#### Policy Files Created:
- [x] `00-tier-specifications.md` - FREE/PRO tier definitions
- [x] `01-approval-policies.md` - When to auto-approve, fix, or escalate
- [x] `02-quality-standards.md` - TypeScript, error handling, documentation standards
- [x] `03-architecture-rules.md` - File structure, layer architecture, data flow
- [x] `04-escalation-triggers.md` - When Aider should ask you for help
- [x] `05-coding-patterns.md` - Copy-paste ready code examples
- [x] `06-aider-instructions.md` - How Aider should operate with MiniMax M2

**Commits:**
- f2017d9: Policies 01-04
- 9f843c7: Policies 05-06
- Additional commits for tier specifications and policy audit

**Status:** ✅ **COMPLETE**

---

### MILESTONE 1.2: OpenAPI Code Generation (1 hour) ✅ COMPLETE

**What:** Create scripts to auto-generate TypeScript types from OpenAPI specs.

**Why:** Ensures type safety and keeps code in sync with API specifications.

#### Files Created:
- [x] `scripts/openapi/generate-nextjs-types.sh` - Generates types for Next.js API
- [x] `scripts/openapi/generate-flask-types.sh` - Generates types for Flask MT5 API
- [x] `scripts/openapi/README.md` - Comprehensive usage documentation

**When These Scripts Will Be Used:**

📍 **FIRST USE: Phase 3, Before Building Parts 1-4**
```bash
# Step 1 of Phase 3 Foundation Setup
cd trading-alerts-saas-v7
sh scripts/openapi/generate-nextjs-types.sh
sh scripts/openapi/generate-flask-types.sh
```

📍 **ONGOING USE: Whenever OpenAPI specs change**
- After updating `trading_alerts_openapi.yaml`
- After updating `flask_mt5_openapi.yaml`
- Run scripts to regenerate types

**Output Locations:**
- Next.js types: `lib/api-client/`
- Flask types: `lib/mt5-client/`

**Commit:** e0cfcce

**Status:** ✅ **COMPLETE**

---

### MILESTONE 1.3: Postman Collections (45 minutes) ✅ COMPLETE

**What:** Created comprehensive Postman testing documentation for API endpoint testing.

**Why:** Test your APIs as you build them to catch bugs early.

#### Files Created:
- [x] `postman/README.md` - Complete Postman setup guide
- [x] `postman/TESTING-GUIDE.md` - Detailed test scenarios for all endpoints

**When Postman Testing Will Be Used:**

📍 **SETUP: Phase 2 (After creating Next.js project)**
```bash
# Import OpenAPI specs into Postman
1. Open Postman
2. Import → Files → Select docs/trading_alerts_openapi.yaml
3. Import → Files → Select docs/flask_mt5_openapi.yaml
4. Configure collection variables
```

📍 **USE #1: Phase 3, After Building Part 5 (Authentication)**
- Test: POST /api/auth/signup
- Test: POST /api/auth/login
- Test: GET /api/users/profile
- Refer to: `postman/TESTING-GUIDE.md` → Scenario 1

📍 **USE #2: Phase 3, After Building Part 7 (Indicators API)**
- Test: GET /api/indicators
- Test: GET /api/indicators/[symbol]/[timeframe]
- Test: GET /api/tier/symbols
- Refer to: `postman/TESTING-GUIDE.md` → Scenario 4

📍 **USE #3: Phase 3, After Building Part 11 (Alerts)**
- Test: POST /api/alerts (create alert)
- Test: GET /api/alerts (list alerts)
- Test: PUT /api/alerts/[id] (update alert)
- Test: DELETE /api/alerts/[id] (delete alert)
- Test tier restrictions (FREE vs PRO)
- Refer to: `postman/TESTING-GUIDE.md` → Scenario 2

📍 **USE #4: Phase 3, After Building Part 12 (E-commerce)**
- Test: GET /api/subscriptions/current
- Test: POST /api/subscriptions/checkout
- Test: POST /api/webhooks/stripe
- Refer to: `postman/TESTING-GUIDE.md` → Scenario 3

📍 **ONGOING USE: After Every API Endpoint**
- Build endpoint with Aider
- Test immediately in Postman
- Verify response matches OpenAPI spec
- Check error handling
- Document any issues

**Test Scenarios Available:**
1. New User Registration and Login
2. Alert Management (FREE Tier)
3. Subscription Management
4. Flask MT5 Service Integration
5. Dashboard Data Aggregation

**Commit:** abe30d0

**Status:** ✅ **COMPLETE**

---

### MILESTONE 1.4: Architecture Documentation (1.5 hours) ✅ COMPLETE

#### STEP 1: Create ARCHITECTURE.md (30 minutes) ✅
- [x] System overview documented
- [x] Tech stack defined (Next.js 15, Flask, PostgreSQL, MT5)
- [x] High-level architecture diagram described
- [x] Component breakdown provided
- [x] Data flow documented
- [x] Authentication flow explained
- [x] Tier system (FREE/PRO) detailed
- [x] Deployment architecture (Vercel + Railway)

#### STEP 2: Create IMPLEMENTATION-GUIDE.md (30 minutes) ✅
- [x] V7 development process explained
- [x] Policy-driven development documented
- [x] Working with Aider (MiniMax M2) guide
- [x] Handling escalations procedure
- [x] Building each part workflow
- [x] Testing strategy outlined
- [x] Troubleshooting common issues

#### STEP 3: Create DOCKER.md (15 minutes) ✅
- [x] Docker concepts for beginners
- [x] Dockerfile structure explanation
- [x] docker-compose.yml guide
- [x] Common Docker commands

#### STEP 4: Create Additional Docs (15 minutes) ✅
- [x] `MINIMAX-TROUBLESHOOTING.md` - MiniMax M2 API troubleshooting
- [x] `POLICY_AUDIT_REPORT.md` - Policy consistency audit

**Commits:**
- Multiple commits for architecture documentation
- 7c34375: Implementation guide

**Status:** ✅ **COMPLETE**

---

### MILESTONE 1.5: Configure Aider (30 minutes) ✅ COMPLETE

**What:** Setup Aider to automatically load policies and work with MiniMax M2.

#### Configuration File Created:
- [x] `.aider.conf.yml` created in project root

#### Configuration Includes:
- [x] Model set to `anthropic/MiniMax-M2`
- [x] All 7 policy files in `read:` section
- [x] v5-structure-division.md included
- [x] OpenAPI specs included (both Next.js and Flask)
- [x] PROGRESS.md included for tracking
- [x] Auto-commits configured
- [x] Commit prompt template defined
- [x] Environment variables documented (ANTHROPIC_API_KEY)

#### Verification Test:
```bash
py -3.11 -m aider --model anthropic/MiniMax-M2
# Should show all files loading with ✓ checkmarks
/exit
```

**Commit:** Updated throughout Phase 1

**Status:** ✅ **COMPLETE**

---

### MILESTONE 1.6: Test Aider Understanding (30 minutes) ✅ COMPLETE

**What:** Verify Aider fully understands your project before autonomous building.

**Why:** Catching knowledge gaps now saves hours of debugging later.

#### Comprehensive Test Suite Created:
- [x] `docs/v7/AIDER-COMPREHENSION-TESTS.md` - 46 comprehensive tests

#### Test Categories (8 categories):
- [x] Policy Understanding (6 tests)
- [x] Architecture Knowledge (8 tests)
- [x] Tier System Mastery (5 tests)
- [x] Technical Stack Familiarity (6 tests)
- [x] OpenAPI Contract Knowledge (5 tests)
- [x] Coding Patterns Mastery (7 tests)
- [x] Workflow Understanding (5 tests)
- [x] Planning Ability (4 tests)

#### Minimum Required Tests (6 tests):

**TO BE COMPLETED BY USER:**

1. [ ] **Test 1: Policy Understanding**
   ```
   Command: "Summarize the approval policies for this project."
   Expected: Explains auto-approve, auto-fix, escalate conditions
   ```

2. [ ] **Test 2: Tier System Understanding**
   ```
   Command: "What are the tier restrictions in this project?"
   Expected: FREE: 5 symbols × 3 timeframes, PRO: 15 symbols × 9 timeframes
   ```

3. [ ] **Test 3: File Location Knowledge**
   ```
   Command: "Where should the POST /api/alerts endpoint file be located?"
   Expected: app/api/alerts/route.ts
   ```

4. [ ] **Test 4: Architecture Understanding**
   ```
   Command: "Explain the data flow when a user creates an alert."
   Expected: User → Form → API route → Auth → Tier check → Prisma → Database
   ```

5. [ ] **Test 5: Pattern Knowledge**
   ```
   Command: "What coding pattern should I use for a Next.js API route?"
   Expected: References Pattern 1 from 05-coding-patterns.md
   ```

6. [ ] **Test 6: Planning Ability**
   ```
   Command: "Plan the implementation for app/api/alerts/route.ts. Don't create it yet."
   Expected: Outlines imports, auth, validation, tier check, Prisma, response, error handling
   ```

**How to Run Tests:**
1. Start Aider: `py -3.11 -m aider --model anthropic/MiniMax-M2`
2. Run each test command
3. Verify Aider's response matches expected answer
4. Mark checkbox when test passes
5. Document results in test file

**Commit:** ad25d33

**Status:** ✅ **FILE CREATED** | ⚠️ **TESTS TO BE RUN BY USER**

---

### MILESTONE 1.7: Phase 1 Readiness Check (1 hour) ✅ COMPLETE

**What:** Final verification that Phase 1 is complete and you're ready for Phase 2.

#### Readiness Check Document Created:
- [x] `docs/v7/PHASE-1-READINESS-CHECK.md`

#### Official Readiness Criteria (6 items):

**TO BE COMPLETED BY USER:**

1. [ ] **All 7 policies in docs/policies/** ✅
   - Verified: 7/7 policy files present

2. [ ] **All policies committed to GitHub** ✅
   - Verified: All commits pushed

3. [ ] **Aider configuration file created** ✅
   - Verified: `.aider.conf.yml` exists and configured

4. [ ] **Aider loads all files successfully** ⚠️
   - Test: `py -3.11 -m aider --model anthropic/MiniMax-M2`
   - Verify all files load with ✓ checkmarks

5. [ ] **Aider passes all 6 understanding tests** ⚠️
   - Run tests from `docs/v7/AIDER-COMPREHENSION-TESTS.md`
   - Minimum 6/6 tests must pass

6. [ ] **MiniMax M2 API configured and working** ⚠️
   - Set: `ANTHROPIC_API_KEY=your_minimax_api_key`
   - Test: Start Aider and verify API works

**How to Complete Readiness Check:**
1. Open: `docs/v7/PHASE-1-READINESS-CHECK.md`
2. Go through all checklist items
3. Mark completion status
4. Sign off when ready

**Commit:** d1808ac

**Status:** ✅ **FILE CREATED** | ⚠️ **USER TO COMPLETE CHECKS**

---

### MILESTONE 1.8: Phase 1 Completion Summary (30 minutes) ✅ COMPLETE

#### Summary Document Created:
- [x] `PHASE-1-COMPLETION-SUMMARY.md`

#### Contents:
- [x] All milestone completion status
- [x] Files created summary (10 files)
- [x] Next steps for Phase 2 and Phase 3
- [x] Key documentation reference
- [x] Beginner tips and timeline

**Commit:** 9966993

**Status:** ✅ **COMPLETE**

---

## 📊 PHASE 1 FINAL STATUS

**Total Time Invested:** ~14 hours

**Milestones Completed:** 8/8 ✅

**Files Created in Phase 1:** 10+ documentation files

**Ready for Phase 2:** ⚠️ **After user completes:**
1. Aider comprehension tests (Milestone 1.6)
2. MiniMax M2 API configuration
3. Readiness check sign-off (Milestone 1.7)

**Documentation:** `docs/v7/v7_phase_1_policies.md`

---

## 📅 PHASE 2: Foundation Setup (5 hours) ⏳ NOT STARTED

**Objective:** Create Next.js project structure, setup database, configure environment.

**Timeline:** Week 2, Day 1

**Prerequisites:**
- ✅ Phase 1 complete
- ✅ Aider comprehension tests passed
- ✅ MiniMax M2 API working

---

### STEP 1: Create Next.js 15 Project (1 hour)

**What:** Initialize Next.js 15 project with TypeScript and Tailwind CSS.

**Commands:**
```bash
cd trading-alerts-saas-v7
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"
```

**Verify:**
- [ ] `app/` directory created
- [ ] `package.json` created with Next.js 15
- [ ] `tsconfig.json` created
- [ ] `tailwind.config.ts` created

**Test:**
```bash
npm run dev
# Visit http://localhost:3000
# Should see Next.js welcome page
```

---

### STEP 2: Generate TypeScript Types from OpenAPI (15 minutes)

**🎯 FIRST USE OF MILESTONE 1.2 SCRIPTS!**

**What:** Run the OpenAPI type generation scripts you created in Milestone 1.2.

**Why:** Generate TypeScript types before writing any code.

**Commands:**
```bash
# Generate Next.js API types
sh scripts/openapi/generate-nextjs-types.sh

# Generate Flask MT5 API types
sh scripts/openapi/generate-flask-types.sh
```

**Expected Output:**
```
✅ Next.js API types generated in lib/api-client/
✅ Flask MT5 types generated in lib/mt5-client/
```

**Verify:**
- [ ] `lib/api-client/` directory created with TypeScript files
- [ ] `lib/mt5-client/` directory created with TypeScript files
- [ ] Types include: Alert, User, IndicatorData, etc.

**Usage in Code:**
```typescript
import { Alert, CreateAlertRequest } from '@/lib/api-client'
import { IndicatorData } from '@/lib/mt5-client'
```

**Documentation:** `scripts/openapi/README.md`

---

### STEP 3: Setup Prisma and PostgreSQL (1.5 hours)

**What:** Configure database connection and create schema.

#### 3.1: Install Prisma (10 minutes)
```bash
npm install prisma @prisma/client
npx prisma init
```

#### 3.2: Configure Database URL (10 minutes)

**Create `.env` file:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/trading_alerts"

# NextAuth
NEXTAUTH_SECRET="generate-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# MiniMax M2 API (for Aider)
ANTHROPIC_API_KEY="your_minimax_api_key_here"

# Stripe (for later)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### 3.3: Create Prisma Schema (30 minutes)

**File:** `prisma/schema.prisma`

**Use Aider to create schema from Part 2 requirements:**
```bash
py -3.11 -m aider --model anthropic/MiniMax-M2

# Command to Aider:
Create prisma/schema.prisma following Part 2 from v5_part_b.md.
Include User, Subscription, Alert, WatchlistItem models.
Use the 2-tier system (FREE/PRO).
```

#### 3.4: Run First Migration (10 minutes)
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Verify:**
- [ ] `prisma/migrations/` directory created
- [ ] Database tables created in PostgreSQL
- [ ] Prisma Client generated

---

### STEP 4: Install Core Dependencies (30 minutes)

**What:** Install all required npm packages.

```bash
# Core dependencies
npm install next-auth@beta @prisma/client
npm install stripe zod
npm install @radix-ui/react-* (various UI components)
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge

# Dev dependencies
npm install -D @types/node @types/react typescript
npm install -D prisma
npm install -D eslint eslint-config-next
```

**Verify:**
- [ ] All packages installed without errors
- [ ] `node_modules/` directory created
- [ ] `package-lock.json` updated

---

### STEP 5: Configure Environment Variables (15 minutes)

**What:** Setup all required environment variables for development.

**Create `.env.local`:**
```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/trading_alerts"

# Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Flask MT5 Service
FLASK_MT5_URL="http://localhost:5001"
```

**Verify:**
- [ ] `.env.local` file created
- [ ] All required variables set
- [ ] `.env` and `.env.local` in `.gitignore`

---

### STEP 6: Import OpenAPI Specs into Postman (15 minutes)

**🎯 FIRST USE OF MILESTONE 1.3 POSTMAN SETUP!**

**What:** Setup Postman collections for API testing.

**Follow:** `postman/README.md`

**Steps:**
1. Open Postman
2. Click "Import" → "Files"
3. Select `docs/trading_alerts_openapi.yaml`
4. Click "Import"
5. Repeat for `docs/flask_mt5_openapi.yaml`

**Configure Variables:**
- Collection: "Trading Alerts API"
  - `baseUrl` = `http://localhost:3000`
  - `authToken` = (empty for now)
- Collection: "Flask MT5 Service"
  - `baseUrl` = `http://localhost:5001`
  - `userTier` = `FREE`

**Verify:**
- [ ] Both collections imported successfully
- [ ] All ~50 endpoints visible in Postman
- [ ] Variables configured

**Documentation:** `postman/README.md`

---

### STEP 7: Verify Foundation Setup (30 minutes)

**What:** Test that everything is working before starting Part 1.

#### 7.1: Test Next.js Dev Server
```bash
npm run dev
# Visit http://localhost:3000
# Should load without errors
```

#### 7.2: Test Prisma Connection
```bash
npx prisma studio
# Should open Prisma Studio at http://localhost:5555
# Should show your database tables
```

#### 7.3: Test TypeScript Types
```bash
npm run build
# Should compile without TypeScript errors
```

#### 7.4: Test Aider with Foundation
```bash
py -3.11 -m aider --model anthropic/MiniMax-M2
# Ask: "What files are in the project now?"
# Should list Next.js files and Prisma schema
/exit
```

**Checklist:**
- [ ] Next.js dev server runs
- [ ] Database connection works
- [ ] TypeScript compiles
- [ ] Aider loads successfully
- [ ] Postman collections ready

---

## 📊 PHASE 2 COMPLETION CRITERIA

**When Phase 2 is complete, you'll have:**
- ✅ Next.js 15 project created
- ✅ TypeScript types generated from OpenAPI specs
- ✅ Prisma schema created and migrated
- ✅ Database connection working
- ✅ All dependencies installed
- ✅ Environment variables configured
- ✅ Postman collections imported and ready
- ✅ Foundation verified and working

**Ready for Phase 3:** ✅ Start autonomous building with Aider!

**Documentation:** `docs/v7/v7_phase_2_foundation.md`

---

## 📅 PHASE 3: Autonomous Building with Aider (38 hours) ⏳ NOT STARTED

**Objective:** Use Aider with MiniMax M2 to build all 170+ files autonomously.

**Timeline:** Weeks 3-10

**Your Role:** Monitor progress, handle escalations, test as you build.

**Aider's Role:** Read requirements, generate code, validate, commit.

---

### HOW PHASE 3 WORKS (For Beginners)

**Think of Aider as your autonomous developer:**

1. **You give a command:** "Build Part 5: Authentication"
2. **Aider reads requirements:** From v5_part_e.md
3. **Aider generates code:** Following your policies
4. **Aider validates:** Using Claude Code
5. **Aider decides:**
   - ✅ Auto-approve and commit (if policies met)
   - 🔧 Auto-fix issues (if fixable)
   - ⚠️ Escalate to you (if uncertain)
6. **You test:** Test the endpoints in Postman
7. **Repeat:** Move to next part

**Typical Session:**
- Aider builds 3 files → Reports progress
- Aider builds 3 more files → Reports progress
- Aider encounters issue → Escalates to you
- You decide → Aider continues
- Part complete → You test in Postman
- Move to next part

---

### PHASE 3 BUILD ORDER (16 Parts)

Build in this order for proper dependencies:

---

### PART 1-4: Foundation (Week 3, 10 hours)

**What:** Core infrastructure, types, tier system.

#### Part 1: Foundation & Root Configuration (2 hours)
- [ ] Files: 12 files (config files, package.json, etc.)
- [ ] Start Aider: `py -3.11 -m aider --model anthropic/MiniMax-M2`
- [ ] Command: `Build Part 1: Foundation from v5_part_a.md`
- [ ] Aider builds all config files
- [ ] Test: `npm run dev` should work

#### Part 2: Database Schema & Migrations (2 hours)
- [ ] Files: 4 files (Prisma schema, seed scripts)
- [ ] Command: `Build Part 2: Database from v5_part_b.md`
- [ ] Test: `npx prisma migrate dev`
- [ ] Test: `npx prisma studio` - verify tables

#### Part 3: Type Definitions (2 hours)
- [ ] Files: 6 files (TypeScript type definitions)
- [ ] Command: `Build Part 3: Types from v5_part_c.md`
- [ ] Test: `npm run build` - no TypeScript errors

#### Part 4: Tier System & Constants (4 hours)
- [ ] Files: 4 files (tier validation, middleware, constants)
- [ ] Command: `Build Part 4: Tier System from v5_part_d.md`
- [ ] Test: Import tier functions, test validation logic

**After Parts 1-4:**
- [ ] Run: `npm run build` - should compile successfully
- [ ] Commit all changes
- [ ] Take a break! 🎉 Foundation complete!

---

### PART 5: Authentication System (Week 4, 6 hours)

**What:** User authentication, registration, login, session management.

**Files:** 18 files

**Command:**
```bash
py -3.11 -m aider --model anthropic/MiniMax-M2

Build Part 5: Authentication from v5_part_e.md

Follow the workflow:
1. Read requirements
2. Use patterns from 05-coding-patterns.md
3. Reference seed-code/saas-starter/ for NextAuth patterns
4. Build all 18 files
5. Notify me every 3 files
```

**Aider will build:**
- [ ] Auth pages (login, register, forgot-password, etc.)
- [ ] API routes (NextAuth, registration, verification)
- [ ] Auth components (forms, social auth buttons)
- [ ] Auth utilities (auth-options, session, permissions)
- [ ] Middleware for protected routes

**Testing with Postman (MILESTONE 1.3 IN USE!):**

After Aider completes Part 5:

1. Start dev server: `npm run dev`

2. Open Postman → "Trading Alerts API" collection

3. **Test Authentication (Scenario 1):**

   📖 **Follow:** `postman/TESTING-GUIDE.md` → Scenario 1

   - [ ] Test: POST /api/auth/signup
     - Body: `{ "email": "test@example.com", "password": "SecurePass123!", "name": "Test User" }`
     - Expected: 201 Created, user object, token returned
     - **Copy the token!**

   - [ ] Test: POST /api/auth/login
     - Body: `{ "email": "test@example.com", "password": "SecurePass123!" }`
     - Expected: 200 OK, token returned

   - [ ] Test: GET /api/users/profile
     - Header: `Authorization: Bearer {paste_token_here}`
     - Expected: 200 OK, user profile returned

   - [ ] Test: Unauthorized access
     - Remove Authorization header
     - Expected: 401 Unauthorized

4. **Document Results:**
   - [ ] All auth endpoints working? ✅ / ❌
   - [ ] JWT tokens generated? ✅ / ❌
   - [ ] Session management working? ✅ / ❌
   - [ ] Found any bugs? (Document in PROGRESS.md)

**If tests fail:**
1. Check Aider's commits for the file with issues
2. Ask Aider to fix: "The POST /api/auth/login endpoint returns 500 error. Please investigate and fix."
3. Retest after fix

**Estimated Time:**
- Aider builds: 5 hours
- Your testing: 1 hour

---

### PART 6: Flask MT5 Service (Week 5, 6 hours)

**What:** Python Flask service to connect to MetaTrader 5 and fetch indicator data.

**Files:** 15 files

**Command:**
```bash
Build Part 6: Flask MT5 Service from v5_part_f.md

Reference seed-code/market_ai_engine.py for Flask patterns.
Follow tier validation requirements.
Build all 15 Python files.
```

**Aider will build:**
- [ ] Flask app structure
- [ ] MT5 connection service
- [ ] Tier validation service
- [ ] Indicator routes
- [ ] Helper utilities
- [ ] Dockerfile and requirements.txt

**Testing with Postman:**

After Aider completes Part 6:

1. Start Flask service:
   ```bash
   cd mt5-service
   pip install -r requirements.txt
   python run.py
   # Should start on http://localhost:5001
   ```

2. Open Postman → "Flask MT5 Service" collection

3. **Test Flask Endpoints:**

   - [ ] Test: GET /api/mt5/symbols/BTCUSD
     - Header: `X-User-Tier: FREE`
     - Expected: 200 OK, symbol info returned

   - [ ] Test: GET /api/mt5/indicators/rsi?symbol=BTCUSD&timeframe=H1&period=14
     - Header: `X-User-Tier: FREE`
     - Expected: 200 OK, RSI data returned

   - [ ] Test: Tier restriction
     - GET /api/mt5/indicators/rsi?symbol=GBPUSD&timeframe=H1&period=14
     - Header: `X-User-Tier: FREE`
     - Expected: 403 Forbidden (GBPUSD not allowed for FREE)

**Estimated Time:**
- Aider builds: 5 hours
- Your testing: 1 hour

---

### PART 7: Indicators API & Tier Routes (Week 5, 4 hours)

**What:** Next.js API routes that connect to Flask MT5 service with tier validation.

**Files:** 6 files

**Command:**
```bash
Build Part 7: Indicators API from v5_part_g.md

Create tier validation routes and indicator proxy routes.
Validate tier before calling Flask service.
```

**Aider will build:**
- [ ] GET /api/tier/symbols - Get allowed symbols for user's tier
- [ ] GET /api/tier/check/[symbol] - Check if symbol is allowed
- [ ] GET /api/tier/combinations - Get all allowed symbol+timeframe combos
- [ ] GET /api/indicators - List available indicators
- [ ] GET /api/indicators/[symbol]/[timeframe] - Fetch indicator data
- [ ] lib/api/mt5-client.ts - Client to call Flask service

**Testing with Postman (MILESTONE 1.3 IN USE!):**

📖 **Follow:** `postman/TESTING-GUIDE.md` → Scenario 4 (Flask MT5 Integration)

After Aider completes Part 7:

1. Ensure both servers running:
   - Next.js: `npm run dev` (port 3000)
   - Flask: `python mt5-service/run.py` (port 5001)

2. **Test Tier Routes:**

   - [ ] Test: GET /api/tier/symbols
     - Header: `Authorization: Bearer {token}` (from Part 5 testing)
     - Expected: 200 OK, array of 5 symbols (if FREE user)

   - [ ] Test: GET /api/tier/check/BTCUSD
     - Expected: 200 OK, `{ "allowed": true }`

   - [ ] Test: GET /api/tier/check/GBPUSD
     - Expected: 200 OK, `{ "allowed": false }` (for FREE user)

3. **Test Indicators API:**

   - [ ] Test: GET /api/indicators/BTCUSD/H1
     - Expected: 200 OK, indicator data from Flask

   - [ ] Test: GET /api/indicators/GBPUSD/M15
     - Expected: 403 Forbidden (FREE user, invalid symbol+timeframe)

**Estimated Time:**
- Aider builds: 3 hours
- Your testing: 1 hour

---

### PART 8-10: UI Components (Week 6, 10 hours)

**What:** Dashboard, charts, watchlist UI components.

#### Part 8: Dashboard & Layout Components (3 hours)
- [ ] Files: 9 files
- [ ] Command: `Build Part 8: Dashboard from v5_part_h.md`
- [ ] Reference: seed-code/next-shadcn-dashboard-starter/
- [ ] Test: Visit http://localhost:3000/dashboard

#### Part 9: Charts & Visualization (4 hours)
- [ ] Files: 8 files
- [ ] Command: `Build Part 9: Charts from v5_part_i.md`
- [ ] Test: Visit http://localhost:3000/charts
- [ ] Verify: Timeframe selector shows only H1, H4, D1 for FREE user

#### Part 10: Watchlist System (3 hours)
- [ ] Files: 8 files
- [ ] Command: `Build Part 10: Watchlist from v5_part_j.md`
- [ ] Test: Visit http://localhost:3000/watchlist
- [ ] Verify: Can add symbol+timeframe combinations

**Testing UI Components:**
- Test in browser (visual testing)
- No Postman needed for UI
- Check responsiveness (mobile, tablet, desktop)
- Verify tier restrictions in UI

---

### PART 11: Alerts System (Week 7, 4 hours)

**What:** Alert creation, management, and triggering system.

**Files:** 10 files

**Command:**
```bash
Build Part 11: Alerts from v5_part_k.md

Create alert CRUD operations with tier validation.
Implement alert checking job.
```

**Testing with Postman (MILESTONE 1.3 IN USE!):**

📖 **Follow:** `postman/TESTING-GUIDE.md` → Scenario 2 (Alert Management)

After Aider completes Part 11:

1. **Test Alert Creation:**

   - [ ] Test: POST /api/alerts
     - Body:
       ```json
       {
         "symbol": "BTCUSD",
         "timeframe": "H1",
         "condition": "RSI_OVERSOLD",
         "threshold": 30,
         "enabled": true
       }
       ```
     - Expected: 201 Created, alert object returned

   - [ ] Test: POST /api/alerts (invalid symbol for FREE)
     - Body: Same as above but symbol = "GBPUSD"
     - Expected: 403 Forbidden, helpful error message

2. **Test Alert Management:**

   - [ ] Test: GET /api/alerts
     - Expected: 200 OK, array of alerts

   - [ ] Test: PUT /api/alerts/{alertId}
     - Body: `{ "threshold": 35, "enabled": false }`
     - Expected: 200 OK, updated alert

   - [ ] Test: DELETE /api/alerts/{alertId}
     - Expected: 204 No Content

3. **Test in UI:**
   - [ ] Visit: http://localhost:3000/alerts
   - [ ] Create alert through form
   - [ ] Verify list updates
   - [ ] Test edit and delete

**Estimated Time:**
- Aider builds: 3 hours
- Your testing: 1 hour

---

### PART 12: E-commerce & Billing (Week 8, 5 hours)

**What:** Stripe integration for FREE to PRO tier upgrades.

**Files:** 11 files

**Testing with Postman (MILESTONE 1.3 IN USE!):**

📖 **Follow:** `postman/TESTING-GUIDE.md` → Scenario 3 (Subscription Management)

After Aider completes Part 12:

1. **Test Subscription Check:**

   - [ ] Test: GET /api/subscriptions/current
     - Expected: 200 OK, shows current tier (FREE)

2. **Test Checkout Session:**

   - [ ] Test: POST /api/subscriptions/checkout
     - Body: `{ "tier": "PRO", "priceId": "price_test_123" }`
     - Expected: 200 OK, Stripe checkout URL returned

3. **Test Upgrade:**

   - Complete Stripe checkout with test card: 4242 4242 4242 4242
   - Webhook should fire and upgrade user to PRO

   - [ ] Test: GET /api/subscriptions/current
     - Expected: Tier now shows "PRO"

   - [ ] Test: GET /api/tier/symbols
     - Expected: Now returns all 15 symbols

4. **Test New Access:**

   - [ ] Test: POST /api/alerts with GBPUSD symbol
     - Expected: 201 Created (now allowed!)

**Estimated Time:**
- Aider builds: 4 hours
- Your testing: 1 hour

---

### PART 13-16: Polish & Final Features (Week 9-10, 13 hours)

#### Part 13: Settings System (3 hours)
- [ ] Files: 17 files
- [ ] Command: `Build Part 13: Settings from v5_part_m.md`
- [ ] Test: All settings pages load and work

#### Part 14: Admin Dashboard (3 hours)
- [ ] Files: 9 files (optional for MVP)
- [ ] Command: `Build Part 14: Admin from v5_part_n.md`
- [ ] Test: Admin pages accessible for admin user

#### Part 15: Notifications & Real-time (4 hours)
- [ ] Files: 9 files
- [ ] Command: `Build Part 15: Notifications from v5_part_o.md`
- [ ] Test: Notification bell shows alerts

#### Part 16: Utilities & Infrastructure (3 hours)
- [ ] Files: 25 files
- [ ] Command: `Build Part 16: Utilities from v5_part_p.md`
- [ ] Test: Email sending, error logging, caching work

---

## 📊 PHASE 3 COMPLETION CRITERIA

**When Phase 3 is complete, you'll have:**
- ✅ All 170+ files built by Aider
- ✅ All 16 parts tested
- ✅ All API endpoints tested in Postman
- ✅ All UI components tested in browser
- ✅ FREE tier: 5 symbols × 3 timeframes working
- ✅ PRO tier: 15 symbols × 9 timeframes working
- ✅ Stripe billing working
- ✅ All tier restrictions enforced

**Total Time:** ~38 hours (spread over weeks 3-10)

**Your Time:** ~10-15 hours (monitoring, testing, escalations)

**Aider's Time:** ~23-28 hours (autonomous building)

**Documentation:** `docs/v7/v7_phase_3_building.md`

---

## 📅 PHASE 4: Deployment (6 hours) ⏳ NOT STARTED

**Objective:** Deploy Next.js to Vercel and Flask to Railway.

**Timeline:** Week 11

### Step 1: Prepare for Deployment (1 hour)
- [ ] Set production environment variables
- [ ] Create production Stripe products
- [ ] Setup production PostgreSQL database

### Step 2: Deploy to Vercel (Next.js) (2 hours)
- [ ] Connect GitHub repository to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Deploy and verify

### Step 3: Deploy to Railway (Flask + PostgreSQL) (2 hours)
- [ ] Create Railway project
- [ ] Deploy PostgreSQL database
- [ ] Deploy Flask MT5 service
- [ ] Connect to deployed database

### Step 4: Configure Custom Domain (1 hour)
- [ ] Add custom domain to Vercel
- [ ] Configure DNS records
- [ ] Enable SSL certificate

**Verification:**
- [ ] Visit production URL
- [ ] Test user registration and login
- [ ] Test alert creation
- [ ] Test tier upgrade flow
- [ ] Test all critical features

**Documentation:** `docs/v7/v7_phase_4_deployment.md`

---

## 📊 PROJECT COMPLETION STATUS

### Overall Metrics

| Metric | Current | Target | Progress |
|--------|---------|--------|----------|
| **Files Built** | 0 | 170 | 0% |
| **Parts Completed** | 0 | 16 | 0% |
| **API Endpoints** | 0 | ~50 | 0% |
| **UI Pages** | 0 | ~20 | 0% |
| **Tests Written** | 0 | 100+ | 0% |
| **Documentation** | 10+ files | Complete | ~80% |

### Phase Completion

| Phase | Status | Time Spent | Time Remaining |
|-------|--------|------------|----------------|
| Phase 0: Setup | ✅ Complete | 4h | 0h |
| Phase 1: Documentation | 🔄 90% | ~14h | ~1h (user tests) |
| Phase 2: Foundation | ⏳ Not Started | 0h | 5h |
| Phase 3: Building | ⏳ Not Started | 0h | 38h |
| Phase 4: Deployment | ⏳ Not Started | 0h | 6h |
| **TOTAL** | **25% Complete** | **~18h** | **~50h** |

---

## 🎯 SUCCESS METRICS

### Functionality Checklist
- [ ] User can register and login
- [ ] FREE user can access 5 symbols × 3 timeframes
- [ ] PRO user can access 15 symbols × 9 timeframes
- [ ] User can create, edit, delete alerts
- [ ] Alerts trigger correctly based on conditions
- [ ] User can manage watchlist with symbol+timeframe combinations
- [ ] User can upgrade from FREE to PRO via Stripe
- [ ] Dashboard shows correct data for user's tier
- [ ] Charts display indicator data correctly
- [ ] Tier restrictions enforced in API and UI

### Quality Checklist
- [ ] 0 Critical security issues
- [ ] ≤2 High issues per file
- [ ] 100% TypeScript coverage (no 'any' types)
- [ ] All APIs match OpenAPI specifications
- [ ] All Postman tests passing
- [ ] Mobile responsive design
- [ ] Error messages are user-friendly
- [ ] Loading states implemented
- [ ] Authentication secure (JWT, HTTP-only cookies)
- [ ] SQL injection prevention (Prisma ORM)

### Performance Checklist
- [ ] Page load < 2 seconds
- [ ] API response < 500ms
- [ ] Chart data loads < 1 second
- [ ] Flask MT5 response < 300ms
- [ ] Database queries optimized

---

## 📝 DEVELOPMENT NOTES

### Decisions Made
1. **2025-11-09**: Using MiniMax M2 API (Anthropic-compatible) for cost-effective autonomous building
2. **2025-11-09**: Created 7 comprehensive policy documents for Aider guidance
3. **2025-11-09**: Confirmed 2-tier system (FREE/PRO) - no ENTERPRISE
4. **2025-11-11**: Migrated from OpenAI to Anthropic compatibility API for MiniMax M2

### Issues Encountered
*None yet - documentation phase*

### Learnings
- Policy-driven development requires upfront investment but saves time later
- Clear tier specifications prevent confusion during implementation
- Comprehensive testing documentation is essential for beginners

---

## 🔗 QUICK REFERENCE - KEY DOCUMENTS

### For Building (You'll use constantly)
- **IMPLEMENTATION-GUIDE.md** - V7 workflow, how to work with Aider
- **docs/policies/05-coding-patterns.md** - Copy-paste code examples
- **docs/v5-structure-division.md** - Where each file goes

### For Testing
- **postman/TESTING-GUIDE.md** - Test scenarios for all endpoints
- **postman/README.md** - Postman setup guide
- **scripts/openapi/README.md** - Type generation guide

### For Troubleshooting
- **MINIMAX-TROUBLESHOOTING.md** - MiniMax M2 API issues
- **IMPLEMENTATION-GUIDE.md** (Section 7) - Common problems
- **DOCKER.md** - Docker setup for Flask

### For Verification
- **docs/v7/AIDER-COMPREHENSION-TESTS.md** - Test Aider's understanding
- **docs/v7/PHASE-1-READINESS-CHECK.md** - Phase 1 completion check

### For Architecture
- **ARCHITECTURE.md** - System design overview
- **docs/policies/03-architecture-rules.md** - Architectural constraints

---

## 🎯 YOUR CURRENT TASK

**You are here:** Phase 1, Milestone 1.6-1.7

**Next steps:**
1. [ ] Run Aider comprehension tests (`docs/v7/AIDER-COMPREHENSION-TESTS.md`)
2. [ ] Complete readiness check (`docs/v7/PHASE-1-READINESS-CHECK.md`)
3. [ ] Sign off on Phase 1 completion
4. [ ] Begin Phase 2: Foundation Setup

**Command to start:**
```bash
cd trading-alerts-saas-v7
py -3.11 -m aider --model anthropic/MiniMax-M2
```

---

## 📞 HELP & SUPPORT

**If you're stuck:**
1. Check this PROGRESS.md for your current step
2. Read the linked documentation
3. Check troubleshooting guides
4. Ask Claude Chat for clarification

**Remember:** This is a comprehensive roadmap. Take it one step at a time, test frequently, and don't skip steps!

---

**🎉 You're building a complete SaaS from scratch! Each step forward is progress. Trust the process!**

---

**Last Updated:** 2025-11-11
**Last Updated By:** Claude Code
**Next Update:** After Phase 2 completion
