# Tier System Specifications

## Tier Limits (Exact Values)

### FREE Tier
- **Symbols:** 1 (XAUUSD only)
- **Timeframes:** 7 (M15, M30, H1, H2, H4, H8, D1)
- **Max Alerts:** 5
- **Max Watchlist Items:** 5
- **API Rate Limit:** 60 requests/hour (1 per minute average)
- **Price:** $0/month

### PRO Tier
- **Symbols:** 10 (AUDUSD, BTCUSD, ETHUSD, EURUSD, GBPUSD, NDX100, US30, USDJPY, XAGUSD, XAUUSD)
- **Timeframes:** 7 (M15, M30, H1, H2, H4, H8, D1)
- **Max Alerts:** 20
- **Max Watchlist Items:** 50
- **API Rate Limit:** 300 requests/hour (5 per minute average)
- **Price:** $29/month

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
json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 3600
}