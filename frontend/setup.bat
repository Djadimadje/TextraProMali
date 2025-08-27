@echo off
echo ========================================
echo   TextPro AI Frontend - Quick Setup
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
echo Installing dependencies...
echo This may take a few minutes...
npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
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
