# M2+:Summary


### 1. **New Utility File: `src/utils/generateUsers.js`**
   - `Users(count)` - generates array of "USER 001", "USER 002", etc.
   - `getTeamMembers()` - returns consistent 12-user list
   - `getRandomUser()` - pick random user from team
   - `getUserInitials(name)` - converts "USER 001" to "U1" for avatars

### 2. **Updated `src/mockData.js`**
   - Replaced hardcoded names (Alice, Bob, etc.) with USER 001-012
   - Expanded tasks from 4 to 12 across all columns
   - More realistic task titles:
	 - **To Do:** repo setup, wireframes, API docs, CI/CD, database
	 - **Doing:** auth module, dashboard UI, backend API, user profile
	 - **Done:** project kickoff, requirements, architecture review

### 3. **Updated `src/components/TaskForm.jsx`**
   - Import `getTeamMembers()` from utils
   - Assignee dropdown now shows USER 001-012 instead of hardcoded names

### 4. **Updated `src/components/TaskCard.jsx`**
   - Import `getUserInitials()` from utils
   - Avatar initials now use utility function (USER 001 → U1, USER 010 → U0)
---

## 🧪 What to Test at http://localhost:54995

1. **Board loads** → See all 12 tasks assigned to USER 001-012
2. **Avatar initials** → Should show "U0", "U1", etc.
3. **Create new task** → Assignee dropdown shows USER 001-012
4. **Drag tasks** → Still works as before
5. **Task metadata** → Hovers show full "USER 0XX" name

---

## 📊 User Count & Format

**Current:** 12 users (USER 001 to USER 012)
**Format:** `USER` + 3-digit padded number
**Max:** Can easily extend to USER 999 if needed

To change user count, edit:
```javascript
// src/components/TaskForm.jsx
const TEAM_MEMBERS = getTeamMembers(20) // change 12 to 20, etc.
```

