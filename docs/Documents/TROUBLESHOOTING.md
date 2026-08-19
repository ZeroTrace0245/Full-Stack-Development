# 🆘 Troubleshooting - Common Errors

## Error: "Cannot find module 'socket.io-client'"
```bash
# Solution:
npm install socket.io-client
npm install axios
npm run dev
```

## Error in Chat.jsx
```bash
# Make sure these files exist:
✓ src/pages/Chat.jsx
✓ src/pages/Chat.module.css
✓ src/services/socketService.js

# If missing, they were created automatically
```

## Error: "Cannot find module '../services/socketService'"
```bash
# Create services folder if missing:
mkdir src/services

# Make sure socketService.js is there:
src/services/socketService.js (already created)
```

## White screen on Chat page?
```javascript
// Check browser console (F12)
// Look for error messages

// Most common:
1. socketService not initialized
2. CSS not loading
3. Component rendering error

// Fix:
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server (Ctrl+C then npm run dev)
```

## Messages not appearing?
```
Frontend side:
  1. Check browser DevTools Console
  2. No WebSocket connection needed for MVP
  3. Messages stored in component state

Backend side (when integrated):
  1. Backend must be running on port 5000
  2. Check backend logs for errors
  3. Verify database connection
```

## Build command errors?
```bash
# Try:
npm install
npm run dev

# Or specific commands:
npm run build    # Check build errors
npm run preview  # Preview production build
```

## CSS/Styles not showing?
```bash
# Clear cache and restart:
rm -rf node_modules/.vite
npm run dev

# Or in Windows:
rmdir /s /q node_modules\.vite
npm run dev
```

## Port 5173 already in use?
```bash
# Vite will auto-use next available port
# Check terminal output for actual port

# Or manually kill process:
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5173
kill -9 <PID>
```

## Need to see what was created?
```bash
# View project structure:
cat PROJECT_STRUCTURE.md

# View messaging guide:
cat MESSAGING_GUIDE.md

# View testing guide:
cat TESTING_MESSAGING.md
```

## Start fresh?
```bash
# Clean install:
rm package-lock.json
rm -rf node_modules
npm install
npm run dev

# Windows:
del package-lock.json
rmdir /s /q node_modules
npm install
npm run dev
```

## Everything seems broken?
```bash
# Full reset:
1. npm install
2. npm run dev
3. Open http://localhost:5173
4. Login: john_doe
5. Click Messages button
6. If still broken, check browser console (F12)
```

---

**Can't find what you need?** 

Check these files:
- MESSAGING_GUIDE.md - How to use
- TESTING_MESSAGING.md - Testing procedures
- PROJECT_STRUCTURE.md - File organization
