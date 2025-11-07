## PHASE 4: DEPLOYMENT
### Timeline: Week 11 (6 hours)
### Goal: Deploy to production

💡 BEGINNER TIP: Your app works locally. Now make it live for the world!

---

### MILESTONE 4.1: Final Quality Check (1 hour)

**Before deploying, verify everything!**

☐ STEP 1: Run All Tests (20 minutes)
   ```
   pnpm test          # Jest tests
   pnpm lint          # Linting
   pnpm type-check    # TypeScript
   pnpm build         # Production build
   ```
   
   All passing? ✅ → Good!

☐ STEP 2: Test All API Endpoints in Postman (30 minutes)
   - Open Postman
   - Set baseUrl: http://localhost:3000
   - Test all 38 endpoints
   - Mark each as working ✓

☐ STEP 3: Test All Features in Browser (10 minutes)
   Checklist:
   ☐ Register account
   ☐ Login
   ☐ Create watchlist
   ☐ Add alert
   ☐ View charts
   ☐ Upgrade to PRO (test mode)
   ☐ Settings
   ☐ Logout

✅ CHECKPOINT: All features working locally

---

### MILESTONE 4.2: Vercel Deployment (2 hours)

**What:** Deploy Next.js frontend
**Why:** Free, fast, optimized for Next.js

☐ STEP 1: Create Vercel Account (10 minutes)
   1. Go to vercel.com
   2. Click "Sign Up"
   3. Choose "Continue with GitHub"
   4. Authorize Vercel

☐ STEP 2: Import Project (15 minutes)
   1. Click "Add New Project"
   2. Select your GitHub repo: trading-alerts-saas-v7
   3. Click "Import"
   4. Framework Preset: Next.js (auto-detected)
   5. Root Directory: ./ (default)
   6. Click "Deploy"
   
   Wait: First deployment (5-10 minutes)

☐ STEP 3: Configure Environment Variables (30 minutes)
   
   After deployment, click "Settings" → "Environment Variables"
   
   Add these (for Production, Preview, Development):
   
   | Variable | Value | Notes |
   |----------|-------|-------|
   | NEXTAUTH_SECRET | [your secret] | From GitHub secrets |
   | NEXTAUTH_URL | https://your-app.vercel.app | Your Vercel URL |
   | DATABASE_URL | [Railway URL] | PostgreSQL connection |
   | MT5_API_URL | [Railway Flask URL] | Will add after Step 4.3 |
   | STRIPE_SECRET_KEY | [your key] | From Stripe dashboard |
   | STRIPE_WEBHOOK_SECRET | [will add] | After webhook setup |
   | NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | [your key] | Stripe public key |
   | RESEND_API_KEY | [your key] | For emails |
   
   💡 BEGINNER TIP: Variables starting with NEXT_PUBLIC_ are visible in browser!

☐ STEP 4: Redeploy After Variables (10 minutes)
   Click "Deployments" → Latest deployment → "..." → "Redeploy"
   
   Wait for deployment to complete

☐ STEP 5: Test Deployment (30 minutes)
   1. Visit your Vercel URL
   2. Test registration (should work!)
   3. Test login
   4. Try creating alert (will fail - Flask not deployed yet)
   
   Expected: Auth works, but MT5 features fail (normal - deploying Flask next!)

☐ STEP 6: Configure Custom Domain (Optional) (25 minutes)
   1. Settings → Domains
   2. Add your domain
   3. Configure DNS (follow Vercel instructions)
   4. Wait for SSL certificate (automatic)

✅ CHECKPOINT: Frontend deployed to Vercel!

💡 BEGINNER TIP: Your frontend is now live! But backend (Flask) isn't deployed 
yet, so MT5 features won't work until Milestone 4.3.

---

### MILESTONE 4.3: Railway Flask Deployment (2 hours)

**What:** Deploy Flask MT5 service
**Why:** Backend for real-time market data

☐ STEP 1: Prepare Flask for Railway (30 minutes)

In your Flask project (mt5-service/), verify these files exist:
   
   ☐ requirements.txt (Python dependencies)
   ☐ Dockerfile (container config)
   ☐ .dockerignore
   ☐ Procfile or start command
   
   If missing, use Aider to create them:
   ```
   py -3.11 -m aider --model openai/MiniMax-M2
   
   "Verify mt5-service has all files needed for Railway deployment:
   - requirements.txt with all dependencies
   - Dockerfile for production
   - .dockerignore
   - Proper start command
   
   Create any missing files following policies."
   ```

☐ STEP 2: Create Railway Service (20 minutes)
   1. Go to railway.app
   2. Open your project: "trading-alerts-saas-v7"
   3. Click "+ New" → "GitHub Repo"
   4. Select your repo
   5. Configure:
      - Root Directory: mt5-service
      - Builder: Dockerfile
   6. Click "Deploy"
   
   Wait: Initial deployment (5-10 minutes)

☐ STEP 3: Configure Environment Variables (20 minutes)
   
   In Railway Flask service → Variables tab:
   
   | Variable | Value | Notes |
   |----------|-------|-------|
   | MT5_LOGIN | [your MT5 login] | From MT5 terminal |
   | MT5_PASSWORD | [your MT5 password] | Keep secure! |
   | MT5_SERVER | [your MT5 server] | e.g., "MetaQuotes-Demo" |
   | MT5_API_KEY | [generate secure key] | Run: openssl rand -hex 32 |
   | FLASK_ENV | production | Production mode |
   | DATABASE_URL | ${{Postgres.DATABASE_URL}} | Links to Railway PostgreSQL |
   
   💡 BEGINNER TIP: ${{Postgres.DATABASE_URL}} is Railway's way of 
   referencing another service in same project!

☐ STEP 4: Get Flask Service URL (5 minutes)
   1. Click your Flask service
   2. Click "Settings" tab
   3. Find "Public Networking"
   4. Copy the URL (e.g., https://mt5-service-production-abc123.up.railway.app)
   5. Save it! 📝

☐ STEP 5: Update Vercel Environment Variable (10 minutes)
   1. Go to Vercel dashboard
   2. Your project → Settings → Environment Variables
   3. Find MT5_API_URL
   4. Edit → Paste Railway Flask URL
   5. Save
   6. Redeploy: Deployments → Latest → Redeploy

☐ STEP 6: Test Flask Deployment (30 minutes)
   
   Test with curl or Postman:
   
   **Test 1: Health Check**
   ```
   curl https://your-flask-url.railway.app/api/health
   ```
   
   Expected: `{"status": "ok", "mt5_connected": true}`
   
   **Test 2: Symbols Endpoint**
   ```
   curl -H "X-User-Tier: FREE" \
        https://your-flask-url.railway.app/api/symbols
   ```
   
   Expected: `{"symbols": ["XAUUSD"]}`
   
   **Test 3: Indicator Data**
   ```
   curl -H "X-User-Tier: PRO" \
        https://your-flask-url.railway.app/api/indicators/XAUUSD/H1
   ```
   
   Expected: JSON with indicator data
   
   All working? ✅ → Flask deployed successfully!

☐ STEP 7: Test Full Integration (15 minutes)
   1. Go to your Vercel URL
   2. Login
   3. Navigate to Charts
   4. Select XAUUSD, H1
   5. Chart loads with data? ✅
   
   💡 BEGINNER VICTORY: Your full stack is now live! 
   Vercel (frontend) → Railway (Flask) → MT5 (market data) 🎉

✅ CHECKPOINT: Full application deployed!

---

### MILESTONE 4.4: Stripe Webhook Setup (30 minutes)

**What:** Configure Stripe to notify your app of payments
**Why:** Handle subscription upgrades/cancellations

☐ STEP 1: Create Webhook Endpoint (10 minutes)
   1. Go to dashboard.stripe.com
   2. Developers → Webhooks
   3. Click "+ Add endpoint"
   4. URL: https://your-app.vercel.app/api/webhooks/stripe
   5. Events to send:
      - customer.subscription.created
      - customer.subscription.updated
      - customer.subscription.deleted
      - invoice.paid
      - invoice.payment_failed
   6. Click "Add endpoint"

☐ STEP 2: Get Webhook Secret (5 minutes)
   1. Click your webhook
   2. Copy "Signing secret" (starts with whsec_)
   3. Save it! 📝

☐ STEP 3: Add to Vercel (10 minutes)
   1. Vercel → Settings → Environment Variables
   2. Add: STRIPE_WEBHOOK_SECRET = [your secret]
   3. Save
   4. Redeploy

☐ STEP 4: Test Webhook (5 minutes)
   Stripe dashboard → Send test webhook
   
   Check Vercel logs: Function logs show webhook received ✅

✅ CHECKPOINT: Stripe configured!

---

### MILESTONE 4.5: Production Monitoring (30 minutes)

**What:** Setup error tracking and monitoring
**Why:** Know when things break!

☐ STEP 1: Railway Monitoring (10 minutes)
   Railway has built-in monitoring:
   1. Railway dashboard → Your services
   2. Click "Observability"
   3. View metrics, logs, alerts
   
   Configure email alerts:
   1. Settings → Notifications
   2. Add your email
   3. Enable: Service crashes, high resource usage

☐ STEP 2: Vercel Analytics (10 minutes)
   Vercel has built-in analytics:
   1. Your project → Analytics tab
   2. Enable Web Analytics (free)
   3. View real-time traffic

☐ STEP 3: Error Tracking - Sentry (Optional) (10 minutes)
   For detailed error tracking:
   ```
   npx @sentry/wizard@latest -i nextjs
   ```
   
   Follow prompts to configure Sentry

✅ CHECKPOINT: Monitoring configured!

---

### MILESTONE 4.6: Final Production Testing (30 minutes)

**The moment of truth! Test EVERYTHING in production!**

☐ Complete Feature Test Checklist:

**Authentication:**
   ☐ Register new account (use real email)
   ☐ Verify email works
   ☐ Login with new account
   ☐ Password reset flow
   ☐ Logout

**FREE Tier:**
   ☐ Dashboard loads
   ☐ Can only see XAUUSD in symbol list
   ☐ Create watchlist with XAUUSD
   ☐ View XAUUSD chart with indicators
   ☐ Create alert for XAUUSD
   ☐ Try accessing EURUSD (should be blocked ✓)

**Upgrade to PRO:**
   ☐ Click "Upgrade to PRO"
   ☐ Stripe checkout loads
   ☐ Use test card: 4242 4242 4242 4242
   ☐ Payment succeeds
   ☐ Dashboard shows PRO badge
   ☐ Can now see all 10 symbols
   ☐ Can create alerts for any symbol
   ☐ Try creating 21st alert (should hit limit)

**Watchlists:**
   ☐ Create watchlist
   ☐ Add multiple symbols (PRO only)
   ☐ Rename watchlist
   ☐ Delete watchlist

**Alerts:**
   ☐ Create price alert
   ☐ Edit alert
   ☐ Delete alert
   ☐ Verify notifications work

**Settings:**
   ☐ Update profile
   ☐ Change email preferences
   ☐ Update password

**Admin (if applicable):**
   ☐ Login as admin
   ☐ View all users
   ☐ View system stats

All tests passing? ✅ → **APPLICATION IS LIVE!** 🌐🎉

---

## ✅ PHASE 4 COMPLETE! 🎊

### What You Accomplished:

☐ Final quality check passed
☐ Frontend deployed to Vercel
☐ Backend deployed to Railway
☐ Database running on Railway (deployed Week 2!)
☐ All services connected and working
☐ Stripe webhooks configured
☐ Monitoring and alerts setup
☐ Comprehensive production testing completed
☐ **APPLICATION IS LIVE AND FUNCTIONAL!** 🚀

### What You Learned:

✓ Production deployment strategies
✓ Environment variable management
✓ Service integration (Vercel + Railway)
✓ Webhook configuration
✓ Production monitoring
✓ Full-stack deployment
✓ Testing in production

### Time Invested: 6 hours

### The Payoff:

You now have:
- ✅ Live SaaS application
- ✅ Real users can sign up
- ✅ Real payments processing
- ✅ Real market data flowing
- ✅ Professional infrastructure
- ✅ Monitoring and alerts
- ✅ Built cost-effectively with MiniMax M2

### Your Live URLs:

- **Frontend:** https://your-app.vercel.app
- **API:** https://your-app.vercel.app/api
- **Flask Service:** https://your-flask.railway.app
- **Database:** Railway PostgreSQL

### Share Your Success! 📢

Your app is live! Share it:
- Add to portfolio
- Post on Twitter/LinkedIn
- Share with friends
- Get feedback
- Add to resume

💡 BEGINNER CELEBRATION: You built and deployed a professional SaaS 
application in 67 hours using MiniMax M2! Compare to 163 hours manually. 
You saved 96 hours while learning modern AI-driven development at a fraction 
of the typical API cost! 🎓

---