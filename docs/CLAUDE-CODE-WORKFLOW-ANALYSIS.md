# Claude Code Workflow Analysis and Alignment

**Created:** 2025-11-18
**Purpose:** Align Claude Code validation workflow with new build-order system
**Status:** Analysis Complete - Implementation Needed

---

## Executive Summary

The **build-order system** (Macro-to-Micro ordering) was successfully implemented on 2025-11-17, but **Claude Code's documentation** (`CLAUDE.md`) and **Aider's workflow instructions** (`06-aider-instructions.md`) still reference the **old system** where `v5_part_*.md` files were used as build instructions.

**Impact:** Documentation mismatch could cause confusion about how Aider reads requirements and how Claude Code validates.

**Solution:** Update both documentation files to reference the new build-order system while preserving `v5_part_*.md` files as reference guides.

---

## Current State Analysis

### ✅ What's Working (Correctly Implemented)

#### 1. Build-Order System Files
```
docs/build-orders/
├── README.md                    ✅ Complete reference guide
├── TEMPLATE.md                  ✅ Template for new build orders
├── part-01-foundation.md        ✅ Detailed with 12 files
├── part-02-database.md          ✅ Detailed with 4 files
└── part-03 through part-18.md  ✅ Placeholder structure
```

#### 2. .aider.conf.yml Configuration
```yaml
# Lines 86-108: Correctly loads build-order files
read:
  - docs/build-orders/part-01-foundation.md
  - docs/build-orders/part-02-database.md
  # ... all 18 parts

# Lines 199-214: Correctly loads v5_part_*.md as reference guides
  - docs/implementation-guides/v5_part_a.md  # Reference only
  - docs/implementation-guides/v5_part_b.md  # Reference only
  # ...
```

#### 3. Verification System
- `scripts/verify-alignment.sh` ✅ Working perfectly
- All 6 checks passing ✅
- Validates build-order files exist ✅

---

### ❌ What Needs Updating (Documentation Gaps)

#### 1. CLAUDE.md (Outdated References)

**Issue:** References old `v5_part_*.md` files as build instructions

**Line 98:** Integration Architecture diagram
```markdown
│  Step 1: Read requirements from v5_part_e.md    │  ← OUTDATED
```

**Should be:**
```markdown
│  Step 1: Read requirements from build-orders/part-05-authentication.md  │
│           References v5_part_e.md for business logic details             │
```

**Line 497:** Validation workflow example
```markdown
│ Aider reads: docs/v5_part_k.md (Alerts requirements)       │  ← OUTDATED
```

**Should be:**
```markdown
│ Aider reads: docs/build-orders/part-11-alerts.md (Build sequence)  │
│              docs/v5_part_*.md (Business requirements)             │
```

**Lines 118-136:** .aider.conf.yml example
```yaml
# Missing: build-order files
read:
  - docs/policies/01-approval-policies.md
  - docs/policies/02-quality-standards.md
  # ... (no build-orders shown)
```

**Should include:**
```yaml
read:
  # Policies
  - docs/policies/00-tier-specifications.md
  # ... all 9 policies

  # Build orders (file-by-file sequences)
  - docs/build-orders/part-01-foundation.md
  - docs/build-orders/part-02-database.md
  # ... all 18 parts

  # Implementation guides (business logic reference)
  - docs/implementation-guides/v5_part_a.md
  - docs/implementation-guides/v5_part_b.md
  # ...
```

---

#### 2. 06-aider-instructions.md (Outdated Workflow)

**Lines 85-100:** Step 1 - READ REQUIREMENTS
```markdown
1. Read v5-structure-division.md for:
   - Exact file location
   - Which part this file belongs to

2. Read relevant implementation guide for:
   - docs/implementation-guides/v5_part_X.md  ← OUTDATED (treats as build instruction)
   - Implementation details
   - Business requirements
```

**Should be:**
```markdown
1. Read v5-structure-division.md for:
   - Part structure overview
   - Which part this file belongs to

2. Read build-order file for file-by-file sequence:
   - docs/build-orders/part-XX-[name].md  ← NEW (primary build instruction)
   - Exact file location
   - Build sequence
   - Dependencies
   - Pattern references

3. Read implementation guide for business context:
   - docs/implementation-guides/v5_part_X.md  ← REFERENCE (detailed requirements)
   - Business logic details
   - Tier validation rules
   - Special requirements
```

---

## The New System Hierarchy

### Before (Old System)
```
Phase Definition (v7_phase_3_building.md)
    ↓
Part Structure (v5-structure-division.md)
    ↓
Implementation Guide (v5_part_*.md)  ← USED AS BUILD INSTRUCTION
    ↓
Code Generation
```

**Problem:** Implementation guides are organized by topic/feature, not file-by-file sequence.

---

### After (New System)
```
(E) PHASE: v7_phase_3_building.md
    ↓ "Build Parts 1-18"

(B) PART ORDERS: v5-structure-division.md
    ↓ Defines Parts 1-18 (which files in each)

(C) FILE-BY-FILE ORDERS: build-orders/part-XX-*.md  ← NEW PRIMARY BUILD INSTRUCTION
    ↓ Detailed build sequence for each part
    ↓ References v5_part_*.md for business logic

(D) SPECIAL RULES: 06-aider-instructions.md
    ↓ Overrides for complex parts

(A) API COMPLIANCE: OpenAPI specs
    ↓ All files comply with these contracts
```

**Benefit:** Clear separation between build sequence (build-orders) and business logic (v5_part_*).

---

## Role Clarification: v5_part_*.md Files

### NEW Role (Reference Guides)
```
Purpose: Detailed business logic and requirements documentation
Usage: Aider references these for context AFTER reading build-order
Location: docs/implementation-guides/
Loaded: As reference material in .aider.conf.yml

Example:
- Build-order says: "Build app/api/alerts/route.ts"
- Aider reads: build-orders/part-11-alerts.md (HOW to build, WHAT sequence)
- Aider references: v5_part_*.md (WHY this logic, WHAT business rules)
```

### What They Contain
- ✅ Business requirements
- ✅ Detailed feature descriptions
- ✅ Tier validation rules
- ✅ API endpoint specifications
- ✅ UI/UX requirements
- ❌ NOT file-by-file build order (that's in build-orders/)

---

## Claude Code Validation Workflow (Updated)

### Current Validation Process (What Happens)
```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Aider Generates Code                               │
├─────────────────────────────────────────────────────────────┤
│ Aider reads:                                                │
│   1. build-orders/part-11-alerts.md  ← PRIMARY (sequence)  │
│   2. v5_part_*.md                    ← REFERENCE (logic)   │
│   3. trading_alerts_openapi.yaml     ← COMPLIANCE          │
│   4. 05-coding-patterns.md           ← PATTERNS            │
│                                                             │
│ Aider generates: app/api/alerts/route.ts                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
                 Code Generated
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Claude Code Validation (Automatic)                 │
├─────────────────────────────────────────────────────────────┤
│ Claude Code loads:                                          │
│   ✓ All 9 policy files (00-08)                            │
│   ✓ Build-order file (part-11-alerts.md)   ← NEW CHECK   │
│   ✓ OpenAPI specifications                                 │
│   ✓ Coding patterns                                        │
│                                                             │
│ Claude Code validates:                                      │
│   ✓ Matches build-order sequence?                          │
│   ✓ Dependencies met? (file 3/12 depends on file 1/12)    │
│   ✓ TypeScript types correct?                              │
│   ✓ Error handling present?                                │
│   ✓ Tier validation included?                              │
│   ✓ API contract matches OpenAPI?                          │
│   ✓ Security standards met?                                │
│                                                             │
│ Analysis time: 3-5 seconds                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
                 Validation Complete
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Decision Made                                      │
├─────────────────────────────────────────────────────────────┤
│ ✅ APPROVE: All checks passed + sequence correct           │
│ 🔧 FIX: Minor issues + regenerate                          │
│ 🚨 ESCALATE: Architectural decision needed                 │
└─────────────────────────────────────────────────────────────┘
```

### NEW Validation Checks (Build-Order Specific)

Claude Code should now also check:

1. **Build Sequence Compliance**
   ```
   ✅ File is built in correct order according to build-orders/part-XX-*.md
   ✅ All dependency files exist (file 5/12 can depend on file 2/12)
   ✅ No files built out of sequence
   ```

2. **Pattern Reference Compliance**
   ```
   ✅ Uses pattern specified in build-order file
   ✅ Pattern matches 05-coding-patterns.md definition
   ```

3. **OpenAPI Reference Compliance**
   ```
   ✅ Request/response types match OpenAPI section referenced in build-order
   ✅ HTTP methods correct per build-order specification
   ```

---

## Implementation Plan

### Phase 1: Update CLAUDE.md

**File:** `/home/user/trading-alerts-saas-v7/CLAUDE.md`

**Changes needed:**

1. **Line 98** - Update integration architecture diagram
   ```markdown
   # BEFORE:
   │  Step 1: Read requirements from v5_part_e.md    │

   # AFTER:
   │  Step 1: Read build-order from build-orders/part-05-authentication.md  │
   │           Reference v5_part_e.md for business logic details             │
   ```

2. **Line 497** - Update validation workflow example
   ```markdown
   # BEFORE:
   │ Aider reads: docs/v5_part_k.md (Alerts requirements)       │

   # AFTER:
   │ Aider reads:                                                            │
   │   - docs/build-orders/part-11-alerts.md (Build sequence & dependencies)│
   │   - docs/v5_part_*.md (Business requirements & logic)                   │
   │   - docs/trading_alerts_openapi.yaml (API contracts)                    │
   ```

3. **Lines 118-136** - Update .aider.conf.yml example
   ```yaml
   # Add build-orders section:
   read:
     # Constitutions (9 policies)
     - docs/policies/00-tier-specifications.md
     - docs/policies/01-approval-policies.md
     # ... all 9 policies

     # Build orders (file-by-file sequences) ← ADD THIS SECTION
     - docs/build-orders/part-01-foundation.md
     - docs/build-orders/part-02-database.md
     # ... all 18 parts

     # Implementation guides (business logic reference) ← ADD THIS LABEL
     - docs/implementation-guides/v5_part_a.md
     - docs/implementation-guides/v5_part_b.md
     # ...
   ```

4. **Add new section** - "Build-Order System Integration"
   - Explain (E)→(B)→(C)→(D) hierarchy
   - Show how build-orders provide file sequences
   - Clarify v5_part_*.md role as reference guides

5. **Update validation checks section** - Add build-order compliance checks
   - File sequence validation
   - Dependency checking
   - Pattern reference validation

6. **Update last updated date** - Change from 2025-11-12 to 2025-11-18

---

### Phase 2: Update 06-aider-instructions.md

**File:** `/home/user/trading-alerts-saas-v7/docs/policies/06-aider-instructions.md`

**Changes needed:**

1. **Lines 27-31** - Update file list to mention build-orders
   ```markdown
   **Project Specifications:**
   - `docs/v5-structure-division.md` - Part structure (19 parts)
   - `docs/build-orders/part-XX-*.md` - File-by-file build sequences ← ADD
   - `docs/implementation-guides/v5_part_*.md` - Business logic reference ← CLARIFY
   - `docs/trading_alerts_openapi.yaml` - API contracts
   ```

2. **Lines 85-100** - Update STEP 1: READ REQUIREMENTS
   ```markdown
   ### STEP 1: READ REQUIREMENTS

   1. Read v5-structure-division.md for:
      - Part structure overview
      - File organization

   2. Read build-order file for exact build sequence:  ← NEW STEP
      - docs/build-orders/part-XX-[name].md
      - Exact file to build (e.g., "File 3/12: app/api/alerts/route.ts")
      - Dependencies (what must exist before building this file)
      - Pattern reference (which pattern from 05-coding-patterns.md to use)
      - OpenAPI reference (which schemas apply)
      - Seed code reference (which examples to look at)

   3. Read implementation guide for business context:  ← CLARIFY ROLE
      - docs/implementation-guides/v5_part_X.md
      - Business requirements
      - Tier validation rules
      - Feature descriptions
      - UI/UX requirements

   4. Read OpenAPI spec for contracts:
      - docs/trading_alerts_openapi.yaml
      - Request/response structures
      - Required fields
      - Status codes
   ```

3. **Update workflow section** - Clarify build-order is primary build instruction

---

### Phase 3: Create Validation Checklist

**New File:** `/home/user/trading-alerts-saas-v7/docs/CLAUDE-CODE-VALIDATION-CHECKLIST.md`

Create a comprehensive checklist for Claude Code to validate:
- Build sequence compliance
- Dependency validation
- Pattern matching
- OpenAPI compliance
- Policy adherence
- Security standards

---

## Benefits of This Update

### 1. **Clear Separation of Concerns**
```
Build Orders (build-orders/part-XX-*.md):
  - WHAT file to build
  - WHEN to build it (sequence)
  - HOW to build it (pattern, dependencies)

Implementation Guides (v5_part_*.md):
  - WHY this logic exists
  - WHAT business rules apply
  - WHAT features are needed
```

### 2. **Better Aider Autonomy**
- Aider knows exact file sequence from build-orders
- No ambiguity about what to build next
- Dependencies clearly stated

### 3. **Better Claude Code Validation**
- Can validate against build sequence
- Can check dependencies are met
- Can verify pattern compliance

### 4. **Better Documentation**
- Single source of truth for build sequence (build-orders/)
- Single source of truth for business logic (v5_part_*.md)
- No duplication or confusion

---

## Success Criteria

After implementing these updates:

✅ **CLAUDE.md references build-orders/** as primary build instruction source
✅ **06-aider-instructions.md** uses build-orders in STEP 1 workflow
✅ **All diagrams** show correct file flow: build-orders → v5_part_*.md → OpenAPI
✅ **Validation workflow** includes build-order compliance checks
✅ **No outdated references** to v5_part_*.md as build instructions
✅ **Clear role distinction** between build-orders (HOW/WHEN) and v5_part_* (WHY/WHAT)

---

## Next Steps

1. **Review this analysis** with project owner
2. **Implement Phase 1** - Update CLAUDE.md
3. **Implement Phase 2** - Update 06-aider-instructions.md
4. **Implement Phase 3** - Create validation checklist
5. **Test workflow** - Run Aider with updated docs and verify it reads build-orders first
6. **Update verification script** - Add check for documentation alignment

---

## Appendix: File Reference Quick Guide

### Primary Build Instructions (File Sequence)
```
docs/build-orders/part-01-foundation.md      → Part 1 files
docs/build-orders/part-02-database.md        → Part 2 files
...
docs/build-orders/part-18-dlocal.md          → Part 18 files
```

### Business Logic Reference (Context)
```
docs/implementation-guides/v5_part_a.md      → Foundation details
docs/implementation-guides/v5_part_b.md      → Database details
...
docs/implementation-guides/v5_part_r.md      → Affiliate details
```

### Policies (Rules & Standards)
```
docs/policies/00-tier-specifications.md      → FREE vs PRO tiers
docs/policies/01-approval-policies.md        → Approve/Fix/Escalate criteria
docs/policies/02-quality-standards.md        → Code quality requirements
docs/policies/03-architecture-rules.md       → System design rules
docs/policies/04-escalation-triggers.md      → When to ask human
docs/policies/05-coding-patterns.md          → Code examples
docs/policies/06-aider-instructions.md       → Aider workflow
docs/policies/07-dlocal-integration-rules.md → dLocal payment rules
docs/policies/08-google-oauth-implementation-rules.md → OAuth rules
```

### API Contracts (Compliance)
```
docs/trading_alerts_openapi.yaml             → Next.js API spec
docs/flask_mt5_openapi.yaml                  → Flask MT5 spec
docs/dlocal-openapi-endpoints.yaml           → dLocal spec
```

---

**Document Status:** ✅ Analysis Complete - Ready for Implementation
**Created:** 2025-11-18
**Next Action:** Review and implement Phase 1-3 updates
