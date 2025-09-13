import { connectWebSocket, sendMessage, disconnectWebSocket, isConnected } from '../utils/websocket';
import type { WebSocketMessage } from '../utils/websocket';
import type { Message, TypingUser } from '../types/chat';
import { encryptionService } from './encryptionService';
import debug from 'debug';

const log = debug('chat:service');

// Generate WebSocket URL based on environment and current location
const getWebSocketUrl = (): string => {
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    const url = 'ws://localhost:8090/ws';
    log('Development mode - using WebSocket URL:', url);
    return url;
  }
  
  // Production: derive from current location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const url = `${protocol}//${host}/ws`;
    log('Production mode - using WebSocket URL:', url);
  return url;
};

let currentUser: string | null = null;
let typingUsers: Map<string, boolean> = new Map();

export const initChat = (callbacks: {
  onMessage?: (message: Message) => void;
  onUserJoined?: (user: string) => void;
  onUserLeft?: (user: string) => void;
  onUserList?: (users: string[]) => void;
  onTyping?: (typingUsers: TypingUser[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}) => {
  // Initialize encryption service
  encryptionService.init();
  connectWebSocket(getWebSocketUrl(), {
    onOpen: () => {
      log('Connected to chat server');
      callbacks.onConnect?.();
    },
    onClose: () => {
      log('Disconnected from chat server');
      callbacks.onDisconnect?.();
    },
    onError: (error) => {
      log('Chat error:', error);
    },
    onMessage: (message: WebSocketMessage) => {
      switch (message.type) {
        case 'new-msg':
          if (message.message) {
            // Try to decrypt message if it's encrypted
            const decryptedContent = encryptionService.decryptMessage(message.message.m);
            if (decryptedContent !== null) {
              message.message.m = decryptedContent;
            }
            callbacks.onMessage?.(message.message);
          }
          break;
        case 'userlist':
          if (message.users) {
            callbacks.onUserList?.(message.users);
          }
          break;
        case 'userjoin':
          if (message.user) {
            callbacks.onUserJoined?.(message.user);
          }
          break;
        case 'userleave':
          if (message.user) {
            callbacks.onUserLeft?.(message.user);
          }
          break;
        case 'typing':
          if (message.user && typeof message.typing === 'boolean') {
            typingUsers.set(message.user, message.typing);
            const typingList: TypingUser[] = [];
            typingUsers.forEach((isTyping, user) => {
              if (isTyping && user !== currentUser) {
                typingList.push({ nick: user, status: true });
              }
            });
            callbacks.onTyping?.(typingList);
          }
          break;
      }
    },
  });
};

export const login = (nick: string, channel: string = 'main') => {
  currentUser = nick;
  sendMessage({
    type: 'login',
    nick,
    channel,
  });
};

export const sendChatMessage = (content: string | object) => {
  // For now, send as plain text (encryption will be added when we have user keys)
  sendMessage({
    type: 'message',
    data: content,
  });
};

export const sendTyping = (isTyping: boolean) => {
  sendMessage({
    type: 'typing',
    typing: isTyping,
  });
};

export const cleanup = () => {
  disconnectWebSocket();
};

export const getConnectionStatus = () => ({
  isConnected: isConnected(),
  isConnecting: false, // Simplified
});

// Encryption functions
export const getEncryptionStatus = () => encryptionService.getEncryptionStatus();
export const getPublicKey = () => encryptionService.getPublicKey();
export const setUserPublicKey = (userId: string, publicKey: string) => encryptionService.setUserPublicKey(userId, publicKey);
