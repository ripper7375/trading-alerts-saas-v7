## PHASE 2: CI/CD & DATABASE FOUNDATION
### Timeline: Week 2 (5 hours)
### Goal: Setup automation and deploy database EARLY

💡 BEGINNER TIP: We deploy the database in Week 2 (not Week 10!) to avoid 
"migration hell" - database problems at the end when everything depends on it.

---

### MILESTONE 2.1: GitHub Actions Setup (2 hours)

**What:** Automated testing on every code push
**Why:** Catch errors early, ensure quality

Instead of manually creating workflow files, use Aider with MiniMax M2!

☐ STEP 1: Start Aider (2 minutes)
   ```
   py -3.11 -m aider --model openai/MiniMax-M2
   ```

☐ STEP 2: Create Next.js CI Workflow (30 minutes)

You: 
```
Create .github/workflows/ci-nextjs.yml

Requirements:
- Trigger on push to main branch
- Trigger on pull requests
- Build Next.js 15 with Turbopack
- Validate docs/trading_alerts_openapi.yaml with swagger-cli
- Run TypeScript type checking
- Run ESLint
- Follow GitHub Actions best practices from policies

Show me the complete workflow file for approval.
```

Aider generates → You review → Approve → Aider creates file

Verify:
```
cat .github/workflows/ci-nextjs.yml
```

☐ STEP 3: Create Flask CI Workflow (30 minutes)

You:
```
Create .github/workflows/ci-flask.yml

Requirements:
- Trigger on push to main
- Trigger on pull requests
- Build Flask application
- Validate docs/flask_mt5_openapi.yaml
- Run Python linting (flake8)
- Run Python type checking (mypy)
- Follow best practices

Show me the complete workflow.
```

Same process: generate → review → approve → create

☐ STEP 4: Create OpenAPI Validation Workflow (30 minutes)

You:
```
Create .github/workflows/openapi-validation.yml

Requirements:
- Trigger on any change to *.yaml files in docs/
- Validate both OpenAPI specs
- Check for breaking changes
- Report validation errors clearly

Show me complete workflow.
```

☐ STEP 5: Push and Test (30 minutes)

Exit Aider: `/exit`

Commit all workflows:
```
git add .github/
git commit -m "Add CI/CD workflows for Next.js, Flask, and OpenAPI validation"
git push
```

Go to GitHub.com → Your repo → "Actions" tab

Watch workflows run!

Expected: Some failures (project doesn't exist yet) - that's OK!

✅ CHECKPOINT: CI/CD configured

💡 BEGINNER TIP: GitHub Actions runs these checks automatically on every push!

---

### MILESTONE 2.2: GitHub Secrets Configuration (30 minutes)

**What:** Store sensitive credentials securely
**Why:** Never commit secrets to code!

☐ STEP 1: Navigate to Secrets (5 minutes)
   Go to: GitHub.com → Your repo → Settings → Secrets and variables → Actions

☐ STEP 2: Generate NextAuth Secret (5 minutes)
   Run locally:
   ```
   openssl rand -base64 32
   ```
   Copy output (save it!) 📝

☐ STEP 3: Add Secrets (15 minutes)
   Click "New repository secret" for each:
   
   | Name | Value | Notes |
   |------|-------|-------|
   | NEXTAUTH_SECRET | [from Step 2] | Auth encryption key |
   | DATABASE_URL | postgresql://temp:temp@localhost/temp | Temporary (will update) |
   | MT5_API_KEY | temp-key-123 | Temporary (will update) |
   | OPENAI_API_KEY | [your MiniMax key] | For Aider in CI |
   | OPENAI_API_BASE | https://api.minimaxi.com/v1 | MiniMax endpoint |

☐ STEP 4: Verify Secrets (5 minutes)
   Check: All 5 secrets show in list (values hidden) ✓

✅ CHECKPOINT: Secrets configured

💡 BEGINNER TIP: Never put real passwords in code! Always use secrets.

---

### 🚨 MILESTONE 2.3: Railway PostgreSQL Setup (1.5 hours)

**What:** Deploy database to cloud NOW (Week 2!)
**Why:** Test database setup early, prevent migration hell later

💡 CRITICAL: This is why V7 is better - database deployed early!

☐ STEP 1: Create Railway Account (10 minutes)
   1. Go to railway.app
   2. Click "Login" → "Login with GitHub"
   3. Authorize Railway
   4. Verify email

☐ STEP 2: Create Project (10 minutes)
   1. Click "New Project"
   2. Select "Provision PostgreSQL"
   3. Project name: "trading-alerts-saas-v7"
   4. Region: Choose closest to you
   5. Click "Deploy"
   
   Wait: PostgreSQL provisions (2-3 minutes)

☐ STEP 3: Get Database URL (10 minutes)
   1. Click PostgreSQL service
   2. Click "Connect" tab
   3. Find "DATABASE_URL"
   4. Copy entire URL (starts with postgresql://)
   5. Save it! 📝

☐ STEP 4: Test Connection Locally (15 minutes)
   
   Install pg library temporarily:
   ```
   npm install pg
   ```
   
   Create test file: `test-db-connection.js`
   ```javascript
   const { Client } = require('pg');
   
   const connectionString = 'YOUR_RAILWAY_DATABASE_URL_HERE';
   
   const client = new Client({ connectionString });
   
   client.connect()
     .then(() => {
       console.log('✅ Connected to Railway PostgreSQL!');
       return client.end();
     })
     .catch(err => {
       console.error('❌ Connection failed:', err.message);
     });
   ```
   
   Replace YOUR_RAILWAY_DATABASE_URL_HERE with your actual URL
   
   Run:
   ```
   node test-db-connection.js
   ```
   
   Expected: "✅ Connected to Railway PostgreSQL!"
   
   If connected ✓ → Success! Delete test file:
   ```
   rm test-db-connection.js
   ```

☐ STEP 5: Update GitHub Secret (5 minutes)
   GitHub → Settings → Secrets → DATABASE_URL → Edit
   
   Replace with your Railway URL

☐ STEP 6: Save Connection Info (5 minutes)
   Create: `docs/RAILWAY-INFO.md` (for your reference, DON'T commit!)
   
   ```markdown
   # Railway Connection Info
   
   ## PostgreSQL
   - Project: trading-alerts-saas-v7
   - Region: [your region]
   - DATABASE_URL: [your url - KEEP PRIVATE!]
   
   ## Dashboard
   - URL: railway.app/project/[your-project-id]
   
   ## Notes
   - Deployed: [date]
   - Plan: Free tier (5GB storage, $5 credit)
   ```
   
   ⚠️ DON'T commit this file! It's just for your reference.

✅ CHECKPOINT: Railway PostgreSQL deployed and tested!

💡 BEGINNER VICTORY: Your database is live in Week 2! When you build your app 
in Phase 3, you'll test on this production-like database immediately. No surprises later!

---

### MILESTONE 2.4: Prisma Workflow Understanding (30 minutes)

**What:** Learn how database migrations work
**Why:** You'll do this in Phase 3, understand it now

💡 BEGINNER TIP: Prisma = tool that talks to PostgreSQL for you. You write 
schema, Prisma creates tables.

☐ STEP 1: Read About Prisma (15 minutes)

Ask Claude Chat (me!):

```
Explain Prisma workflow for a complete beginner.

Cover:
1. What is Prisma? (simple explanation)
2. What is prisma/schema.prisma?
3. What are migrations?
4. The workflow: schema → migrate → deploy
5. Local vs Railway migrations
6. Why test on Railway early

Use simple language and analogies!
```

Read my explanation carefully. Ask questions if unclear!

☐ STEP 2: Understand The Workflow (15 minutes)

**The Process (you'll do this in Phase 3):**

```
STEP 1: Write Schema
Create: prisma/schema.prisma
Define: User table, Alert table, etc.

STEP 2: Test Locally
Run: npx prisma migrate dev --name init_users
Result: Creates tables in local PostgreSQL

STEP 3: Test on Railway (CRITICAL!)
Run: DATABASE_URL=[Railway] npx prisma migrate deploy
Result: Creates same tables on Railway

STEP 4: Verify Both
Local: npx prisma studio (opens GUI)
Railway: DATABASE_URL=[Railway] npx prisma studio
Result: See tables in both databases

STEP 5: Continue Building
Both databases now have same structure!
```

💡 KEY INSIGHT: Test on Railway IMMEDIATELY after local test. Don't wait!

✅ CHECKPOINT: Understand Prisma workflow

💡 BEGINNER NOTE: You'll execute this in Phase 3 with Aider. For now, just 
understand the concept!

---

### MILESTONE 2.5: Docker Configuration (1 hour)

**What:** Container setup for Flask service
**Why:** Package Flask for deployment

💡 BEGINNER TIP: Docker is OPTIONAL for local development!
   - Local dev: Run Flask with `python run.py`
   - Production: Docker required for Railway deployment
   
   You can develop the Flask service without Docker, then
   containerize it when ready to deploy.

☐ STEP 1: Start Aider (2 minutes)
   ```
   py -3.11 -m aider --model openai/MiniMax-M2
   ```

☐ STEP 2: Create Dockerfile for Flask (25 minutes)

You:
```
Create Dockerfile for Flask MT5 service

Location: mt5-service/Dockerfile

Requirements:
- Python 3.11-slim base image
- Install MT5 Linux libraries
- Install Python dependencies from requirements.txt
- Copy application code
- Expose port 5001
- Use gunicorn for production
- Follow Docker best practices from policies

Show me complete Dockerfile for approval.
```

Aider generates → Review → Approve → Creates

☐ STEP 3: Create docker-compose.yml (25 minutes)

You:
```
Create docker-compose.yml for local development

Requirements:
- PostgreSQL service (matches Railway)
- Flask MT5 service
- Proper networking
- Volume mounts for development
- Environment variables
- Follow best practices

Show me complete docker-compose.yml for approval.
```

☐ STEP 4: Test Docker Build (10 minutes)

   Exit Aider: `/exit`
   
   OPTIONAL - Try building (will fail - no requirements.txt yet, that's OK!):
cd mt5-service docker build -t mt5-service.


Expected: Error about missing files - normal!

💡 BEGINNER NOTE: 
   You DON'T need Docker working now for local development.
   
   Local development: Just run `python run.py`
   
   Docker is required LATER for Railway deployment in Phase 4.

✅ CHECKPOINT: Docker files ready for Phase 4 deployment

💡 BEGINNER TIP: You'll test this properly in Phase 3 when Flask code exists!

---

### MILESTONE 2.6: Testing Framework Setup (30 minutes)

**What:** Prepare testing tools
**Why:** Test as you build!

☐ STEP 1: Start Aider (2 minutes)
   ```
   py -3.11 -m aider --model openai/MiniMax-M2
   ```

☐ STEP 2: Setup Jest (25 minutes)

You:
```
Set up Jest testing framework for Next.js 15

Requirements:
- Install jest, @testing-library/react, @testing-library/jest-dom
- Create jest.config.js for Next.js 15
- Create jest.setup.js
- Create example test: __tests__/example.test.ts
- Add test scripts to package.json
- Follow testing strategy from policies

Show me all files for approval.
```

Aider generates all files → Review → Approve → Creates

☐ STEP 3: Commit (3 minutes)

Exit: `/exit`

```
git add .
git commit -m "Setup Jest testing framework"
git push
```

✅ CHECKPOINT: Testing ready

---

## ✅ PHASE 2 COMPLETE! 🎉

### What You Accomplished:

☐ GitHub Actions CI/CD configured (3 workflows)
☐ GitHub secrets configured (5 secrets including MiniMax)
☐ Railway PostgreSQL deployed and tested ⭐
☐ Prisma workflow understood
☐ Docker configuration created
☐ Jest testing framework ready

### What You Learned:

✓ CI/CD automation concepts
✓ How to secure secrets
✓ Cloud database deployment
✓ Database migration workflow
✓ Docker containerization basics
✓ Testing framework setup
✓ Working with Aider and MiniMax M2

### Critical Win:

🎯 **DATABASE DEPLOYED IN WEEK 2!**

This prevents "migration hell" - you'll test database changes on Railway 
throughout Phase 3, not discover problems at the end!

### Time Invested: 5 hours

### Readiness Check:

☐ All 3 GitHub Actions workflows created
☐ All 5 GitHub secrets configured (including MiniMax)
☐ Railway PostgreSQL live and accessible
☐ Understand Prisma workflow
☐ Docker files created
☐ Jest configured

If all checked ✅ → **READY FOR PHASE 3!** 🚀

💡 BEGINNER INSIGHT: Your infrastructure is ready! Foundation = solid. 
Now comes the fun part - building features autonomously with MiniMax M2!

---