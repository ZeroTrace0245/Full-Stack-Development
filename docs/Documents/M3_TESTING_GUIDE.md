# M3: Login Page & Dashboard

## 🎯 Features Delivered

### 1. **Login Page**
- Username & password form
- "Remember me" checkbox
- Error handling for empty fields
- Demo note: "Any username & password works"
- Mica-styled frosted glass form
- Smooth animations (logo icon, form entrance)

### 2. **Dashboard with Stats Cards**
- Welcome message with username
- 4 stat cards:
  - **Total Tasks** - all tasks across columns
  - **Completed** - tasks in "Done" column
  - **In Progress** - tasks in "Doing" column
  - **To Do** - tasks in "To Do" column
- Completion percentage with SVG circle progress indicator
- Quick action buttons (View Board, Create Task, Team Members, Reports)
- Logout button in header
- Intro card with "Open Board" button

### 3. **Navigation Flow**
- Login → Dashboard (auto-redirect)
- Dashboard → Board (click "Open Board")
- Board → Dashboard (click "Back to Dashboard")
- Dashboard → Logout (click "Logout")
- All state preserved during session

### 4. **Design System**
- Consistent Windows 11 Mica effect throughout
- Smooth animations (slideIn, fadeIn)
- Responsive grid layout
- Dark/light mode support

---

## 🧪 Testing Steps

### Step 1: Login Page
1. Open http://localhost:54995
2. You should see the login page with:
   - "NovaTrack" title and 📊 logo
   - Username field
   - Password field
   - "Remember me" checkbox
   - "Sign In" button
   - Demo note at bottom

**Test cases:**
- [ ] Click "Sign In" without entering username → Error: "Username is required"
- [ ] Click "Sign In" without entering password → Error: "Password is required"
- [ ] Enter username: "TestUser", password: "any123", click "Sign In" → Auto-redirect to Dashboard
- [ ] Try admin/admin → Should work
- [ ] Try random123/random123 → Should work (no validation)

### Step 2: Dashboard
After login, you should see:

**Header:**
- [ ] "TeamPulse" title
- [ ] "Welcome back, [username] 👋"
- [ ] "Logout" button (red outline)

**Intro Card:**
- [ ] Title: "Manage your team's tasks efficiently"
- [ ] Description text
- [ ] "Open Board →" button (blue)

**Stats Grid (4 cards in 2x2 layout):**
- [ ] **Total Tasks:** Shows "12" (from mock data)
- [ ] **Completed:** Shows "3" (3 tasks in Done column)  
- [ ] **In Progress:** Shows "4" (4 tasks in Doing column)
- [ ] **To Do:** Shows "5" (5 tasks in To Do column)
- [ ] Each card has colored left border matching status
- [ ] Hover effect: card lifts up, shadow increases

**Completion Card:**
- [ ] "Sprint Progress" title
- [ ] "25% of tasks completed" text (3/12 = 25%)
- [ ] Circular progress indicator showing 25% filled (green)
- [ ] Percentage number in center: "25%"

**Quick Actions:**
- [ ] 4 buttons: View Board, Create Task, Team Members, Reports
- [ ] Each has emoji icon and hover effect

### Step 3: Navigate to Board
1. Click "Open Board →" button or "View Board" action
2. Should see the Kanban board with:

**Board Header:**
- [ ] "TeamPulse - Sprint Board" title
- [ ] "← Back to Dashboard" button (blue outline)

**Columns (3 columns):**
- [ ] **To Do:** Shows 5 tasks (USER 001-005)
- [ ] **Doing:** Shows 4 tasks (USER 006-009)
- [ ] **Done:** Shows 3 tasks (USER 010-012)

**Task Cards:**
- [ ] Each card shows title, assignee avatar, estimate
- [ ] Avatar shows initials (USER 001 → "U1", USER 010 → "U0")

### Step 4: Test Drag-and-Drop
1. Drag "Set up project repo" (To Do) → Doing column
2. Statistics should NOT update yet (local state only)
3. Drag task back to To Do
4. Verify visual feedback during drag

### Step 5: Back to Dashboard
1. Click "← Back to Dashboard" button
2. Should see Dashboard again
3. Stats should be recalculated:
   - Total Tasks: still 12
   - Any changes from drag-drop are lost (state not persisted)

### Step 6: Logout
1. Click "Logout" button in Dashboard header
2. Should return to Login page
3. All form fields should be clear

---

## ✨ Expected Visual Design

### Colors (Light Mode)
- Background: Light gray gradient
- Cards: Semi-transparent white (frosted glass)
- Accent (buttons): Blue (#0078d4)
- Text: Dark
- Borders: Subtle white lines

### Colors (Dark Mode, toggle via OS or DevTools)
- Background: Dark gray/black gradient
- Cards: Semi-transparent dark surfaces
- Accent: Bright blue
- Text: Light
- Borders: Subtle white lines with reduced opacity

---

## 🎭 Mobile Responsiveness

Shrink browser to ~375px width:
- [ ] Login form still readable
- [ ] Dashboard stats stack into 2 columns instead of 4
- [ ] Logout button still accessible
- [ ] Board columns still draggable
- [ ] No layout breaks

---

## 🐛 Known Limitations

- No data persistence (refresh loses board changes)
- Stats calculated fresh each time Dashboard loads
- Drag-drop changes not persisted to mock data
- No real authentication (any password accepted)
- No API backend yet

---

## ✅ Success Checklist

All tests should pass:
- [ ] Login with any credentials leads to Dashboard
- [ ] Dashboard shows correct stats (Total: 12, Completed: 3, In Progress: 4, To Do: 5)
- [ ] Progress circle shows 25%
- [ ] Board shows all 12 tasks with USER XXX names
- [ ] Avatars show correct initials (U+digit)
- [ ] Drag-drop still works
- [ ] Back button returns to Dashboard
- [ ] Logout button clears session and returns to Login
- [ ] Design is consistent Mica style (frosted,  shadows, animations)
- [ ] No console errors

---

## 📊 Data Structure

After login, board contains:
- **To Do:** t1-t5 (USER 001-005)
- **Doing:** t6-t9 (USER 006-009)
- **Done:** t10-t12 (USER 010-012)