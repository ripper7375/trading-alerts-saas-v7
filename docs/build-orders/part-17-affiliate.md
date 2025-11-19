# Part 17: Affiliate Marketing Platform - Build Order

**From:** `docs/v5-structure-division.md` Part 17
**Total Files:** 67 files
**Estimated Time:** 20 hours (2.5 weeks)
**Priority:** ⭐⭐ Medium (Post-MVP)
**Complexity:** High

---

## Overview

**Scope:** Complete 2-sided marketplace for affiliate marketing with self-service portal, automated code distribution, accounting reports, and admin BI dashboard.

**Implementation Guide References:**
- `docs/policies/06-aider-instructions.md` Section 12 (Step 1.6) - Affiliate system architecture and implementation specifications
- `docs/v5-structure-division.md` Part 17 - Complete file list and structural organization

**Key Features:**
- Self-service affiliate registration
- Monthly code distribution (15 codes/affiliate)
- Commission tracking ($5 per PRO upgrade)
- Accounting-style reports
- Admin BI dashboard

**Dependencies:**
- Part 2 complete (Prisma schema updates for Affiliate, AffiliateCode, Commission models)
- Part 12 complete (Stripe integration for commission tracking)

---

## Build Summary

Due to the large number of files (67), this build order provides a high-level structure. Files are organized into logical groups:

### Database Models (3 files)
- Prisma schema updates: Affiliate, AffiliateCode, Commission models
- Migration file

### Affiliate Portal Frontend (8 files)
- Registration, login, dashboard, commissions report, codes report, profile, payment preferences pages

### Affiliate API Routes (11 files)
- Auth endpoints, dashboard stats, code inventory, commission reports

### Admin Portal Frontend (5 files)
- Affiliate list, affiliate details, P&L report, sales performance, commission owings, code inventory pages

### Admin API Routes (14 files)
- Affiliate CRUD, code distribution, account suspension, BI reports, commission payment

### Cron Jobs (3 files)
- Monthly code distribution
- Monthly code expiry
- Monthly report emails

### Business Logic (8 files)
- Code generator, commission calculator, report builder, validators, affiliate auth, email templates

### Components (15 files)
- Dashboard components, forms, report tables, admin components

### User Integration (2 files)
- Checkout validation, discount code input

---

## Build Sequence

1. **Database Layer** (Files 1-3)
   - Add Affiliate, AffiliateCode, Commission models to Prisma schema
   - Run migration
   - Commit: `feat(affiliate): add database models`

2. **Business Logic** (Files 4-11)
   - Code generator (crypto-secure)
   - Commission calculator
   - Validators
   - Auth helpers
   - Commit: `feat(affiliate): add business logic`

3. **Affiliate API** (Files 12-22)
   - Auth endpoints (register, verify, login)
   - Dashboard stats
   - Reports (code inventory, commissions)
   - Commit: `feat(affiliate): add affiliate API routes`

4. **Affiliate Portal** (Files 23-30)
   - Registration, login, dashboard pages
   - Reports pages
   - Profile/payment pages
   - Commit: `feat(affiliate): add affiliate portal pages`

5. **Admin API** (Files 31-44)
   - Affiliate management endpoints
   - BI report endpoints
   - Commission payment endpoints
   - Commit: `feat(affiliate): add admin API routes`

6. **Admin Portal** (Files 45-49)
   - Affiliate list/details pages
   - BI report pages
   - Commit: `feat(affiliate): add admin portal pages`

7. **Cron Jobs** (Files 50-52)
   - Code distribution job
   - Code expiry job
   - Report emails job
   - Commit: `feat(affiliate): add automated jobs`

8. **Components** (Files 53-67)
   - Dashboard components
   - Report tables
   - Forms
   - Admin components
   - Commit: `feat(affiliate): add UI components`

9. **User Checkout Integration** (Update existing files)
   - Update checkout to accept discount codes
   - Update Stripe webhook to create commissions
   - Commit: `feat(affiliate): integrate with checkout`

---

## Success Criteria

- ✅ All 67 files created
- ✅ Affiliate registration works
- ✅ Code distribution automated (monthly)
- ✅ Commission tracking works
- ✅ Reports display correctly
- ✅ Admin BI dashboard functional

---

## Reference Documentation

- **Complete Spec:** `docs/v5-structure-division.md` Part 17
- **File List:** See v5-structure-division.md for detailed file breakdown

---

**Last Updated:** 2025-11-18
