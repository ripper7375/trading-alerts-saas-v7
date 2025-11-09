## Chart Data Refresh Strategy

### Real-Time Data Architecture

**Approach:** Polling (NOT WebSocket for MVP)

**Why Polling:**
- Simpler implementation (no WebSocket server needed)
- Lower infrastructure cost
- Sufficient for 1-minute candle updates
- Easier to debug and maintain
- Works with serverless (Vercel)

**Polling Intervals:**
```typescript
const REFRESH_INTERVALS = {
  M5:  30000,    // NEW - 30 seconds (PRO only - scalping)
  M15: 60000,    // 1 minute (60s)
  M30: 60000,    // 1 minute
  H1:  120000,   // 2 minutes
  H2:  120000,   // 2 minutes
  H4:  300000,   // 5 minutes
  H8:  300000,   // 5 minutes
  H12: 600000,   // NEW - 10 minutes (PRO only - swing trading)
  D1:  600000,   // 10 minutes
} as const;
```
Implementation Pattern:

// components/charts/trading-chart.tsx
'use client';

import { useEffect, useState } from 'react';

export function TradingChart({ symbol, timeframe }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Initial fetch
    fetchIndicatorData();
    
    // Set up polling
    const interval = setInterval(
      fetchIndicatorData,
      REFRESH_INTERVALS[timeframe]
    );
    
    // Cleanup
    return () => clearInterval(interval);
  }, [symbol, timeframe]);
  
  async function fetchIndicatorData() {
    const res = await fetch(`/api/indicators/${symbol}/${timeframe}`);
    const json = await res.json();
    setData(json.data);
  }
  
  return <Chart data={data} />;
}
User Controls:

Pause/Resume button (stops polling)
Manual refresh button
Last updated timestamp display
Loading indicator during fetch
Future Enhancement (Post-MVP):

WebSocket for real-time push updates
Server-Sent Events (SSE) alternative
Reduce polling intervals with SSE
Rate Limiting Consideration:

Polling counts toward API rate limits
FREE tier: 60 requests/hour = can support ~1 chart polling every minute
PRO tier: 300 requests/hour = can support ~5 charts polling every minute

## Timeframe Access Control Implementation

### Tier-Based Timeframe Restrictions

**FREE Tier Timeframes:** H1, H4, D1 (3 total)
**PRO Tier Timeframes:** M5, M15, M30, H1, H2, H4, H8, H12, D1 (9 total)

**PRO-only timeframes:** M5 (scalping), M15, M30, H2, H8, H12 (swing trading)

### Access Control Pattern

```typescript
// lib/tier/timeframe-access.ts
import { UserTier } from '@/types';

const FREE_TIMEFRAMES = ['H1', 'H4', 'D1'] as const;
const PRO_TIMEFRAMES = ['M5', 'M15', 'M30', 'H1', 'H2', 'H4', 'H8', 'H12', 'D1'] as const;

export function canAccessTimeframe(tier: UserTier, timeframe: string): boolean {
  if (tier === 'PRO') {
    return PRO_TIMEFRAMES.includes(timeframe as any);
  }
  return FREE_TIMEFRAMES.includes(timeframe as any);
}

export function getAccessibleTimeframes(tier: UserTier): readonly string[] {
  return tier === 'PRO' ? PRO_TIMEFRAMES : FREE_TIMEFRAMES;
}
```

### Frontend UI Pattern

```typescript
// components/chart/timeframe-selector.tsx
'use client';

import { useSession } from 'next-auth/react';
import { canAccessTimeframe } from '@/lib/tier/timeframe-access';

export function TimeframeSelector({ value, onChange }) {
  const { data: session } = useSession();
  const userTier = session?.user?.tier || 'FREE';

  const ALL_TIMEFRAMES = [
    { value: 'M5', label: '5 Minutes', proOnly: true },
    { value: 'M15', label: '15 Minutes', proOnly: true },
    { value: 'M30', label: '30 Minutes', proOnly: true },
    { value: 'H1', label: '1 Hour', proOnly: false },
    { value: 'H2', label: '2 Hours', proOnly: true },
    { value: 'H4', label: '4 Hours', proOnly: false },
    { value: 'H8', label: '8 Hours', proOnly: true },
    { value: 'H12', label: '12 Hours', proOnly: true },
    { value: 'D1', label: 'Daily', proOnly: false },
  ];

  return (
    <Select value={value} onValueChange={onChange}>
      {ALL_TIMEFRAMES.map((tf) => {
        const canAccess = canAccessTimeframe(userTier, tf.value);
        return (
          <SelectItem
            key={tf.value}
            value={tf.value}
            disabled={!canAccess}
          >
            {tf.label}
            {!canAccess && ' 🔒 PRO'}
          </SelectItem>
        );
      })}
    </Select>
  );
}
```

### Backend API Route Validation

```typescript
// app/api/indicators/[symbol]/[timeframe]/route.ts
import { getServerSession } from 'next-auth';
import { canAccessTimeframe } from '@/lib/tier/timeframe-access';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string; timeframe: string } }
) {
  const session = await getServerSession();
  const userTier = session?.user?.tier || 'FREE';

  // Validate timeframe access
  if (!canAccessTimeframe(userTier, params.timeframe)) {
    return new Response(
      JSON.stringify({
        error: `${userTier} tier cannot access ${params.timeframe} timeframe`,
        message: 'Upgrade to PRO for access to all 9 timeframes',
        accessibleTimeframes: getAccessibleTimeframes(userTier),
      }),
      { status: 403 }
    );
  }

  // Proceed with fetching indicator data...
}
```