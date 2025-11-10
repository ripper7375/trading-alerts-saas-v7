@echo off
REM ============================================================================
REM Test MiniMax M2 API Connection
REM ============================================================================
REM This script verifies that your MiniMax API key and endpoint are working
REM Run this BEFORE running Aider to ensure connectivity
REM ============================================================================

echo.
echo ========================================
echo   Testing MiniMax M2 API Connection
echo ========================================
echo.

REM Check if start-aider.bat exists to get API key from there
if exist start-aider.bat (
    echo Reading API key from start-aider.bat...
    REM User needs to manually set this in their start-aider.bat
    REM We'll prompt them to set it in environment
)

REM Prompt user to set API key for this test
echo.
echo IMPORTANT: Make sure you've set your API key in start-aider.bat
echo.
set /p "CONTINUE=Press Enter to continue, or Ctrl+C to cancel..."

REM Run the Python test script
py -3.11 -m pip install --quiet requests

echo.
py -3.11 test-minimax-api.py

REM Pause so user can read results
echo.
pause
