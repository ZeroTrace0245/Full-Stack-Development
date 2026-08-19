# 🚀 ProBoard Quick Start Checklist

## Pre-requisites
- [ ] Node.js 16+ installed
- [ ] SQL Server 2019+ running
- [ ] Git (optional, for version control)
- [ ] 30 minutes to set everything up

## Backend Setup (15 min)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```
✅ Expected: No errors, all packages installed

### Step 2: Create SQL Server Database
Option A (GUI - SQL Server Management Studio):
- [ ] Open SSMS
- [ ] Right-click Databases → New Database
- [ ] Name: `ProBoard` → OK

Option B (Command Line):
```bash
sqlcmd -S localhost -U sa -P YourPassword123! -Q "CREATE DATABASE ProBoard"
```

### Step 3: Load Database Schema
Option A (GUI):
- [ ] In SSMS, right-click ProBoard → New Query
- [ ] Copy-paste contents from `backend/db/schema.sql`
- [ ] Execute (F5)
- [ ] Verify: Schema created successfully message

Option B (Command Line):
```bash
sqlcmd -S localhost -U sa -P YourPassword123! -d ProBoard -i backend/db/schema.sql
```

### Step 4: Configure Backend Environment
```bash
# Create .env file
cp .env.example .env

# Edit .env with your SQL Server credentials
# Key fields to update:
# - DB_SERVER: localhost (or your SQL Server hostname)
# - DB_USER: sa (or your SQL Server user)
# - DB_PASSWORD: your actual SQL Server password
```

### Step 5: Start Backend Server
```bash
npm start
```
✅ Expected output:
```
✅ Connected to SQL Server successfully
🚀 ProBoard Backend Server running on port 5000
📡 Socket.IO listening for real-time events
```

---

## Frontend Setup (5 min)

### Step 1: Return to Root Directory
```bash
cd ..  # back to full-stack root
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```
✅ Expected: No errors, socket.io-client and axios added

### Step 3: Start Frontend Dev Server
```bash
npm run dev
```
✅ Expected output:
```
Local:   http://localhost:5173/
```

---

## Test the Integration (10 min)

### Step 1: Open in Browser
Go to: `http://localhost:5173`

### Step 2: Login
- Username: `john_doe`
- Password: (any password, mocked for now)
- Click "Login"

### Step 3: Test Board Features
- [ ] Create task: Click "+" in any column
- [ ] Fill form and submit
- [ ] Check if task appears in database (refresh page)
- [ ] Drag task between columns
- [ ] Check Activity Feed for updates

### Step 4: Test Messaging
- [ ] Look for "💬 Messages" panel (or integrate MessagingPanel in Board)
- [ ] Click "Team Chat" tab
- [ ] Type a message and send
- [ ] Verify message appears
- [ ] Click "Direct Messages" tab
- [ ] Select a team member
- [ ] Send a direct message

### Step 5: Check Admin Features
- [ ] Logout
- [ ] Login as `admin` (any password)
- [ ] Go to Dashboard
- [ ] Click "Reports" button
- [ ] Should see analytics, leaderboard, bottlenecks

---

## Verification Checklist

### Backend Health
```bash
# In a new terminal:
curl http://localhost:5000/api/health
```
✅ Expected response:
```json
{"status":"✅ ProBoard Backend is running","timestamp":"..."}
```

### Database Connection
- [ ] Backend console shows: `✅ Connected to SQL Server successfully`
- [ ] No database connection errors

### Frontend Connectivity
- [ ] No CORS errors in browser console
- [ ] No WebSocket connection errors
- [ ] Messages appear in real-time (check browser console for "✅ Socket connected")

### API Communication
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Perform actions (login, create task)
- [ ] Should see requests to `http://localhost:5000/api/...`
- [ ] Status should be 200 (success) or 401 (auth errors)

### WebSocket Connection
- [ ] Open browser DevTools Console
- [ ] Should NOT see "Socket connection timeout" errors
- [ ] Should see "✅ Socket connected" messages
- [ ] WebSocket frame tab shows events

---

## Troubleshooting Checklist

### Issue: "Cannot connect to SQL Server"
- [ ] SQL Server service is running (Services app on Windows)
- [ ] Server name in .env matches your SQL Server instance
- [ ] Credentials (sa user and password) are correct
- [ ] Firewall isn't blocking port 1433

**Solution:**
```bash
# Test connection
sqlcmd -S localhost -U sa -P YourPassword123! -Q "SELECT @@VERSION"
```

### Issue: "Backend server won't start"
- [ ] All npm dependencies installed (`npm install` completed)
- [ ] .env file exists and has database config
- [ ] Port 5000 isn't already in use

**Solution:**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux
```

### Issue: "Frontend can't reach backend"
- [ ] Backend server is running (see port 5000)
- [ ] VITE_API_URL in .env.development is correct
- [ ] Check CORS error in browser console

**Solution:**
```bash
# Verify backend is accessible
curl http://localhost:5000/api/health
```

### Issue: "WebSocket connection failed"
- [ ] Backend server is running
- [ ] No firewall blocking WebSocket connections
- [ ] VITE_SOCKET_URL correct in .env.development

**Solution:**
```bash
# Restart backend
npm start  # in backend/
```

### Issue: "Database queries fail"
- [ ] Schema was loaded successfully
- [ ] Tables exist: SELECT * FROM INFORMATION_SCHEMA.TABLES

**Solution:**
```bash
# Verify schema
sqlcmd -S localhost -U sa -P YourPassword123! -d ProBoard -Q "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES"
```

---

## Performance Check

### Frontend Performance
Open DevTools → Performance tab:
- [ ] Page load < 3 seconds
- [ ] No red warnings in Console
- [ ] Smooth drag-and-drop

### Backend Performance
Check backend logs:
- [ ] Query response times (should be < 100ms)
- [ ] No "timeout" errors
- [ ] WebSocket events flowing smoothly

---

## Production Readiness Checklist

Before deploying to production:
- [ ] Change JWT_SECRET in backend .env to strong random value
- [ ] Change all SQL Server credentials
- [ ] Update SOCKET_IO_CORS to your production domain
- [ ] Disable logging in production
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS/WSS for secure connections
- [ ] Set up proper database backups
- [ ] Configure rate limiting for API
- [ ] Enable input validation on all endpoints

---

## Next Steps

### Immediate
1. ✅ Follow this checklist
2. ✅ Verify all green checkboxes
3. ✅ Test core features

### Short Term
- [ ] Update AuthContext for real login (use apiClient)
- [ ] Update BoardContext for API tasks
- [ ] Integrate MessagingPanel into Board view
- [ ] Test user registration flow

### Medium Term
- [ ] Add user profile management
- [ ] Implement search and filtering
- [ ] Add message edit/delete
- [ ] Set up proper logging

### Long Term
- [ ] Move to production environment
- [ ] Set up CI/CD pipeline
- [ ] Monitor performance metrics
- [ ] Plan advanced features

---

## Key Commands Reference

```bash
# Backend
cd backend
npm install                # Install dependencies
npm start                  # Start server
npm run dev                # Dev mode with nodemon (requires: npm i -D nodemon)

# Frontend
cd ..
npm install                # Install dependencies
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build

# Database (SQL Server)
sqlcmd -S localhost -U sa -i backend/db/schema.sql   # Load schema
sqlcmd -S localhost -U sa -Q "SELECT COUNT(*) FROM Users"  # Query
```

---

## File Locations Quick Reference

| What | Where |
|------|-------|
| Backend code | `/backend` |
| Database schema | `/backend/db/schema.sql` |
| Backend config | `/backend/.env` |
| API routes | `/backend/routes/` |
| Frontend code | `/src` |
| API client | `/src/api/client.js` |
| WebSocket service | `/src/services/socketService.js` |
| Messaging component | `/src/components/MessagingPanel.jsx` |
| Frontend config | `/.env.development` |
| Setup guide | `/SETUP_GUIDE.md` |
| This checklist | `/QUICK_START.md` |

---

## 🎯 Success Criteria

Your ProBoard setup is successful when:
- ✅ Backend server running on port 5000
- ✅ Database connected with no errors
- ✅ Frontend dev server running on port 5173
- ✅ Can login and see dashboard
- ✅ Can create and manage tasks
- ✅ Can send team chat messages
- ✅ Can send direct messages
- ✅ Real-time updates working (no page refresh needed)
- ✅ No errors in browser console
- ✅ No errors in backend console

---

## 🆘 Need Help?

1. **Check SETUP_GUIDE.md** - Full integration documentation
2. **Check IMPLEMENTATION_SUMMARY.md** - Architecture overview
3. **Check backend/db/README.md** - Database setup details
4. **Check backend/server.js** - Server configuration
5. **Open issue** - GitHub issues (if applicable)

---

**Happy coding! 🚀**

*Estimated setup time: 30 minutes*
*Last updated: 2024*
