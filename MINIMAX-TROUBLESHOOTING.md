# MiniMax M2 API Troubleshooting Guide

## Issue: Connection Errors with Aider + MiniMax M2

**Date Resolved**: 2025-11-10
**Status**: ✅ RESOLVED

---

## Problem Description

When running Aider with MiniMax M2, users encountered persistent connection errors:

```
litellm.InternalServerError: InternalServerError: OpenAIException - Connection error.
The API provider's servers are down or overloaded.
Retrying in 0.2 seconds...
```

The error kept retrying indefinitely and Aider never connected.

---

## Root Causes Identified

### 1. ❌ Free Trial Expired (November 7, 2025)

**Problem**: MiniMax free trial ended on November 7, 2025. Any requests after this date were rejected.

**Solution**: Add credits to MiniMax account at https://platform.minimax.io
- Minimum: $25 (recommended starting amount)
- Pricing: $0.30/M input tokens, $1.20/M output tokens

**How to Verify**:
- Log in to https://platform.minimax.io
- Check "Balance" section
- Should show current balance > $0

---

### 2. ❌ Missing `--model` Flag in Aider Command

**Problem**: Original `start-aider.bat` didn't specify which model to use:
```bat
py -3.11 -m aider %*
```

Without the `--model` flag, LiteLLM couldn't properly route requests to MiniMax API.

**Solution**: Explicitly specify the model:
```bat
py -3.11 -m aider --model anthropic/MiniMax-M2 %*
```

---

### 3. ❌ OpenAI-Compatible Endpoint Had Routing Issues

**Problem**: Using Anthropic-compatible endpoint caused LiteLLM routing failures:
```bat
set ANTHROPIC_API_KEY=...
set ANTHROPIC_API_BASE=https://api.minimax.io/v1
py -3.11 -m aider --model anthropic/MiniMax-M2
```

This configuration failed even with explicit `--model` flag.

**Root Cause**: LiteLLM's OpenAI provider routing doesn't work reliably with MiniMax's Anthropic-compatible endpoint.

---

### 4. ✅ Anthropic-Compatible Endpoint Works Perfectly

**Solution**: MiniMax provides an Anthropic-compatible API that works reliably with LiteLLM:

```bat
set ANTHROPIC_API_KEY=your_minimax_api_key_here
set ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic
py -3.11 -m aider --model anthropic/MiniMax-M2
```

**Why This Works**:
- MiniMax officially recommends using their Anthropic-compatible API
- LiteLLM's Anthropic provider routing is more reliable
- MiniMax's Anthropic endpoint is designed to work with official Anthropic SDKs

---

## Solution: Use start-aider-anthropic.bat

### Step 1: Edit the Script

Open `start-aider-anthropic.bat` and set your API key on line 21:

```bat
set ANTHROPIC_API_KEY=your_actual_minimax_api_key_here
```

### Step 2: Run Aider

```cmd
start-aider-anthropic.bat
```

### Step 3: Verify It Works

You should see:
```
========================================
  Starting Aider with MiniMax M2
  (Anthropic-Compatible Endpoint)
========================================

Environment variables set:
  ANTHROPIC_API_KEY: eyJhbGciOiJSUzI1NiIs...
  ANTHROPIC_BASE_URL: https://api.minimax.io/anthropic

Starting Aider with Anthropic-compatible model: anthropic/MiniMax-M2
```

Aider should connect successfully without retrying or connection errors.

---

## Testing & Verification

### Test 1: Direct API Connection

Run the test script to verify MiniMax API is accessible:

```cmd
test-minimax-api.bat
```

**Expected Result**:
```
✅ SUCCESS! API is working!

Response from MiniMax M2:
------------------------------------------------------------
API test successful
------------------------------------------------------------

Token Usage:
  Input tokens:  51
  Output tokens: 50
  Total tokens:  101

✅ Your MiniMax API is ready for Aider!
```

**What This Tests**:
- API key is valid ✓
- Account has credits ✓
- Network can reach MiniMax servers ✓
- MiniMax API is responding ✓

### Test 2: Aider Connection

Start Aider and ask a simple question:

```cmd
start-aider-anthropic.bat
```

Then in Aider:
```
What are the AUTO-APPROVE conditions according to our approval policies?
```

**Expected Result**:
- No connection errors
- MiniMax M2 responds with thinking process and answer
- Token usage displayed at end

---

## Files Reference

### ✅ Working Scripts

| File | Purpose | Status |
|------|---------|--------|
| `start-aider-anthropic.bat` | Anthropic-compatible endpoint (recommended) | ✅ WORKS |
| `test-minimax-api.py` | Direct API connectivity test | ✅ WORKS |
| `test-minimax-api.bat` | Windows wrapper for test script | ✅ WORKS |

### ❌ Non-Working Scripts (Keep for Reference)

| File | Purpose | Status |
|------|---------|--------|
| `start-aider.bat` | Original script (no --model flag) | ❌ FAILS |
| `start-aider-fixed.bat` | Anthropic-compatible endpoint attempt | ❌ FAILS |

---

## Common Issues & Solutions

### Issue: "ERROR: ANTHROPIC_API_KEY not set in environment"

**Cause**: API key not configured in the script.

**Solution**: Edit the script and set your actual API key on line 21.

---

### Issue: "401 Unauthorized"

**Cause**: Invalid or expired API key.

**Solution**:
1. Log in to https://platform.minimax.io
2. Go to API Keys section
3. Generate a new API key
4. Update your script with the new key

---

### Issue: "403 Forbidden"

**Cause**: Account has $0 balance.

**Solution**:
1. Log in to https://platform.minimax.io
2. Go to Balance/Billing section
3. Add credits (minimum $25 recommended)
4. Wait 2-3 minutes for credits to activate
5. Try again

---

### Issue: "Connection error" or "Cannot reach api.minimax.io"

**Possible Causes**:
- No internet connection
- Firewall blocking api.minimax.io
- VPN interfering with connection
- MiniMax servers temporarily down

**Solution**:
1. Check internet connection
2. Disable VPN temporarily and test
3. Check firewall settings (allow api.minimax.io)
4. Check MiniMax status page (if available)
5. Try again in 5-10 minutes

---

### Issue: Test script works, but Aider fails

**Cause**: LiteLLM configuration issue (this was the main issue we solved).

**Solution**: Use `start-aider-anthropic.bat` instead of other scripts.

---

## Cost Estimation

### Token Usage Example (from testing):
- Input tokens: 96,000 (~96k)
- Output tokens: 1,100 (~1.1k)
- **Cost**: (96,000 × $0.30/M) + (1,100 × $1.20/M) = $0.029 + $0.001 = **$0.03 per query**

### How Long Will $25 Last?

**Conservative estimate** (assuming average queries):
- $25 ÷ $0.03 per query = **~833 queries**

**Light usage** (10 queries/day):
- 833 queries ÷ 10/day = **~83 days** (~2.5 months)

**Heavy usage** (50 queries/day):
- 833 queries ÷ 50/day = **~16 days**

---

## Technical Details

### Working Configuration

**Environment Variables**:
```bat
ANTHROPIC_API_KEY=your_minimax_api_key_here
ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic
```

**Aider Command**:
```bat
py -3.11 -m aider --model anthropic/MiniMax-M2
```

**Why This Works**:
1. MiniMax provides Anthropic-compatible API at `/anthropic` endpoint
2. LiteLLM recognizes `anthropic/` prefix and routes through Anthropic provider
3. LiteLLM sends requests to `ANTHROPIC_BASE_URL` instead of default Anthropic URL
4. MiniMax's Anthropic endpoint handles the request and returns response in Anthropic format
5. LiteLLM converts response back to Aider's expected format

### API Endpoints

| Endpoint Type | URL | Works with Aider? |
|--------------|-----|-------------------|
| Anthropic-compatible | `https://api.minimax.io/v1` | ❌ Routing issues |
| Anthropic-compatible | `https://api.minimax.io/anthropic` | ✅ Works perfectly |

---

## References

- **MiniMax Dashboard**: https://platform.minimax.io
- **MiniMax API Docs**: https://platform.minimax.io/docs
- **LiteLLM Docs**: https://docs.litellm.ai
- **Aider Docs**: https://aider.chat/docs

---

## Changelog

### 2025-11-10
- ✅ Identified free trial expiration as primary issue
- ✅ Added $25 credits to account
- ✅ Identified missing `--model` flag in original script
- ✅ Tested Anthropic-compatible endpoint (failed)
- ✅ Tested Anthropic-compatible endpoint (success!)
- ✅ Created `start-aider-anthropic.bat` as recommended solution
- ✅ Created test scripts for API connectivity verification
- ✅ Documented troubleshooting process

---

## Contact & Support

For MiniMax-specific issues:
- MiniMax Support: https://platform.minimax.io/support (check their website for support options)

For Aider-specific issues:
- Aider GitHub: https://github.com/Aider-AI/aider

For LiteLLM issues:
- LiteLLM GitHub: https://github.com/BerriAI/litellm

---

**Last Updated**: 2025-11-10
**Status**: ✅ Issue Resolved - Use `start-aider-anthropic.bat`
