# 🧪 Testing the Messaging Feature

## Quick Test (2 minutes)

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Login
- Username: `john_doe`
- Click Login

### Step 3: Access Messaging
1. Go to Dashboard
2. Click **"Messages"** button in Quick Actions
3. You're now in the Messaging page! 🎉

### Step 4: Test Team Chat
1. You should see "📢 Team Chat" tab is active
2. Type a message: "Hello team!"
3. Click **Send**
4. Message appears in the list with:
   - Your message on the right (blue)
   - Timestamp (2:XX PM format)
   - Your username

### Step 5: Test Direct Messages
1. Click **"✉️ Direct Messages"** toggle button
2. Click "John Doe" in the users list (or any team member)
3. Type: "Hey John!"
4. Click **Send**
5. Message appears in the chat
6. Select another user and message them
7. View the history between you and each user

### Step 6: Check UI Elements
- ✅ Header displays "Messages" title
- ✅ Back button returns to Dashboard
- ✅ Mode toggle buttons at bottom
- ✅ Message sending works
- ✅ Online status shows (green/gray dot)
- ✅ Typing indicator visible
- ✅ User list selectable
- ✅ Responsive on all screen sizes

---

## Full Test Suite

### Unit Tests

#### Test 1: Navigation
```
✓ Dashboard Quick Actions has Messages button
✓ Clicking Messages button navigates to Chat
✓ Back button in Chat returns to Dashboard
✓ All buttons are clickable
```

#### Test 2: Team Chat
```
✓ Team Chat tab is visible
✓ Message input field accepts text
✓ Send button works
✓ Messages appear in list
✓ Own messages are blue (right-aligned)
✓ Other messages are gray (left-aligned)
✓ Sender names display correctly
✓ Timestamps are formatted (HH:MM)
✓ Empty state shows when no messages
```

#### Test 3: Direct Messages
```
✓ Direct Messages tab is visible
✓ Users list shows all team members
✓ Can select a user
✓ Selected user is highlighted
✓ Chat area shows selected user info
✓ Online status displays correctly
✓ Message input field works
✓ Can send private message
✓ Message history persists per user
```

#### Test 4: Message Display
```
✓ Messages show sender name
✓ Messages show timestamp
✓ Messages wrap long text
✓ Emoji in messages work
✓ Typing indicator appears
✓ Typing indicator disappears after 3s
✓ Messages are centered correctly
```

#### Test 5: User Status
```
✓ Online users show green dot (🟢)
✓ Offline users show gray dot (⚪)
✓ Status text matches indicator
✓ Status updates in real-time
```

#### Test 6: UI/UX
```
✓ Layout is responsive (desktop/tablet/mobile)
✓ All text is readable
✓ Frosted glass effect visible
✓ Buttons have proper hover states
✓ No layout breaks on small screens
✓ Touch-friendly on mobile
✓ Animations smooth and performant
```

---

## Integration Tests (with Backend)

### Test 1: WebSocket Connection
```bash
# In browser console, check for:
Console Output: "✅ Socket connected: [socket-id]"

# If not connected:
- Verify backend is running (port 5000)
- Check for connection errors
- Verify SOCKET_URL in .env.development
```

### Test 2: Message Persistence
```
1. Send team message: "Test message 1"
2. Close and reopen browser
3. Navigate back to Chat
4. Verify message still appears
5. Check database (SQL Server)
   SELECT * FROM Messages WHERE project_id=1
```

### Test 3: Multi-User Scenario
```
Open two browser windows:

Window 1: Login as john_doe
Window 2: Login as admin (or different user)

Window 1 sends: "Hello from window 1"
Window 2 receives: Message appears immediately
Window 2 sends: "Hello from window 2"
Window 1 receives: Message appears immediately

✓ Real-time delivery working
```

### Test 4: Direct Message Privacy
```
Window 1 (john_doe) → sends DM to jane_smith
Window 2 (admin) → does NOT see this message
Window 3 (jane_smith) → DOES see this message

✓ Privacy maintained
```

---

## Performance Tests

### Test 1: Message Load Time
```
Expected: < 100ms per message
Test: Send message → Record response time
Result: Pass/Fail
```

### Test 2: UI Responsiveness
```
Expected: Smooth scrolling, no jank
Test: Scroll message list quickly
Result: Smooth/Choppy
```

### Test 3: Input Lag
```
Expected: < 50ms from typing to appearance
Test: Type quickly in message input
Result: Lag present/None
```

### Test 4: Memory Usage
```
Expected: < 50MB for chat session
Test: Send 100 messages, monitor memory
Result: Pass/Fail
```

---

## Browser Compatibility Tests

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome  | ✅      | ✅     | Recommended |
| Firefox | ✅      | ✅     | Full support |
| Safari  | ✅      | ✅     | Full support |
| Edge    | ✅      | ✅     | Full support |

---

## Error Handling Tests

### Test 1: Network Disconnection
```
1. Open Chat
2. Disconnect internet (DevTools → Offline)
3. Try to send message
Expected: Error message or queued message
4. Reconnect internet
Expected: Message sends or reconnects
```

### Test 2: Backend Down
```
1. Stop backend server
2. Try to send message in Chat
Expected: Error message (connection failed)
3. Restart backend
Expected: Auto-reconnects within 5 seconds
```

### Test 3: Empty Message
```
1. Leave input field empty
2. Click Send button
Expected: Button disabled or no message sent
```

### Test 4: Very Long Message
```
1. Paste 5000 character message
2. Send
Expected: Message sends and displays with proper wrapping
```

---

## Responsive Design Tests

### Desktop (1920x1080)
```
□ Full layout visible
□ No overflow
□ All buttons accessible
□ Message bubbles at 70% width
```

### Tablet (768x1024)
```
□ Layout adjusted
□ Touch-friendly spacing
□ Message bubbles at 85% width
□ Sidebar visible
```

### Mobile (375x667)
```
□ Full-width responsive
□ Stacked layout
□ Input field full-width
□ Message bubbles at 90% width
□ Buttons full-width
□ No horizontal scroll
```

---

## Manual Test Checklist

```
BEFORE TESTING:
□ Backend running on port 5000
□ Database connected
□ Frontend running on port 5173
□ Browser console open (F12)
□ No JavaScript errors

MESSAGING TESTS:
□ Can access Chat page
□ Team Chat tab works
□ Can type and send messages
□ Messages display correctly
□ Direct Messages tab works
□ Can select users
□ Can send private messages
□ User list shows all members

UI TESTS:
□ Layout is clean and organized
□ Colors are correct
□ Fonts are readable
□ Icons display properly
□ Buttons are clickable
□ Hover effects work
□ Click animations work
□ No visual glitches

FEATURE TESTS:
□ Online status accurate
□ Typing indicator appears
□ Message timestamps correct
□ Sender names display
□ Empty states show
□ Scrolling works
□ Back button navigates
□ Mode toggle switches

BROWSER TESTS:
□ Chrome/Edge
□ Firefox
□ Safari
□ Mobile browser

PERFORMANCE TESTS:
□ Page loads quickly
□ Messages load instantly
□ Typing is responsive
□ Scrolling is smooth
□ No lag or freezing

FINAL CHECK:
□ All tests passed
□ No errors in console
□ Ready for deployment
```

---

## Troubleshooting During Testing

### Messages Not Appearing?
1. Check browser console (F12 → Console tab)
2. Look for error messages
3. Verify WebSocket connection:
   ```javascript
   // In browser console:
   socketService.isConnected() // Should return true
   ```
4. Check Network tab for HTTP requests
5. Verify backend is responding to `/api/health`

### Users Not Loading?
1. Check backend logs
2. Verify database tables exist
3. Run: `SELECT COUNT(*) FROM Users`
4. Check CORS settings if 403 error

### Typing Indicator Not Working?
1. Backend must emit `user:typing:indicator`
2. Frontend listens for the event
3. Check WebSocket frames in DevTools

### Styles Not Loading?
1. Verify CSS Module file exists
2. Check for typos in class names
3. Clear browser cache (Ctrl+Shift+Delete)
4. Restart dev server

---

## Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
OS: ___________

TEAM CHAT TESTS:
□ PASS  □ FAIL  - Message sending
□ PASS  □ FAIL  - Message display
□ PASS  □ FAIL  - User name/timestamp
□ PASS  □ FAIL  - Empty state

DIRECT MESSAGES TESTS:
□ PASS  □ FAIL  - User selection
□ PASS  □ FAIL  - Private messaging
□ PASS  □ FAIL  - Message history
□ PASS  □ FAIL  - Online status

UI TESTS:
□ PASS  □ FAIL  - Layout
□ PASS  □ FAIL  - Colors
□ PASS  □ FAIL  - Responsive
□ PASS  □ FAIL  - Animations

ISSUES FOUND:
1. ___________
2. ___________
3. ___________

OVERALL: □ PASS  □ FAIL

Notes:
___________
```

---

**Now go test! 🧪**

For any issues or crashes, check the browser console (F12) for error messages!
