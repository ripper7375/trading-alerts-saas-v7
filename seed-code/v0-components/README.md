# V0.dev Component Prototypes - Production Mapping

This folder contains v0.dev-generated components that serve as visual references and seed code for Aider to build production components.

## 📁 Folder Structure → Production Mapping

### Layouts
- `layouts/dashboard-layout.tsx` 
  - **Production:** `app/(dashboard)/layout.tsx`
  - **Purpose:** Main dashboard shell with sidebar + top bar
  - **Aider instruction:** "Use seed-code/v0-components/layouts/dashboard-layout.tsx as reference for app/(dashboard)/layout.tsx"

### Charts
- `charts/trading-chart.tsx`
  - **Production:** `components/charts/trading-chart.tsx`
  - **Purpose:** TradingView chart with fractal overlays
  - **Aider instruction:** "Adapt seed-code/v0-components/charts/trading-chart.tsx to components/charts/trading-chart.tsx, integrate with Flask MT5 API for real data"

- `charts/chart-controls.tsx`
  - **Production:** `components/charts/chart-controls.tsx`
  - **Purpose:** Symbol/timeframe selectors with tier validation
  - **Extract from:** trading-chart.tsx (controls bar section)

- `charts/timeframe-selector.tsx`
  - **Production:** `components/charts/timeframe-selector.tsx`
  - **Purpose:** Timeframe dropdown with FREE/PRO restrictions
  - **Extract from:** trading-chart.tsx (timeframe dropdown)

### Alerts
- `alerts/alert-card.tsx`
  - **Production:** `components/alerts/alert-card.tsx`
  - **Purpose:** Reusable alert card with status badges
  - **Aider instruction:** "Use seed-code/v0-components/alerts/alert-card.tsx as base for components/alerts/alert-card.tsx, connect to /api/alerts"

## 🎯 How Aider Uses These Files

### Pattern 1: Direct Adaptation
```bash
# In Aider:
"Build components/charts/trading-chart.tsx following seed-code/v0-components/charts/trading-chart.tsx.
Replace mock data with API calls to /api/fractals/{symbol}/{timeframe}.
Add tier validation from lib/tier/validation.ts."
```

### Pattern 2: Component Extraction
```bash
# In Aider:
"Extract the timeframe selector from seed-code/v0-components/charts/trading-chart.tsx
into a separate component at components/charts/timeframe-selector.tsx.
Add tier prop and filter timeframes based on FREE/PRO tier."
```

### Pattern 3: Layout Reference
```bash
# In Aider:
"Create app/(dashboard)/layout.tsx using seed-code/v0-components/layouts/dashboard-layout.tsx
as the visual reference. Add NextAuth session handling and tier badge logic."
```

## 📊 Component Dependencies
```
dashboard-layout.tsx
└─ (wraps all dashboard pages)
   ├─ page.tsx (dashboard home)
   └─ charts/page.tsx
      └─ trading-chart.tsx
         ├─ chart-controls.tsx
         └─ timeframe-selector.tsx
```

## 🔄 Workflow

1. **V0.dev generates** → Save to seed-code/v0-components/
2. **Aider reads** → Understands visual patterns
3. **Aider builds** → Creates production files with API integration
4. **Claude Code validates** → Ensures quality
5. **You test** → In actual Next.js app

## ⚠️ Important Notes

- These are **reference implementations** with mock data
- Production components need:
  - ✅ Real API integration (Flask MT5 service)
  - ✅ Tier validation (lib/tier/validation.ts)
  - ✅ Error handling and loading states
  - ✅ NextAuth session management
  - ✅ TypeScript types from OpenAPI
- Do NOT copy these files directly to production without adaptation