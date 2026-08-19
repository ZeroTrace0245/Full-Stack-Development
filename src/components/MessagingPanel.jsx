import React, { useState, useEffect } from 'react';
import socketService from '../services/socketService';
import styles from './MessagingPanel.module.css';

export default function MessagingPanel({ user }) {
  const [activeTab, setActiveTab] = useState('team'); // 'team' or 'direct'
  const [teamMessages, setTeamMessages] = useState([]);
  const [directMessages, setDirectMessages] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Set up Socket.IO listeners
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
      setIsTyping(true);
    });

    socketService.on('user:stopTyping:indicator', (data) => {
      setIsTyping(false);
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

    socketService.sendTeamMessage(user.id, user.username, 1, messageContent);
    setMessageContent('');
  };

  const handleSendDirectMessage = (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedUser) return;

    socketService.sendDirectMessage(user.id, user.username, selectedUser.id, messageContent);
    setMessageContent('');
  };

  const handleTyping = () => {
    if (!isTyping) {
      socketService.emitTyping(user.id, user.username, 1);
    }
  };

  return (
    <div className={styles.messagingPanel}>
      <div className={styles.header}>
        <h3>💬 Messages</h3>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'team' ? styles.active : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team Chat
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'direct' ? styles.active : ''}`}
            onClick={() => setActiveTab('direct')}
          >
            Direct Messages
          </button>
        </div>
      </div>

      {activeTab === 'team' ? (
        <div className={styles.teamChat}>
          <div className={styles.messageList}>
            {teamMessages.map(msg => (
              <div key={msg.id} className={`${styles.message} ${msg.userId === user.id ? styles.own : ''}`}>
                <div className={styles.messageMeta}>
                  <strong>{msg.username}</strong>
                  <span className={styles.time}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={styles.messageContent}>{msg.content}</div>
              </div>
            ))}
            {isTyping && <div className={styles.typingIndicator}>Someone is typing...</div>}
            {teamMessages.length === 0 && (
              <div className={styles.empty}>No messages yet. Start the conversation!</div>
            )}
          </div>

          <form onSubmit={handleSendTeamMessage} className={styles.messageForm}>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageContent}
              onChange={(e) => {
                setMessageContent(e.target.value);
                handleTyping();
              }}
              className={styles.input}
            />
            <button type="submit" className={styles.sendBtn}>Send</button>
          </form>
        </div>
      ) : (
        <div className={styles.directMessages}>
          <div className={styles.userList}>
            <h4>Team Members</h4>
            {allUsers.map(u => (
              u.id !== user.id && (
                <div
                  key={u.id}
                  className={`${styles.userItem} ${selectedUser?.id === u.id ? styles.selected : ''}`}
                  onClick={() => setSelectedUser(u)}
                >
                  <div className={styles.userStatus}>
                    <span className={`${styles.statusIndicator} ${onlineUsers.has(u.id) ? styles.online : styles.offline}`}></span>
                    {u.username}
                  </div>
                </div>
              )
            ))}
          </div>

          <div className={styles.chatArea}>
            {selectedUser ? (
              <>
                <div className={styles.chatHeader}>
                  <h4>{selectedUser.username}</h4>
                  <span className={`${styles.statusBadge} ${onlineUsers.has(selectedUser.id) ? styles.online : styles.offline}`}>
                    {onlineUsers.has(selectedUser.id) ? '🟢 Online' : '⚪ Offline'}
                  </span>
                </div>

                <div className={styles.messageList}>
                  {(directMessages[selectedUser.id] || []).map(msg => (
                    <div key={msg.id} className={`${styles.message} ${msg.senderId === user.id ? styles.own : ''}`}>
                      <div className={styles.messageMeta}>
                        <strong>{msg.senderUsername}</strong>
                        <span className={styles.time}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={styles.messageContent}>{msg.content}</div>
                    </div>
                  ))}
                  {(!directMessages[selectedUser.id] || directMessages[selectedUser.id].length === 0) && (
                    <div className={styles.empty}>No messages. Say hello!</div>
                  )}
                </div>

                <form onSubmit={handleSendDirectMessage} className={styles.messageForm}>
                  <input
                    type="text"
                    placeholder={`Message ${selectedUser.username}...`}
                    value={messageContent}
                    onChange={(e) => {
                      setMessageContent(e.target.value);
                      handleTyping();
                    }}
                    className={styles.input}
                  />
                  <button type="submit" className={styles.sendBtn}>Send</button>
                </form>
              </>
            ) : (
              <div className={styles.empty}>Select a team member to start chatting</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
