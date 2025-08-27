@echo off
echo ========================================
echo   TextPro AI Frontend - One-Click Setup
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version

echo.
echo Installing dependencies from requirements.txt...
echo This may take a few minutes...

REM Extract package names from requirements.txt (excluding comments and empty lines)
powershell -Command "(Get-Content requirements.txt | Where-Object { $_ -notmatch '^#' -and $_ -notmatch '^\s*$' -and $_ -notmatch 'Install command' }) -join ' ' | ForEach-Object { npm install $_.Split(' ') }"

if %errorlevel% neq 0 (
    echo.
    echo Some packages from requirements.txt failed. Trying package.json fallback...
    npm install
)

echo.
echo ========================================
echo   Setup Complete! 
echo ========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Then open your browser to: http://localhost:3000
echo.
pause
