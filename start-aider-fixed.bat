@echo off
REM ============================================================================
REM Start Aider with MiniMax M2 (FIXED VERSION)
REM ============================================================================
REM This batch file automatically sets environment variables and starts Aider
REM with explicit MiniMax M2 model configuration
REM
REM Usage:
REM   start-aider-fixed.bat              (starts Aider in current directory)
REM   start-aider-fixed.bat README.md    (starts Aider with README.md loaded)
REM
REM ============================================================================

echo.
echo ========================================
echo   Starting Aider with MiniMax M2
echo   (FIXED - Explicit Model Config)
echo ========================================
echo.

REM Set MiniMax API credentials
REM Replace YOUR_MINIMAX_API_KEY_HERE with your actual key from MiniMax dashboard
set OPENAI_API_KEY=YOUR_MINIMAX_API_KEY_HERE
set OPENAI_API_BASE=https://api.minimax.io/v1

REM Check if API key is set
if "%OPENAI_API_KEY%"=="YOUR_MINIMAX_API_KEY_HERE" (
    echo ERROR: Please edit start-aider-fixed.bat and add your MiniMax API key!
    echo.
    echo Open start-aider-fixed.bat in a text editor and replace:
    echo   YOUR_MINIMAX_API_KEY_HERE
    echo.
    echo With your actual API key from: https://platform.minimax.io
    echo.
    pause
    exit /b 1
)

echo Environment variables set:
echo   OPENAI_API_KEY: %OPENAI_API_KEY:~0,20%...
echo   OPENAI_API_BASE: %OPENAI_API_BASE%
echo.

echo Starting Aider with explicit model: openai/MiniMax-M2
echo.

REM FIXED: Explicitly specify the model with --model flag
REM This tells LiteLLM exactly which provider and model to use
py -3.11 -m aider --model openai/MiniMax-M2 %*

REM If Aider exits with error, pause so user can see error message
if errorlevel 1 (
    echo.
    echo Aider exited with an error.
    echo.
    echo If you still get connection errors, try the alternative version:
    echo   start-aider-anthropic.bat
    echo.
    pause
)
