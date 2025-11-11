@echo off
REM ============================================================================
REM Start Aider with MiniMax M2
REM ============================================================================
REM
REM ⚠️  WARNING: THIS SCRIPT DOES NOT WORK! ⚠️
REM
REM This is a legacy/template script that uses the OpenAI-compatible endpoint,
REM which does NOT work reliably with MiniMax M2 and LiteLLM.
REM
REM ✅ INSTEAD, USE: start-aider-anthropic.bat
REM
REM The Anthropic-compatible endpoint is the only configuration that works
REM reliably with MiniMax M2. See MINIMAX-TROUBLESHOOTING.md for details.
REM
REM This file is kept as a template/reference only.
REM ============================================================================

echo.
echo ========================================
echo   ⚠️  WARNING - THIS SCRIPT DOES NOT WORK
echo ========================================
echo.
echo This script uses an outdated configuration that
echo does not work with MiniMax M2.
echo.
echo ✅ Please use: start-aider-anthropic.bat
echo.
echo Press Ctrl+C to cancel, or Enter to continue anyway
echo (not recommended - will likely fail with connection errors)
echo.
pause
echo.
echo ========================================
echo   Starting Aider with MiniMax M2
echo   (OpenAI-compatible - WILL LIKELY FAIL)
echo ========================================
echo.

REM Set MiniMax API credentials
REM Replace YOUR_MINIMAX_API_KEY_HERE with your actual key from MiniMax dashboard
set OPENAI_API_KEY=YOUR_MINIMAX_API_KEY_HERE
set OPENAI_API_BASE=https://api.minimax.io/v1

REM Check if API key is set
if "%OPENAI_API_KEY%"=="YOUR_MINIMAX_API_KEY_HERE" (
    echo ERROR: Please edit start-aider.bat and add your MiniMax API key!
    echo.
    echo Open start-aider.bat in a text editor and replace:
    echo   YOUR_MINIMAX_API_KEY_HERE
    echo.
    echo With your actual API key from: https://platform.minimaxi.io
    echo.
    pause
    exit /b 1
)

echo Environment variables set:
echo   OPENAI_API_KEY: %OPENAI_API_KEY:~0,20%...
echo   OPENAI_API_BASE: %OPENAI_API_BASE%
echo.

REM Start Aider with all arguments passed to this script
py -3.11 -m aider %*

REM If Aider exits with error, pause so user can see error message
if errorlevel 1 (
    echo.
    echo Aider exited with an error.
    pause
)
