@echo off
REM ProBoard Quick Start Script for Windows

echo.
echo 🚀 Starting ProBoard...
echo.

echo Step 1: Installing dependencies...
call npm install
call npm --prefix backend install
echo ✅ Frontend dependencies installed
echo.

echo Step 2: Starting frontend and backend...
echo 🌐 Go to: http://localhost:54995
echo 📊 Login with: john_doe (or any username)
echo 💬 Then click 'Messages' in Quick Actions
echo.

call npm run dev
