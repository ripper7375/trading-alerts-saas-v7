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
typescript
const REFRESH_INTERVALS = {
  M15: 60000,    // 1 minute (60s)
  M30: 60000,    // 1 minute
  H1:  120000,   // 2 minutes
  H2:  120000,   // 2 minutes
  H4:  300000,   // 5 minutes
  H8:  300000,   // 5 minutes
  D1:  600000,   // 10 minutes
} as const;
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