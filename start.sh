#!/bin/bash

# ProBoard Quick Start Script

echo "🚀 Starting ProBoard..."
echo ""

echo "Step 1: Installing dependencies..."
npm install
npm --prefix backend install
echo "✅ Frontend dependencies installed"
echo ""

echo "Step 2: Starting frontend and backend..."
echo "🌐 Go to: http://localhost:54995"
echo "📊 Login with: john_doe (or any username)"
echo "💬 Then click 'Messages' in Quick Actions"
echo ""

npm run dev
