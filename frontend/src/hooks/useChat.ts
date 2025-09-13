import { useState, useEffect, useCallback } from 'react';
import { initChat, login, sendChatMessage, sendTyping, cleanup } from '../services/chatService';
import type { Message, TypingUser } from '../types/chat';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    initChat({
      onMessage: (message: Message) => {
        setMessages(prev => [...prev, message]);
      },
      onUserJoined: (user: string) => {
        setUsers(prev => [...prev, user]);
      },
      onUserLeft: (user: string) => {
        setUsers(prev => prev.filter(u => u !== user));
      },
      onUserList: (users: string[]) => {
        setUsers(users);
      },
      onTyping: (typingUsers: TypingUser[]) => {
        setTypingUsers(typingUsers);
      },
      onConnect: () => {
        setIsConnected(true);
        setIsConnecting(false);
      },
      onDisconnect: () => {
        setIsConnected(false);
        setIsConnecting(false);
      },
    });

    return () => {
      cleanup();
    };
  }, []);

  const loginToChat = useCallback((nick: string, channel: string = 'main') => {
    login(nick, channel);
  }, []);

  const sendMessage = useCallback((content: string | object) => {
    sendChatMessage(content);
  }, []);

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    sendTyping(isTyping);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    users,
    typingUsers,
    isConnected,
    isConnecting,
    login: loginToChat,
    sendMessage,
    sendTyping: sendTypingStatus,
    clearMessages,
  };
};
