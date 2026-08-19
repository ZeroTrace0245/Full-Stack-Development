# 💬 ProBoard Messaging Feature

## Overview
The messaging system is now integrated as a dedicated page accessible from the Dashboard's Quick Actions button.

## Features

### Team Chat
- 📢 Project-wide communication channel
- Real-time message delivery via WebSockets
- Message history (latest 50 messages retained)
- Typing indicators showing when someone is typing
- All team members can see messages
- Messages are persisted to database

### Direct Messages
- ✉️ One-on-one private conversations
- Select from team member list
- Online/offline status indicators (🟢 Online, ⚪ Offline)
- Real-time notifications
- Only sender and receiver can view messages
- Private message history

## How to Use

### From Dashboard
1. Click **"Messages"** button in Quick Actions
2. You'll see the full-screen chat interface
3. Choose between **Team Chat** or **Direct Messages**

### Team Chat Mode
```
📢 Team Chat Page
├─ Message list (center)
├─ Input field at bottom
└─ Mode toggle at bottom
```

1. Read messages from all team members
2. Type a message in the input field
3. Click **Send** to broadcast to everyone
4. See typing indicator when others are typing

### Direct Messages Mode
```
💬 Direct Messages Page
├─ Users Sidebar (left)
│  └─ Click user to select
├─ Chat area (main)
│  ├─ Selected user info (top)
│  ├─ Message list (center)
│  └─ Input field (bottom)
└─ Mode toggle (bottom)
```

1. Click a team member in the sidebar
2. See their online/offline status
3. Type a message in the input field
4. Click **Send** to message them directly
5. Only you and that user can see the conversation

## Features Details

### Message Display
- **Own messages**: Blue-tinted bubble on the right
- **Other messages**: Gray bubble on the left
- **Sender name**: Shows who sent each message
- **Timestamp**: Precise time each message was sent

### Online Status Indicators
- 🟢 **Green dot**: User is currently online
- ⚪ **Gray dot**: User is offline/away
- Updates real-time as users join/leave

### Typing Indicators
- "✋ [Username] is typing..." appears while someone types
- Automatically clears after 3 seconds of inactivity

### Message Features
- **Instant delivery**: No page refresh needed
- **Rich formatting**: Plain text messages (emoji supported!)
- **Persistent storage**: Messages saved to database
- **History**: View past messages in conversations

## Technical Details

### Backend
- WebSocket events for real-time delivery
- Database storage in Messages and DirectMessages tables
- JWT authentication for security
- User presence tracking

### Frontend
- React components with Socket.IO client
- Real-time state updates via hooks
- Responsive design (desktop, tablet, mobile)
- Frosted-glass UI style

### Database
**Messages Table** (Team Chat)
- id, sender_id, project_id, content, created_at

**DirectMessages Table** (1-on-1)
- id, sender_id, receiver_id, content, is_read, created_at

## Navigation

```
Dashboard (home)
	↓
Quick Actions
	↓
💬 Messages Button
	↓
Chat Page
	├─ 📢 Team Chat Tab
	└─ ✉️ Direct Messages Tab
```

Return to Dashboard using the **← Back to Dashboard** button in the top-left.

## Current Users (Sample)
- Tharun (you - when logged in)
- John Doe
- Jane Smith
- Mike Wilson

## Tips & Tricks

1. **Quick switching**: Use the toggle buttons at the bottom to switch between Team Chat and Direct Messages
2. **User search**: Coming soon - search for users in the sidebar
3. **Message reactions**: Coming soon - emoji reactions
4. **Message editing**: Coming soon - edit or delete sent messages
5. **Pin important messages**: Coming soon

## Known Limitations (MVP)

- Messages are text-only (no file uploads yet)
- No message search/filter
- No message reactions or threads
- No read receipts
- No voice/video calls

## Future Enhancements

- File sharing and image uploads
- Message search across all conversations
- Emoji reactions on messages
- Message threading/replies
- Voice and video calling
- Screen sharing
- End-to-end encryption
- Message formatting (bold, italic, code blocks)
- @mentions and notifications

## Troubleshooting

### Messages not appearing?
- Check WebSocket connection (look for "Socket connected" in console)
- Verify backend server is running on port 5000
- Check browser console for errors (F12)

### Users showing as offline?
- Backend needs to emit user:join event
- Check Socket.IO connection status
- Restart the application

### Can't send message?
- Check that your text is not empty
- Verify you're connected to the WebSocket
- Check network tab in DevTools for failed requests

### Slow message delivery?
- Check network latency (DevTools → Network)
- Verify database connection is stable
- Check backend server CPU/memory usage

## Getting Started

1. Go to Dashboard
2. Click **Messages** in Quick Actions
3. Start chatting with your team! 🎉

---

**Need help?** Check the main documentation in SETUP_GUIDE.md or PROJECT_STRUCTURE.md
