# ProBoard Full-Stack Setup & Integration Guide

## 🎯 Project Structure

```
full-stack/
├── backend/                    # Node.js Express Backend
│   ├── config/
│   │   └── database.js        # SQL Server connection
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── tasks.js           # Task CRUD endpoints
│   │   └── messages.js        # Messaging endpoints
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── db/
│   │   ├── schema.sql         # Database schema
│   │   └── README.md          # Setup instructions
│   ├── package.json
│   ├── server.js              # Main Express + Socket.IO server
│   └── .env.example
│
├── src/                        # React Frontend (Vite)
│   ├── api/
│   │   └── client.js          # API client (axios)
│   ├── services/
│   │   └── socketService.js   # WebSocket client (Socket.IO)
│   ├── components/
│   │   ├── MessagingPanel.jsx # Messaging UI
│   │   └── MessagingPanel.module.css
│   ├── context/
│   │   ├── AuthContext.jsx    # Auth state management
│   │   └── BoardContext.jsx   # Board state management
│   └── ...
│
├── package.json               # Frontend dependencies
├── .env.development          # Frontend environment config
└── README.md
```

## 📋 Setup Instructions

### Step 1: Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Create SQL Server Database
Follow the instructions in `backend/db/README.md` to:
1. Create a new SQL Server database named `ProBoard`
2. Run the schema script (`backend/db/schema.sql`)
3. Load sample data

#### Configure Environment
Copy `.env.example` to `.env` and update:
```bash
cp .env.example .env
```

Edit `.env` with your SQL Server credentials and JWT secret:
```env
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=ProBoard
DB_USER=sa
DB_PASSWORD=YourPassword123!
JWT_SECRET=change_this_to_a_secure_random_string
PORT=5000
SOCKET_IO_CORS=http://localhost:5173
```

#### Start Backend Server
```bash
npm start
```

You should see:
```
✅ Connected to SQL Server successfully
🚀 ProBoard Backend Server running on port 5000
📡 Socket.IO listening for real-time events
```

### Step 2: Frontend Setup

#### Install Dependencies
```bash
npm install
```

#### Frontend Environment
The `.env.development` file is already configured:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### Start Frontend Development Server
```bash
npm run dev
```

You'll see:
```
Local:   http://localhost:5173/
```

### Step 3: Test the Integration

1. **Open Browser**: Go to `http://localhost:5173`
2. **Login**: 
   - Username: `john_doe`
   - Password: (any, login is mocked for now)
3. **Create Task**: Click "+" button to create a new task (now saves to database)
4. **Chat**: Open Messaging Panel to test real-time team chat
5. **Direct Messages**: Send direct messages to other team members

---

## 🔗 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users

### Tasks
- `GET /api/tasks/board/:boardId` - Get tasks for a board
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task

### Messaging
- `GET /api/messages/team/:projectId` - Get team chat messages
- `POST /api/messages/team` - Send team message
- `GET /api/messages/direct/:otherUserId` - Get direct messages
- `POST /api/messages/direct` - Send direct message

---

## 📡 WebSocket Events Reference

### Sent Events (Client → Server)
```javascript
// User joins
socket.emit('user:join', { userId, username })

// Team chatting
socket.emit('message:team', { userId, username, projectId, content, timestamp })

// Direct messaging
socket.emit('message:direct', { senderId, senderUsername, receiverId, content, timestamp })

// Activity tracking
socket.emit('activity:update', { userId, username, action, taskTitle, columnTitle, timestamp })

// Typing indicators
socket.emit('user:typing', { userId, username, projectId })
socket.emit('user:stopTyping', { userId, username, projectId })
```

### Received Events (Server → Client)
```javascript
// New team message
socket.on('message:team:received', (message) => { ... })

// New direct message
socket.on('message:direct:received', (message) => { ... })

// User online/offline
socket.on('user:online', (data) => { ... })
socket.on('user:offline', (data) => { ... })

// Activity updates
socket.on('activity:updated', (activity) => { ... })

// Typing indicators
socket.on('user:typing:indicator', (data) => { ... })
socket.on('user:stopTyping:indicator', (data) => { ... })
```

---

## 🔐 Authentication

### JWT Tokens
- Tokens are issued on login/register
- Stored in localStorage as `authToken`
- Included in all API requests via Authorization header
- Token expires in 7 days (configurable)

### Token Usage
```javascript
// Automatically handled by API client
const response = await apiClient.login('username', 'password');
// Token is stored automatically in localStorage
// Future requests automatically include the token
```

### Adding Auth to New Requests
```javascript
import apiClient from './api/client';

// Token is automatically included
const user = await apiClient.getCurrentUser();
```

---

## 💬 Messaging System

### Team Chat
- Project-wide messages visible to all team members
- Real-time delivery via WebSockets
- Stored in database for persistence
- Latest 50 messages loaded on connect

### Direct Messages
- 1-on-1 conversation between team members
- Only visible to sender and receiver
- Real-time notifications when online
- Message history preserved in database

### Using Messaging in Components
```javascript
import socketService from '../services/socketService';

// In your component
useEffect(() => {
  // Listen for incoming messages
  socketService.on('message:team:received', (message) => {
	// Handle new message
  });

  // Listen for direct messages
  socketService.on('message:direct:received', (message) => {
	// Handle direct message
  });
}, []);

// Send team message
socketService.sendTeamMessage(userId, username, projectId, 'Hello team!');

// Send direct message
socketService.sendDirectMessage(userId, username, receiverId, 'Hello!');
```

---

## 🚀 Next Steps & Features to Implement

### Phase 1 (Core)
- [ ] Update AuthContext to use real API login
- [ ] Update BoardContext to use API instead of localStorage
- [ ] Integrate MessagingPanel into Board view
- [ ] Test all endpoints and WebSocket events

### Phase 2 (Enhanced)
- [ ] User registration form
- [ ] Task assignment to specific users
- [ ] Message search and filtering
- [ ] Message reactions (emoji)
- [ ] File sharing in messages

### Phase 3 (Advanced)
- [ ] Message encryption
- [ ] Read receipts
- [ ] Typing indicators (advanced)
- [ ] Message editing and deletion
- [ ] Voice/Video calls integration
- [ ] Message threading/replies

---

## 🐛 Troubleshooting

### Backend Connection Error
```
❌ Database connection error: Connection refused
```
**Solution**: 
- Verify SQL Server is running
- Check .env DB_SERVER and credentials
- Check firewall settings

### Frontend Cannot Reach Backend
```
Error: Network Error or CORS error
```
**Solution**:
- Verify backend is running on port 5000
- Check SOCKET_IO_CORS in backend/.env
- Verify frontend .env.development has correct API_URL

### WebSocket Connection Failed
```
Socket connection timeout
```
**Solution**:
- Restart backend server
- Clear browser cache
- Check that Socket.IO is listening

### Database Schema Error
```
Error: Invalid object name 'Users'
```
**Solution**:
- Verify schema.sql was executed in correct database
- Check that database name is 'ProBoard'
- Re-run schema.sql if needed

---

## 📚 Key Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| React | Frontend UI | ^19.2.8 |
| Vite | Build tool | ^8.2.0 |
| Express | Backend API | ^4.18.2 |
| Socket.IO | Real-time messaging | ^4.6.1 |
| SQL Server | Database | 2019+ |
| mssql | DB driver | ^9.1.1 |
| JWT | Authentication | ^9.0.2 |
| axios | HTTP client | ^1.6.2 |
| @dnd-kit | Drag-and-drop | ^8.0.0 |

---

## 📝 Environment Checklist

- [ ] Backend .env configured
- [ ] SQL Server database created
- [ ] Schema loaded successfully
- [ ] Backend server running
- [ ] Frontend .env.development correct
- [ ] npm dependencies installed
- [ ] Frontend dev server running
- [ ] Can login successfully
- [ ] Can create tasks
- [ ] Can send messages
- [ ] WebSocket connected (check browser console)

---

## 🎓 Learning Resources

- [Express.js Docs](https://expressjs.com/)
- [Socket.IO Docs](https://socket.io/docs/v4/)
- [React Docs](https://react.dev/)
- [SQL Server T-SQL Reference](https://learn.microsoft.com/sql/t-sql/language-reference)
- [JWT.io](https://jwt.io/)

---

**Happy coding! 🚀**
