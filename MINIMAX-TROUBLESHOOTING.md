# MiniMax M2 with Aider - Complete Troubleshooting Guide

**Project:** Trading Alerts SaaS V7  
**Date:** 2025-11-20  
**Status:** ✅ WORKING SOLUTION VERIFIED  
**Model:** MiniMax M2 via OpenAI-compatible API endpoint

---

## 🎯 Executive Summary

This document chronicles the complete troubleshooting journey to successfully integrate MiniMax M2 with Aider for autonomous code generation. After extensive testing, we discovered the **correct configuration** that works reliably.

**Final Result:**
- ✅ Model string: `openai/MiniMax-M2`
- ✅ API endpoint: `https://api.minimax.io/v1`
- ✅ API variables: `OPENAI_API_KEY` and `OPENAI_API_BASE`
- ✅ Context management: 129k base load + 75k rotation budget

---

## 📊 Problem Statement

**Initial Challenge:**  
Aider configuration used `anthropic/MiniMax-M2` model string with Anthropic-style API variables, but this resulted in errors when attempting to start Aider.

**Root Causes:**
1. Incorrect model provider prefix
2. Wrong API variable names
3. Context window exceeded (281k tokens > 204k limit)
4. Misunderstanding of MiniMax API compatibility

---

## 🧪 Trial and Error Process

### **Trial 1: anthropic/MiniMax-M2** ❌

**Configuration:**
```yaml
model: anthropic/MiniMax-M2
```

**Environment:**
```bash
ANTHROPIC_API_KEY=eyJhbGci...
```

**Result:**  
❌ **FAILED** - 404 Error: Model not found

**Why it failed:**  
MiniMax does not support Anthropic API format. The `/v1/messages` endpoint doesn't exist on MiniMax servers.

---

### **Trial 2: minimax/MiniMax-M2** ❌

**Configuration:**
```yaml
model: minimax/MiniMax-M2
```

**Environment:**
```bash
OPENAI_API_KEY=eyJhbGci...
OPENAI_API_BASE=https://api.minimax.io/v1
```

**Result:**  
❌ **FAILED** - LLM Provider NOT provided error

**Error Message:**
```
LLM Provider NOT provided. Pass in the LLM provider you are trying to call.
You passed model=minimax/MiniMax-M2
```

**Why it failed:**  
LiteLLM (used by Aider) does not recognize `minimax/` as a valid provider prefix.

---

### **Trial 3: MiniMax-M2 (no prefix)** ❌

**Configuration:**
```yaml
model: MiniMax-M2
```

**Environment:**
```bash
OPENAI_API_KEY=eyJhbGci...
OPENAI_API_BASE=https://api.minimax.io/v1
```

**Result:**  
❌ **FAILED** - LLM Provider NOT provided error

**Why it failed:**  
Without a provider prefix, LiteLLM doesn't know which API format to use.

---

### **Trial 4: openai/MiniMax-M2** ✅

**Configuration:**
```yaml
model: openai/MiniMax-M2
```

**Environment:**
```bash
OPENAI_API_KEY=eyJhbGci...
OPENAI_API_BASE=https://api.minimax.io/v1
```

**Result:**  
✅ **SUCCESS** - Aider started successfully!

**But then hit:** Context window exceeded (2013 tokens in initial test, but full config had 281k)

**Why it worked:**  
MiniMax's API is OpenAI-compatible (uses `/v1/chat/completions` endpoint). Setting `OPENAI_API_BASE` redirects OpenAI SDK to MiniMax servers.

---

### **Trial 5: Reducing Context Window** ✅

**Problem:**  
Even with correct model string, Aider failed due to excessive context (281k tokens > 204k limit).

**Solution:**  
1. Compress 6 largest policy files (43% reduction: 136k → 77k tokens)
2. Implement rotation strategy (load files dynamically with `/add` and `/drop`)
3. Reduce `map-tokens` from 2048 → 512

**Result:**  
✅ **WORKING** - Base load: 129k tokens, 75k available for rotation

---

## ✅ Final Working Configuration

### **1. Environment Variables (.env)**

```bash
# MiniMax M2 API Configuration
OPENAI_API_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJEaGFwYW5hcnQgS2V2YWxlZSIsIlVzZXJOYW1lIjoiRGhhcGFuYXJ0IEtldmFsZWUiLCJBY2NvdW50IjoiIiwiU3ViamVjdElEIjoiMTk4NDI2MzUzNDY1NzE1MTkwMiIsIlBob25lIjoiIiwiR3JvdXBJRCI6IjE5ODQyNjM1MzQ2NTI5NTM1MDIiLCJQYWdlTmFtZSI6IiIsIk1haWwiOiJyaXBwZXI3Mzc1QGdtYWlsLmNvbSIsIkNyZWF0ZVRpbWUiOiIyMDI1LTExLTA1IDE1OjQyOjU0IiwiVG9rZW5UeXBlIjoxLCJpc3MiOiJtaW5pbWF4In0.iDz-qldYGYrqfNg8xvgi0wa8QmL3jXDj7_uAodeqweZeSUm0pK7GYJ0lD6_107mOd73qVkqzsRc-Xfw5MGxP5-AfJf9aHv3ZGl1SBWT5vMXr4K3bulWWAwcfdgNEZ46uXAtNPwQBuPmoqAlarcXOjcPQ6QjCNfos0oa7GGU71xTSkJr3jlntr8_ExFaxuAMSd2D2CwV8r_uY5EBaRddACGbOPIc-GS67ejTqQTQnvgi0sYlIymr1aMmW_VmtBntYvD7xvSIqQzKgew3R2UXnihqJXbjtM0Mv_a-f_qzaD16cFIte2DfnlxP6MtwPqmXMCKp6eu0hBSh4_AaIDIBeVA

# MiniMax API endpoint (OpenAI-compatible)
OPENAI_API_BASE=https://api.minimax.io/v1
```

**Key Points:**
- ✅ Use `OPENAI_API_KEY` (NOT `ANTHROPIC_API_KEY`)
- ✅ Use `OPENAI_API_BASE` (NOT `ANTHROPIC_API_BASE`)
- ✅ Endpoint is `/v1` (OpenAI-compatible, NOT `/v1/messages` Anthropic format)

---

### **2. Aider Configuration (.aider.conf.yml)**

```yaml
# Model Configuration
model: openai/MiniMax-M2
editor-model: openai/MiniMax-M2
weak-model: openai/MiniMax-M2

# Reduce map tokens to save context
map-tokens: 512

# Environment file
env-file: .env

# Load compressed policy files (base load: ~129k tokens)
read:
  - docs/policies/01-approval-policies-compress.md        # 9,491 tokens
  - docs/policies/02-quality-standards.md                 # 9,818 tokens
  - docs/policies/03-architecture-rules-compress.md       # 11,326 tokens
  - docs/policies/04-escalation-triggers-compress.md      # 7,430 tokens
  - docs/policies/05-coding-patterns-compress.md          # 20,999 tokens
  - docs/policies/06-aider-instructions.md                # 10,966 tokens
  - docs/policies/07-dlocal-integration-rules-compress.md # 6,870 tokens
  - docs/policies/00-tier-specifications.md               # 2,479 tokens
  - docs/trading_alerts_openapi_compress.yaml             # 21,690 tokens
  - ARCHITECTURE.md                                        # ~10,000 tokens
  - README.md                                              # ~5,000 tokens
  - docs/v5-structure-division.md                          # ~10,000 tokens
  - docs/build-orders/README.md                            # ~3,000 tokens
  - PROGRESS.md

# Total base load: ~129,000 tokens
# Available for rotation: ~75,000 tokens
```

**Critical Changes:**
- ✅ Model prefix: `openai/` (NOT `anthropic/` or `minimax/`)
- ✅ Map tokens: `512` (reduced from 2048)
- ✅ Compressed files: Use `-compress.md` versions

---

### **3. Batch Script (start-aider-anthropic.bat)**

**Line 49 MUST be:**
```bat
py -3.11 -m aider --model openai/MiniMax-M2 %*
```

**NOT:**
```bat
py -3.11 -m aider --model minimax/MiniMax-M2 %*  ❌ WRONG
py -3.11 -m aider --model anthropic/MiniMax-M2 %* ❌ WRONG
```

**Full working batch file:**
```bat
@echo off
set OPENAI_API_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
set OPENAI_API_BASE=https://api.minimax.io/v1

echo Starting Aider with OpenAI-compatible model: openai/MiniMax-M2
py -3.11 -m aider --model openai/MiniMax-M2 %*
```

---

## 📊 Context Window Management

### **MiniMax M2 Specifications**

| Specification | Value |
|--------------|-------|
| **Total Context Window** | 204,800 tokens |
| **Base Load** | ~129,000 tokens (63%) |
| **Available for Rotation** | ~75,000 tokens (37%) |
| **System Overhead** | ~5,000 tokens |
| **Repo-map** | 512 tokens |
| **Safety Margin** | ~10,000 tokens |

### **Token Budget Breakdown**

```
Total Context: 204,800 tokens
├── System Overhead: 5,000 tokens
├── Repo-map: 512 tokens
├── Compressed Policies: 79,000 tokens
├── Compressed OpenAPI: 22,000 tokens
├── Architecture Docs: 28,000 tokens
├── Conversation Buffer: Variable
└── AVAILABLE FOR ROTATION: ~75,000 tokens
```

---

## 🗜️ File Compression Results

Conservative compression was performed on the 6 largest files to reduce token usage while preserving quality.

### **Compression Summary**

| File | Original | Compressed | Saved | Reduction |
|------|----------|-----------|-------|-----------|
| 01-approval-policies.md | 18,529 | 9,491 | 9,038 | 49% |
| 03-architecture-rules.md | 29,324 | 11,326 | 17,998 | 61% |
| 04-escalation-triggers.md | 22,484 | 7,430 | 15,054 | 67% |
| 05-coding-patterns.md | 26,686 | 20,999 | 5,687 | 21% |
| 07-dlocal-integration-rules.md | 15,296 | 6,870 | 8,426 | 55% |
| trading_alerts_openapi.yaml | 24,060 | 21,690 | 2,370 | 10% |
| **TOTAL** | **136,379** | **77,806** | **58,573** | **43%** |

**Compression Strategy:**
- ✅ Remove redundant explanations
- ✅ Consolidate similar examples
- ✅ Use tables instead of prose
- ✅ Remove meta-commentary
- ❌ **Preserve ALL** code examples
- ❌ **Preserve ALL** technical specifications
- ❌ **Preserve ALL** decision criteria