import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId, username) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      // Emit user join event
      this.socket.emit('user:join', { userId, username });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Set up all default listeners
    this.setupListeners();
  }

  setupListeners() {
    // Team message received
    this.socket.on('message:team:received', (data) => {
      this.emit('message:team:received', data);
    });

    // Direct message received
    this.socket.on('message:direct:received', (data) => {
      this.emit('message:direct:received', data);
    });

    // Message sent confirmation
    this.socket.on('message:sent', (data) => {
      this.emit('message:sent', data);
    });

    // Activity updated
    this.socket.on('activity:updated', (data) => {
      this.emit('activity:updated', data);
    });

    // User online status
    this.socket.on('user:online', (data) => {
      this.emit('user:online', data);
    });

    this.socket.on('user:offline', (data) => {
      this.emit('user:offline', data);
    });

    // Typing indicators
    this.socket.on('user:typing:indicator', (data) => {
      this.emit('user:typing:indicator', data);
    });

    this.socket.on('user:stopTyping:indicator', (data) => {
      this.emit('user:stopTyping:indicator', data);
    });
  }

  // Send team message
  sendTeamMessage(userId, username, projectId, content) {
    if (this.socket?.connected) {
      this.socket.emit('message:team', {
        userId,
        username,
        projectId,
        content,
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn('Socket not connected, message not sent');
    }
  }

  // Send direct message
  sendDirectMessage(senderId, senderUsername, receiverId, content) {
    if (this.socket?.connected) {
      this.socket.emit('message:direct', {
        senderId,
        senderUsername,
        receiverId,
        content,
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn('Socket not connected, message not sent');
    }
  }

  // Emit activity
  emitActivity(userId, username, action, taskTitle, columnTitle) {
    if (this.socket?.connected) {
      this.socket.emit('activity:update', {
        userId,
        username,
        action,
        taskTitle,
        columnTitle,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Typing indicator
  emitTyping(userId, username, projectId) {
    if (this.socket?.connected) {
      this.socket.emit('user:typing', {
        userId,
        username,
        projectId
      });
    }
  }

  // Stop typing
  emitStopTyping(userId, username, projectId) {
    if (this.socket?.connected) {
      this.socket.emit('user:stopTyping', {
        userId,
        username,
        projectId
      });
    }
  }

  // Custom event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      if (callback) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      } else {
        this.listeners.delete(event);
      }
    }
  }

  // Emit to local listeners
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
