@echo off
REM ============================================================================
REM Start Aider with MiniMax M2
REM ============================================================================
REM This batch file automatically sets environment variables and starts Aider
REM
REM Usage:
REM   start-aider.bat              (starts Aider in current directory)
REM   start-aider.bat README.md    (starts Aider with README.md loaded)
REM
REM ============================================================================

echo.
echo ========================================
echo   Starting Aider with MiniMax M2
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
    echo With your actual API key from: https://platform.minimaxi.com
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
