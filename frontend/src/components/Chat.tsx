import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ContentCopy as ClipboardIcon, Check as CheckIcon, VolumeUp, VolumeOff, FiberManualRecord as StatusIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { UserList } from './UserList';
import { LoginModal } from './LoginModal';
import { LoadingSpinner } from './LoadingSpinner';
import { GlobalDropZone } from './GlobalDropZone';
import { useChat } from '../hooks/useChat';
import { useNotifications } from '../hooks/useNotifications';

export const Chat: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('chatNickname') || null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState<string>('main');
  const [urlCopied, setUrlCopied] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    users,
    typingUsers,
    isConnected,
    isConnecting,
    login: chatLogin,
    sendMessage,
    sendTyping,
  } = useChat();

  const isOnline = isConnected;
  const { createNotification, clearAll, init, soundEnabled, toggleSound, resetSoundThrottling } = useNotifications();


  // Initialize notifications
  useEffect(() => {
    init();
  }, [init]);

  // Handle notifications for new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isFromSelf = lastMessage.f === currentUser;
      const isFocused = document.hasFocus();

      if (!isFromSelf) {
        createNotification(lastMessage.f, lastMessage.m, isFocused, soundEnabled);
      }
    }
  }, [messages, currentUser, createNotification, soundEnabled]);

  // Cleanup notifications on unmount
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);

  // Clear notifications and reset sound throttling when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      clearAll();
      resetSoundThrottling();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        clearAll();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [clearAll, resetSoundThrottling]);

  // Get channel from URL path or query parameter
  useEffect(() => {
    const search = window.location.search;

    if (search) {
      // Handle ?channelname format (like ?testtt)
      const channel = search.substring(1); // Remove the ?
      setCurrentChannel(channel);
    } else {
      // Fallback to path-based channels
      const path = window.location.pathname;
      const channel = path === '/' ? 'main' : path.substring(1);
      setCurrentChannel(channel);
    }
  }, []);

  // Auto-scroll is now handled by MessageList component

  const handleLogin = (nick: string) => {
    setCurrentUser(nick);
    localStorage.setItem('chatNickname', nick); // Save nickname
    setShowLoginModal(false);
    setLoginError(null);
    setIsLoggingIn(false); // Reset login flag
    // Don't call login here - let the useEffect handle it
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('chatNickname');
    setIsLoggingIn(false);
    setShowLoginModal(true);
  };

  const handleSendMessage = (content: string | any) => {
    if (currentUser && isConnected) {
      sendMessage(content);
    }
  };

  // Handle file uploads from global drop zone
  const handleGlobalFileUpload = useCallback((file: File) => {
    if (isConnected && currentUser) {
      // Create a file attachment and send it as a message
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const attachment = {
            type: file.type,
            url: e.target.result as string,
            name: file.name,
            size: file.size
          };
          handleSendMessage(attachment);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [isConnected, currentUser, handleSendMessage]);


  // Handle when user scrolls to bottom (indicating they've read messages)
  const handleUserAtBottom = useCallback((isAtBottom: boolean) => {
    if (isAtBottom) {
      clearAll();
    }
  }, [clearAll]);

  const handleTypingChange = (isTyping: boolean) => {
    if (currentUser && isConnected) {
      sendTyping(isTyping);
    }
  };

  // Login when socket connects and we have a user
  useEffect(() => {
    if (currentUser && isConnected && !isLoggingIn) {
      setIsLoggingIn(true);
      chatLogin(currentUser, currentChannel);
    }
  }, [isConnected, currentUser, chatLogin, currentChannel, isLoggingIn]);

  // Show login modal if no user is set
  useEffect(() => {
    if (!currentUser) {
      setShowLoginModal(true);
    }
  }, [currentUser]);


  return (
    <GlobalDropZone onFileUpload={handleGlobalFileUpload}>
      <div className="chat">
        <div className="chat-box">
          {isConnecting && !currentUser && (
            <div className="connecting">
              <LoadingSpinner size="large" />
              <p>Connecting to chat...</p>
              <button
                onClick={() => window.location.reload()}
                style={{ marginTop: '10px', padding: '8px 16px' }}
              >
                Skip & Login
              </button>
            </div>
          )}

          {!isConnected && !isConnecting && (
            <div id="offline">
              <span className="big">Server is offline.</span><br />
              Sorry for that.
              <br />
              <button
                onClick={() => window.location.reload()}
                style={{ marginTop: '10px', padding: '8px 16px' }}
              >
                Retry Connection
              </button>
            </div>
          )}

          {isConnected && currentUser && (
            <div className="messages-container" ref={messagesContainerRef}>
              <MessageList
                messages={messages}
                currentUser={currentUser}
                users={users}
                scrollContainerRef={messagesContainerRef}
                onUserAtBottom={handleUserAtBottom}
                typingUsers={typingUsers}
              />
              <TypingIndicator typingUsers={typingUsers} />
            </div>
          )}

          <div className="chat-form">
            {isConnected && currentUser && (
              <div className="user-section">
                <div className="channel-info">
                  <span className="channel-name">#{currentChannel}</span>
                  <Tooltip title="Copy channel URL">
                    <IconButton
                      onClick={() => {
                        const url = currentChannel === 'main'
                          ? `${window.location.origin}/`
                          : `${window.location.origin}/?${currentChannel}`;
                        navigator.clipboard.writeText(url);
                        setUrlCopied(true);
                        setTimeout(() => setUrlCopied(false), 2000);
                      }}
                      size="small"
                      sx={{
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      {urlCopied ? <CheckIcon /> : <ClipboardIcon />}
                    </IconButton>
                  </Tooltip>
                  <UserList users={users} />
                </div>
                {currentUser && (
                  <div className="user-actions">
                    <span className="current-user">Logged in as: {currentUser}</span>
                    <Tooltip title={soundEnabled ? "Disable notification sound" : "Enable notification sound"}>
                      <IconButton
                        onClick={toggleSound}
                        size="small"
                        sx={{
                          color: soundEnabled ? '#4a9eff' : '#666',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        {soundEnabled ? <VolumeUp /> : <VolumeOff />}
                      </IconButton>
                    </Tooltip>
                    <button onClick={handleLogout} className="logout-button">
                      Logout
                    </button>
                    <Tooltip title={isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}>
                      <div className="connection-status-mobile">
                        <motion.div
                          className="connection-indicator"
                          animate={{
                            backgroundColor: isConnected ? '#4caf50' : '#f44336',
                            scale: isConnected ? 1 : 0.9
                          }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </Tooltip>
                  </div>
                )}
              </div>
            )}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTypingChange={handleTypingChange}
              disabled={!isOnline}
            />
            <motion.div
              className="connection-status connection-status-desktop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{
                  color: isConnected ? '#4caf50' : '#f44336',
                  scale: isConnected ? 1 : 0.9
                }}
                transition={{ duration: 0.2 }}
              >
                <StatusIcon
                  style={{
                    fontSize: '10px',
                    marginRight: '4px'
                  }}
                />
              </motion.div>
              <motion.span
                style={{
                  fontSize: '10px',
                  color: '#888',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
                key={isConnected ? 'connected' : isConnecting ? 'connecting' : 'disconnected'}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
              </motion.span>
            </motion.div>
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onLogin={handleLogin}
          error={loginError || undefined}
        />
      </div>
    </GlobalDropZone>
  );
};