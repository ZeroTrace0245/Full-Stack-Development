import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDatabase, closeDatabase } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_IO_CORS || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({
  origin: process.env.SOCKET_IO_CORS || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ ProBoard Backend is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

// Socket.IO Connection Handling
const connectedUsers = new Map(); // { userId: socketId }
const userSockets = new Map(); // { socketId: userId }

io.on('connection', (socket) => {
  console.log('👤 New user connected:', socket.id);

  // User joins (register their socket connection)
  socket.on('user:join', (data) => {
    const { userId, username } = data;
    connectedUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);

    console.log(`✅ ${username} (${userId}) joined`);

    // Broadcast user online status
    io.emit('user:online', { userId, username, status: 'online' });
  });

  // Team chat message
  socket.on('message:team', (data) => {
    const { userId, username, projectId, content, timestamp } = data;
    console.log(`💬 Team message in project ${projectId}: ${username} - ${content}`);

    // Broadcast to all users in the project
    io.emit('message:team:received', {
      id: Date.now().toString(),
      userId,
      username,
      projectId,
      content,
      timestamp: timestamp || new Date().toISOString()
    });
  });

  // Direct message
  socket.on('message:direct', (data) => {
    const { senderId, senderUsername, receiverId, content, timestamp } = data;
    console.log(`✉️  Direct message: ${senderUsername} → ${receiverId}`);

    // Send to recipient if online
    if (connectedUsers.has(receiverId)) {
      const recipientSocketId = connectedUsers.get(receiverId);
      io.to(recipientSocketId).emit('message:direct:received', {
        id: Date.now().toString(),
        senderId,
        senderUsername,
        receiverId,
        content,
        timestamp: timestamp || new Date().toISOString()
      });
    }

    // Confirm to sender
    socket.emit('message:sent', { status: 'sent' });
  });

  // Activity update (task moved, created, etc.)
  socket.on('activity:update', (data) => {
    const { userId, username, action, taskTitle, columnTitle, timestamp } = data;
    console.log(`📋 Activity: ${username} - ${action}`);

    io.emit('activity:updated', {
      id: Date.now().toString(),
      userId,
      username,
      action,
      taskTitle,
      columnTitle,
      timestamp: timestamp || new Date().toISOString()
    });
  });

  // Typing indicator
  socket.on('user:typing', (data) => {
    const { userId, username, projectId } = data;
    socket.broadcast.emit('user:typing:indicator', {
      userId,
      username,
      projectId
    });
  });

  // Stop typing
  socket.on('user:stopTyping', (data) => {
    const { userId, username, projectId } = data;
    socket.broadcast.emit('user:stopTyping:indicator', {
      userId,
      username,
      projectId
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const userId = userSockets.get(socket.id);
    if (userId) {
      connectedUsers.delete(userId);
      userSockets.delete(socket.id);
      console.log(`👤 User disconnected: ${userId}`);

      io.emit('user:offline', { userId, status: 'offline' });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 ProBoard Backend Server running on port ${PORT}`);
      console.log(`📡 Socket.IO listening for real-time events`);
      console.log(`🌐 CORS origin: ${process.env.SOCKET_IO_CORS || 'http://localhost:5173'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down gracefully...');
  await closeDatabase();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();
