# M2: Create Task Modal

## ✅ What to Test

### 1. **Modal Appearance**
- [ ] Click **"+"** button on any column (To Do, Doing, or Done)
- [ ] Modal appears with frosted glass overlay
- [ ] Modal title: "Create New Task"
- [ ] Modal has close button (✕) in top-right
- [ ] Pressing **Escape** closes the modal

### 2. **Form Fields**
- [ ] Task Title input field (`placeholder: "Enter task title..."`)
- [ ] Assign To dropdown (shows: Alice, Bob, Charlie, Dana, Eve)
- [ ] Estimate input field (number, defaults to 2, min 1, max 40)
- [ ] Column dropdown (pre-selects the column you clicked "+" from)
- [ ] Cancel and Create Task buttons

### 3. **Form Validation**
- [ ] Click "Create Task" without entering a title → error message appears
- [ ] Enter title, keep estimate blank → error message appears
- [ ] Pick a valid title and estimate, click Create → task added to board
- [ ] After successful create, modal closes and form resets

### 4. **Task Creation**
- [ ] Click "+" on "To Do" column
- [ ] Enter: Title="Write unit tests", Assignee="Bob", Estimate="3"
- [ ] Click "Create Task"
- [ ] New task appears at bottom of "To Do" column
- [ ] New task shows:
  - [ ] Title: "Write unit tests"
  - [ ] Avatar with initials "B" (Bob)
  - [ ] Metadata: "3h estimate"

### 6. **UI Polish**
- [ ] Column headers show colored dot (• To Do, • Doing, • Done)
- [ ] Left border of column matches status color
- [ ] Task cards have frosted glass look
- [ ] Hover on card → lifts up, brightens
- [ ] Modal overlay has blur effect on background
- [ ] Empty columns show: "No tasks yet. Click + to add one!"

### 7. **Dark Mode** (if toggling via browser DevTools)
- [ ] Modal and form still readable in dark mode
- [ ] Colors adjust appropriately (lighter accent, smoky backgrounds)
- [ ] Task cards have dark glass effect

### 8. **Responsive** (shrink browser to mobile width ~375px)
- [ ] Modal fits on screen
- [ ] Form fields stack vertically
- [ ] Cancel/Create buttons stack
- [ ] Columns run as single column (no grid wrap)

---

## 🎯 Expected Behavior Summary

1. **Click "+" on column** → Modal pops up
2. **Fill form & submit** → Task added to board, modal closes
3. **Drag task** → Smooth animation, moves between columns
4. **Empty column** → Shows helpful message
5. **Dark/light mode** → All styles automatically adjust
6. **Mobile** → Responsive layout, no overflow

---

## 🐛 Known Limitations (M2)

- Tasks not persisted to backend (state lost on refresh)
- Only 5 team members in assignee list (hardcoded)
- No edit/delete task buttons yet (M3)
- Drag-drop within same column doesn't reorder (dnd-kit limitation without Droppable)

---

## 📝 Browser Console

Check browser DevTools Console (F12) for:
- No red errors
- No warnings about missing props
- Verify DndContext context is available

---
