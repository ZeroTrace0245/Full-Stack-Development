#!/bin/bash

# ProBoard Quick Start Script

echo "🚀 Starting ProBoard..."
echo ""

echo "Step 1: Installing frontend dependencies..."
npm install
echo "✅ Frontend dependencies installed"
echo ""

echo "Step 2: Starting dev server..."
echo "🌐 Go to: http://localhost:5173"
echo "📊 Login with: john_doe (or any username)"
echo "💬 Then click 'Messages' in Quick Actions"
echo ""

npm run dev
