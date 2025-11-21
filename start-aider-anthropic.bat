@echo off
REM ============================================================================
REM Start Aider with MiniMax M2 (OpenAI-Compatible API)
REM ============================================================================
REM This version uses MiniMax's OpenAI-compatible endpoint
REM Test proved this endpoint works (test-minimax-api.bat successful)
REM
REM Usage:
REM   start-aider-anthropic.bat              (starts Aider in current directory)
REM   start-aider-anthropic.bat README.md    (starts Aider with README.md loaded)
REM
REM ============================================================================

echo.
echo ========================================
echo   Starting Aider with MiniMax M2
echo   (OpenAI-Compatible Endpoint /v1)
echo ========================================
echo.

REM Set MiniMax API credentials using OpenAI-compatible endpoint
REM Replace YOUR_MINIMAX_API_KEY_HERE with your actual key from MiniMax dashboard
set OPENAI_API_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJEaGFwYW5hcnQgS2V2YWxlZSIsIlVzZXJOYW1lIjoiRGhhcGFuYXJ0IEtldmFsZWUiLCJBY2NvdW50IjoiIiwiU3ViamVjdElEIjoiMTk4NDI2MzUzNDY1NzE1MTkwMiIsIlBob25lIjoiIiwiR3JvdXBJRCI6IjE5ODQyNjM1MzQ2NTI5NTM1MDIiLCJQYWdlTmFtZSI6IiIsIk1haWwiOiJyaXBwZXI3Mzc1QGdtYWlsLmNvbSIsIkNyZWF0ZVRpbWUiOiIyMDI1LTExLTA1IDE1OjQyOjU0IiwiVG9rZW5UeXBlIjoxLCJpc3MiOiJtaW5pbWF4In0.iDz-qldYGYrqfNg8xvgi0wa8QmL3jXDj7_uAodeqweZeSUm0pK7GYJ0lD6_107mOd73qVkqzsRc-Xfw5MGxP5-AfJf9aHv3ZGl1SBWT5vMXr4K3bulWWAwcfdgNEZ46uXAtNPwQBuPmoqAlarcXOjcPQ6QjCNfos0oa7GGU71xTSkJr3jlntr8_ExFaxuAMSd2D2CwV8r_uY5EBaRddACGbOPIc-GS67ejTqQTQnvgi0sYlIymr1aMmW_VmtBntYvD7xvSIqQzKgew3R2UXnihqJXbjtM0Mv_a-f_qzaD16cFIte2DfnlxP6MtwPqmXMCKp6eu0hBSh4_AaIDIBeVA
set OPENAI_API_BASE=https://api.minimax.io/v1

REM Check if API key is set
if "%OPENAI_API_KEY%"=="YOUR_MINIMAX_API_KEY_HERE" (
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
echo   OPENAI_API_KEY: %OPENAI_API_KEY:~0,20%...
echo   OPENAI_API_BASE: %OPENAI_API_BASE%
echo.

echo Starting Aider with OpenAI-compatible model: openai/MiniMax-M2
echo.

REM Use OpenAI-compatible endpoint (verified by test-minimax-api.bat)
py -3.11 -m aider --model openai/MiniMax-M2 %*

REM If Aider exits with error, pause so user can see error message
if errorlevel 1 (
    echo.
    echo Aider exited with an error.
    echo.
    echo If this doesn't work, check:
    echo   1. OPENAI_API_KEY is correct
    echo   2. OPENAI_API_BASE is set to https://api.minimax.io/v1
    echo   3. Model string is openai/MiniMax-M2
    echo.
    pause
)
