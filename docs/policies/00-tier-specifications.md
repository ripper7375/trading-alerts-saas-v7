# Tier System Specifications

## Tier Limits (Exact Values)

### FREE Tier
- **Symbols:** 5 (BTCUSD, EURUSD, USDJPY, US30, XAUUSD)
- **Timeframes:** 3 (H1, H4, D1)
- **Chart Combinations:** 15 (5 symbols × 3 timeframes)
- **Max Alerts:** 5
- **Max Watchlist Items:** 5 (symbol+timeframe combinations)
- **API Rate Limit:** 60 requests/hour (1 per minute average)
- **Price:** $0/month

### PRO Tier
- **Symbols:** 15 (AUDJPY, AUDUSD, BTCUSD, ETHUSD, EURUSD, GBPJPY, GBPUSD, NDX100, NZDUSD, US30, USDCAD, USDCHF, USDJPY, XAGUSD, XAUUSD)
- **Timeframes:** 9 (M5, M15, M30, H1, H2, H4, H8, H12, D1)
- **Chart Combinations:** 135 (15 symbols × 9 timeframes)
- **Max Alerts:** 20
- **Max Watchlist Items:** 50 (symbol+timeframe combinations)
- **API Rate Limit:** 300 requests/hour (5 per minute average)
- **Price:** $29/month

## Symbol List (Alphabetically Ordered)

### FREE Tier Symbols (5 total)
```typescript
const FREE_SYMBOLS = [
  "BTCUSD",   // Crypto - Bitcoin
  "EURUSD",   // Forex Major - Euro/Dollar
  "USDJPY",   // Forex Major - Dollar/Yen
  "US30",     // Index - Dow Jones Industrial Average
  "XAUUSD"    // Commodities - Gold
] as const;
```

### PRO Tier Symbols (15 total)
```typescript
const PRO_SYMBOLS = [
  "AUDJPY",   // NEW - Forex Cross - Australian Dollar/Japanese Yen
  "AUDUSD",   // Forex Major - Australian Dollar/US Dollar
  "BTCUSD",   // Crypto - Bitcoin
  "ETHUSD",   // Crypto - Ethereum
  "EURUSD",   // Forex Major - Euro/Dollar
  "GBPJPY",   // NEW - Forex Cross - British Pound/Japanese Yen
  "GBPUSD",   // Forex Major - British Pound/Dollar
  "NDX100",   // Index - Nasdaq 100
  "NZDUSD",   // NEW - Forex Major - New Zealand Dollar/US Dollar
  "US30",     // Index - Dow Jones Industrial Average
  "USDCAD",   // NEW - Forex Major - US Dollar/Canadian Dollar
  "USDCHF",   // NEW - Forex Major - US Dollar/Swiss Franc
  "USDJPY",   // Forex Major - Dollar/Yen
  "XAGUSD",   // Commodities - Silver
  "XAUUSD"    // Commodities - Gold
] as const;
```

## Timeframe List

### FREE Tier Timeframes (3 total)
```typescript
const FREE_TIMEFRAMES = [
  "H1",   // 1 Hour
  "H4",   // 4 Hours
  "D1"    // Daily
] as const;
```

### PRO Tier Timeframes (9 total)
```typescript
const PRO_TIMEFRAMES = [
  "M5",   // NEW - 5 Minutes (scalping)
  "M15",  // 15 Minutes
  "M30",  // 30 Minutes
  "H1",   // 1 Hour
  "H2",   // 2 Hours
  "H4",   // 4 Hours
  "H8",   // 8 Hours
  "H12",  // NEW - 12 Hours (swing trading)
  "D1"    // Daily
] as const;
```

## Access Control Logic

### Symbol Validation
```typescript
function canAccessSymbol(tier: UserTier, symbol: string): boolean {
  if (tier === "PRO") {
    return PRO_SYMBOLS.includes(symbol);
  }
  // FREE tier
  return FREE_SYMBOLS.includes(symbol);
}

function getAccessibleSymbols(tier: UserTier): readonly string[] {
  return tier === "PRO" ? PRO_SYMBOLS : FREE_SYMBOLS;
}

function validateSymbolAccess(tier: UserTier, symbol: string): void {
  if (!canAccessSymbol(tier, symbol)) {
    throw new ForbiddenError(
      `${tier} tier cannot access ${symbol}. Available symbols: ${getAccessibleSymbols(tier).join(", ")}`
    );
  }
}
```

### Timeframe Validation
```typescript
function canAccessTimeframe(tier: UserTier, timeframe: string): boolean {
  if (tier === "PRO") {
    return PRO_TIMEFRAMES.includes(timeframe);
  }
  // FREE tier
  return FREE_TIMEFRAMES.includes(timeframe);
}

function getAccessibleTimeframes(tier: UserTier): readonly string[] {
  return tier === "PRO" ? PRO_TIMEFRAMES : FREE_TIMEFRAMES;
}

function validateTimeframeAccess(tier: UserTier, timeframe: string): void {
  if (!canAccessTimeframe(tier, timeframe)) {
    throw new ForbiddenError(
      `${tier} tier cannot access ${timeframe} timeframe. Available timeframes: ${getAccessibleTimeframes(tier).join(", ")}`
    );
  }
}
```

### Combined Symbol + Timeframe Validation
```typescript
function validateChartAccess(tier: UserTier, symbol: string, timeframe: string): void {
  // Check symbol access first
  validateSymbolAccess(tier, symbol);

  // Check timeframe access
  validateTimeframeAccess(tier, timeframe);

  // Both checks passed - access granted
}
```

## Rate Limiting Implementation

**Strategy:** Sliding window counter per user
**Reset:** Hourly rolling window
**Response:** HTTP 429 Too Many Requests
**Headers:**
- `X-RateLimit-Limit: 60` (or 300)
- `X-RateLimit-Remaining: 45`
- `X-RateLimit-Reset: 1699632000` (Unix timestamp)

**Enforcement:**
- Apply to all `/api/*` endpoints except `/api/system/health`
- Track by userId from session
- Store in Redis or PostgreSQL
- Middleware checks before route handler

**Error Response:**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 3600
}
```

## Alert & Watchlist Limits

### Alert Limits
```typescript
const ALERT_LIMITS = {
  FREE: 5,
  PRO: 20
} as const;

function canCreateAlert(tier: UserTier, currentAlertCount: number): boolean {
  return currentAlertCount < ALERT_LIMITS[tier];
}
```

### Watchlist Item Limits
```typescript
const WATCHLIST_ITEM_LIMITS = {
  FREE: 5,   // Max 5 symbol+timeframe combinations
  PRO: 50    // Max 50 symbol+timeframe combinations
} as const;

function canAddWatchlistItem(tier: UserTier, currentItemCount: number): boolean {
  return currentItemCount < WATCHLIST_ITEM_LIMITS[tier];
}
```

## Chart Combination Calculations

### FREE Tier
- 5 symbols × 3 timeframes = **15 possible chart combinations**
- Each combination is a unique symbol+timeframe pair
- Example combinations:
  - BTCUSD + H1
  - EURUSD + H4
  - XAUUSD + D1
  - etc. (15 total)

### PRO Tier
- 15 symbols × 9 timeframes = **135 possible chart combinations**
- Includes all FREE combinations plus 120 additional combinations
- PRO-only timeframes (M5, H12) accessible only to PRO users
- PRO-only symbols (AUDJPY, GBPJPY, NZDUSD, USDCAD, USDCHF, etc.) accessible only to PRO users

## Validation Rules

### Rule 1: Symbol Access
- ❌ FREE tier CANNOT access: AUDJPY, AUDUSD, ETHUSD, GBPJPY, GBPUSD, NDX100, NZDUSD, USDCAD, USDCHF, XAGUSD
- ✅ FREE tier CAN access: BTCUSD, EURUSD, USDJPY, US30, XAUUSD
- ✅ PRO tier CAN access: All 15 symbols

### Rule 2: Timeframe Access
- ❌ FREE tier CANNOT access: M5, M15, M30, H2, H8, H12
- ✅ FREE tier CAN access: H1, H4, D1
- ✅ PRO tier CAN access: All 9 timeframes

### Rule 3: Chart Access
- Chart access requires BOTH symbol AND timeframe validation
- Example: FREE user accessing XAUUSD + M5 → ❌ DENIED (M5 not allowed)
- Example: FREE user accessing AUDUSD + H1 → ❌ DENIED (AUDUSD not allowed)
- Example: FREE user accessing EURUSD + H4 → ✅ ALLOWED (both valid)
- Example: PRO user accessing GBPJPY + M5 → ✅ ALLOWED (both valid)

## Implementation Checklist

### Backend Validation (CRITICAL)
- [ ] Implement `canAccessSymbol()` in tier service
- [ ] Implement `canAccessTimeframe()` in tier service
- [ ] Implement `validateChartAccess()` in tier service
- [ ] Add middleware for `/api/indicators/{symbol}/{timeframe}` endpoint
- [ ] Add middleware for watchlist item creation
- [ ] Add middleware for alert creation
- [ ] Validate on BOTH Next.js API routes AND Flask MT5 service

### Frontend UI (User Experience)
- [ ] Disable PRO-only symbols in FREE tier dropdowns
- [ ] Disable PRO-only timeframes in FREE tier selectors
- [ ] Show "Upgrade to PRO" badge on locked options
- [ ] Display current tier limits in Settings page
- [ ] Show upgrade prompt when limit reached

### Error Messages
- [ ] Symbol access denied: "FREE tier cannot access {symbol}. Upgrade to PRO for access to all 15 symbols."
- [ ] Timeframe access denied: "FREE tier cannot access {timeframe} timeframe. Upgrade to PRO for access to all 9 timeframes."
- [ ] Alert limit reached: "FREE tier allows maximum 5 alerts. Upgrade to PRO for 20 alerts."
- [ ] Watchlist limit reached: "FREE tier allows maximum 5 watchlist items. Upgrade to PRO for 50 items."

## Testing Scenarios

### Symbol Access Tests
```typescript
// FREE tier tests
expect(canAccessSymbol("FREE", "BTCUSD")).toBe(true);
expect(canAccessSymbol("FREE", "EURUSD")).toBe(true);
expect(canAccessSymbol("FREE", "AUDJPY")).toBe(false);  // PRO-only
expect(canAccessSymbol("FREE", "GBPJPY")).toBe(false);  // PRO-only

// PRO tier tests
expect(canAccessSymbol("PRO", "BTCUSD")).toBe(true);
expect(canAccessSymbol("PRO", "AUDJPY")).toBe(true);
expect(canAccessSymbol("PRO", "GBPJPY")).toBe(true);
```

### Timeframe Access Tests
```typescript
// FREE tier tests
expect(canAccessTimeframe("FREE", "H1")).toBe(true);
expect(canAccessTimeframe("FREE", "H4")).toBe(true);
expect(canAccessTimeframe("FREE", "M5")).toBe(false);   // PRO-only
expect(canAccessTimeframe("FREE", "H12")).toBe(false);  // PRO-only

// PRO tier tests
expect(canAccessTimeframe("PRO", "H1")).toBe(true);
expect(canAccessTimeframe("PRO", "M5")).toBe(true);
expect(canAccessTimeframe("PRO", "H12")).toBe(true);
```

### Chart Access Tests
```typescript
// FREE tier valid combinations
expect(() => validateChartAccess("FREE", "EURUSD", "H1")).not.toThrow();
expect(() => validateChartAccess("FREE", "XAUUSD", "D1")).not.toThrow();

// FREE tier invalid combinations
expect(() => validateChartAccess("FREE", "AUDJPY", "H1")).toThrow("cannot access AUDJPY");
expect(() => validateChartAccess("FREE", "EURUSD", "M5")).toThrow("cannot access M5");
expect(() => validateChartAccess("FREE", "AUDJPY", "M5")).toThrow(); // Both invalid

// PRO tier all valid
expect(() => validateChartAccess("PRO", "AUDJPY", "M5")).not.toThrow();
expect(() => validateChartAccess("PRO", "GBPJPY", "H12")).not.toThrow();
```
