@echo off
REM ============================================================================
REM Start Aider with MiniMax M2 (Anthropic-Compatible API)
REM ============================================================================
REM This version uses MiniMax's Anthropic-compatible endpoint
REM MiniMax recommends using this with official Anthropic SDKs
REM
REM Usage:
REM   start-aider-anthropic.bat              (starts Aider in current directory)
REM   start-aider-anthropic.bat README.md    (starts Aider with README.md loaded)
REM
REM ============================================================================

echo.
echo ========================================
echo   Starting Aider with MiniMax M2
echo   (Anthropic-Compatible Endpoint)
echo ========================================
echo.

REM Set MiniMax API credentials using Anthropic-compatible endpoint
REM Replace YOUR_MINIMAX_API_KEY_HERE with your actual key from MiniMax dashboard
set ANTHROPIC_API_KEY=YOUR_MINIMAX_API_KEY_HERE
set ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic

REM Check if API key is set
if "%ANTHROPIC_API_KEY%"=="YOUR_MINIMAX_API_KEY_HERE" (
    echo ERROR: Please edit start-aider-anthropic.bat and add your MiniMax API key!
    echo.
    echo Open start-aider-anthropic.bat in a text editor and replace:
    echo   YOUR_MINIMAX_API_KEY_HERE
    echo.
    echo With your actual API key from: https://platform.minimax.io
    echo.
    pause
    exit /b 1
)

echo Environment variables set:
echo   ANTHROPIC_API_KEY: %ANTHROPIC_API_KEY:~0,20%...
echo   ANTHROPIC_BASE_URL: %ANTHROPIC_BASE_URL%
echo.

echo Starting Aider with Anthropic-compatible model: anthropic/MiniMax-M2
echo.

REM Use Anthropic-compatible endpoint (recommended by MiniMax)
py -3.11 -m aider --model anthropic/MiniMax-M2 %*

REM If Aider exits with error, pause so user can see error message
if errorlevel 1 (
    echo.
    echo Aider exited with an error.
    echo.
    echo If this doesn't work, try the OpenAI-compatible version:
    echo   start-aider-fixed.bat
    echo.
    pause
)
