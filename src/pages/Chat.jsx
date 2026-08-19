import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socketService';
import styles from './Chat.module.css';

export default function Chat() {
  const { user, goToDashboard } = useAuth();
  const [activeMode, setActiveMode] = useState('team'); // 'team' or 'direct'
  const [teamMessages, setTeamMessages] = useState([]);
  const [directMessages, setDirectMessages] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  // Sample team members (in production, fetch from API)
  useEffect(() => {
    setAllUsers([
      { id: 1, username: 'Tharun', email: 'tharun@team.com' },
      { id: 2, username: 'John Doe', email: 'john@team.com' },
      { id: 3, username: 'Jane Smith', email: 'jane@team.com' },
      { id: 4, username: 'Mike Wilson', email: 'mike@team.com' }
    ]);
  }, []);

  // Socket.IO listeners
  useEffect(() => {
    socketService.on('message:team:received', (message) => {
      setTeamMessages(prev => [...prev, message]);
    });

    socketService.on('message:direct:received', (message) => {
      setDirectMessages(prev => ({
        ...prev,
        [message.senderId]: [...(prev[message.senderId] || []), message]
      }));
    });

    socketService.on('user:online', (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    socketService.on('user:offline', (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    socketService.on('user:typing:indicator', (data) => {
      setTypingUser(data.username);
      setTimeout(() => setTypingUser(null), 3000);
    });

    return () => {
      socketService.off('message:team:received', null);
      socketService.off('message:direct:received', null);
      socketService.off('user:online', null);
      socketService.off('user:offline', null);
    };
  }, []);

  const handleSendTeamMessage = (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    socketService.sendTeamMessage(user?.id || 1, user?.username || 'User', 1, messageContent);

    // Add to local state immediately
    setTeamMessages(prev => [...prev, {
      id: Date.now().toString(),
      userId: user?.id || 1,
      username: user?.username || 'User',
      content: messageContent,
      timestamp: new Date().toISOString()
    }]);

    setMessageContent('');
  };

  const handleSendDirectMessage = (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedUser) return;

    socketService.sendDirectMessage(
      user?.id || 1,
      user?.username || 'User',
      selectedUser.id,
      messageContent
    );

    // Add to local state immediately
    setDirectMessages(prev => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), {
        id: Date.now().toString(),
        senderId: user?.id || 1,
        senderUsername: user?.username || 'User',
        receiverId: selectedUser.id,
        content: messageContent,
        timestamp: new Date().toISOString()
      }]
    }));

    setMessageContent('');
  };

  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>💬 Messages</h1>
          <p className={styles.subtitle}>Team Chat & Direct Messages</p>
        </div>
        <button className={styles.backBtn} onClick={goToDashboard}>
          ← Back to Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {activeMode === 'team' ? (
          // Team Chat Mode
          <div className={styles.teamChat}>
            <div className={styles.chatTop}>
              <h2>📢 Team Chat</h2>
              <p className={styles.modeInfo}>Communication with entire team</p>
            </div>

            <div className={styles.messageListContainer}>
              <div className={styles.messageList}>
                {teamMessages.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No messages yet. Start the conversation! 👋</p>
                  </div>
                ) : (
                  teamMessages.map(msg => (
                    <div key={msg.id} className={`${styles.message} ${msg.userId == (user?.id || 1) ? styles.ownMessage : ''}`}>
                      <div className={styles.messageHeader}>
                        <strong className={styles.sender}>{msg.username}</strong>
                        <span className={styles.time}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={styles.messageBody}>{msg.content}</div>
                    </div>
                  ))
                )}
                {typingUser && <div className={styles.typingIndicator}>✋ {typingUser} is typing...</div>}
              </div>
            </div>

            <form onSubmit={handleSendTeamMessage} className={styles.messageForm}>
              <input
                type="text"
                placeholder="Type a message to the team..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className={styles.messageInput}
                autoFocus
              />
              <button type="submit" className={styles.sendBtn} disabled={!messageContent.trim()}>
                Send
              </button>
            </form>
          </div>
        ) : (
          // Direct Messages Mode
          <div className={styles.directMessagesContainer}>
            {/* Users List */}
            <div className={styles.usersSidebar}>
              <h2>👥 Direct Messages</h2>
              <div className={styles.usersList}>
                {allUsers.filter(u => u.id !== (user?.id || 1)).map(teamUser => (
                  <div
                    key={teamUser.id}
                    className={`${styles.userOption} ${selectedUser?.id === teamUser.id ? styles.selected : ''}`}
                    onClick={() => setSelectedUser(teamUser)}
                  >
                    <div className={styles.userIcon}>
                      <div className={`${styles.statusDot} ${onlineUsers.has(teamUser.id) ? styles.online : styles.offline}`}></div>
                      {teamUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.userInfo}>
                      <p className={styles.userName}>{teamUser.username}</p>
                      <p className={styles.userStatus}>
                        {onlineUsers.has(teamUser.id) ? '🟢 Online' : '⚪ Away'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className={styles.chatArea}>
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className={styles.chatAreaHeader}>
                    <div className={styles.headerInfo}>
                      <h2>{selectedUser.username}</h2>
                      <span className={`${styles.onlineStatus} ${onlineUsers.has(selectedUser.id) ? styles.online : styles.offline}`}>
                        {onlineUsers.has(selectedUser.id) ? '🟢 Online' : '⚪ Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className={styles.messageListContainer}>
                    <div className={styles.messageList}>
                      {(!directMessages[selectedUser.id] || directMessages[selectedUser.id].length === 0) ? (
                        <div className={styles.emptyState}>
                          <p>No messages with {selectedUser.username} yet. Say hello! 👋</p>
                        </div>
                      ) : (
                        directMessages[selectedUser.id].map(msg => (
                          <div key={msg.id} className={`${styles.message} ${msg.senderId == (user?.id || 1) ? styles.ownMessage : ''}`}>
                            <div className={styles.messageHeader}>
                              <strong className={styles.sender}>{msg.senderUsername}</strong>
                              <span className={styles.time}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={styles.messageBody}>{msg.content}</div>
                          </div>
                        ))
                      )}
                      {typingUser && <div className={styles.typingIndicator}>✋ {typingUser} is typing...</div>}
                    </div>
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendDirectMessage} className={styles.messageForm}>
                    <input
                      type="text"
                      placeholder={`Message ${selectedUser.username}...`}
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className={styles.messageInput}
                    />
                    <button type="submit" className={styles.sendBtn} disabled={!messageContent.trim()}>
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className={styles.emptyState}>
                  <p>Select a team member to start chatting</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mode Toggle */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${activeMode === 'team' ? styles.active : ''}`}
          onClick={() => setActiveMode('team')}
        >
          📢 Team Chat
        </button>
        <button
          className={`${styles.modeBtn} ${activeMode === 'direct' ? styles.active : ''}`}
          onClick={() => setActiveMode('direct')}
        >
          ✉️ Direct Messages
        </button>
      </div>
    </div>
  );
}
