import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message, TypingUser } from '../types/chat';
import { EmojiReplacer } from './EmojiReplacer';
import { getUsernameStyle } from '../utils/userColors';
import { FaCopy } from 'react-icons/fa';
import debug from 'debug';

const log = debug('chat:message-list');

interface MessageListProps {
  messages: Message[];
  currentUser: string | null;
  users: string[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onUserAtBottom?: (isAtBottom: boolean) => void;
  typingUsers?: TypingUser[];
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUser,
  users,
  scrollContainerRef,
  onUserAtBottom,
  typingUsers
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Extract text content from message
  const getMessageText = (message: Message): string => {
    if (typeof message.m === 'string') {
      return message.m;
    }
    if (message.m && typeof message.m === 'object') {
      return message.m.text || message.m.name || 'File attachment';
    }
    return '';
  };

  // Copy message to clipboard
  const copyMessage = async (message: Message) => {
    const text = getMessageText(message);
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedMessageId(message.id);
        setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
      } catch (err) {
        log('Failed to copy message:', err);
      }
    }
  };

  // Check if user is at bottom of scroll
  const checkIfAtBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const threshold = 50; // 50px threshold
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const atBottom = distanceFromBottom < threshold;
      //console.log('checkIfAtBottom:', { scrollTop, scrollHeight, clientHeight, distanceFromBottom, atBottom });
      setIsAtBottom(atBottom);
      onUserAtBottom?.(atBottom);
    }
  }, [onUserAtBottom]);

  // Force scroll to bottom (public method)
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    //console.log('scrollToBottom called:', { container: !!container, messagesEndRef: !!messagesEndRef.current });
    if (container) {
      const attemptScroll = () => {
        //console.log('Attempting scroll...');
        // Try scrollIntoView first
        if (messagesEndRef.current) {
          //console.log('Using scrollIntoView');
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Always also try scrollTo as fallback
        // console.log('Using scrollTo, scrollHeight:', container.scrollHeight);
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      };
      
      // Multiple attempts to ensure scroll happens
      attemptScroll();
      requestAnimationFrame(attemptScroll);
      setTimeout(attemptScroll, 10);
      setTimeout(attemptScroll, 50);
      setTimeout(attemptScroll, 100);
      setTimeout(attemptScroll, 200);
    }
  }, []);


  // Auto-scroll when messages change and user is at bottom
  useEffect(() => {
    //console.log('Auto-scroll check:', { isAtBottom, messageCount: messages.length });
    if (isAtBottom && messages.length > 0) {
      //console.log('Auto-scrolling to bottom...');
      scrollToBottom();
    }
  }, [messages, isAtBottom, scrollToBottom]);

  // Add scroll event listener and other scroll triggers
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => checkIfAtBottom();
      const handleResize = () => {
        // Check if we should scroll after resize
        setTimeout(() => {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const threshold = 50;
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
          const atBottom = distanceFromBottom < threshold;
          if (atBottom) {
            scrollToBottom();
          }
        }, 100);
      };
      
      container.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      
      // Initial check
      checkIfAtBottom();
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [scrollContainerRef, checkIfAtBottom, scrollToBottom]);

  // Check if at bottom when messages change
  useEffect(() => {
    checkIfAtBottom();
  }, [messages, checkIfAtBottom]);

  // Auto-scroll when typing indicators change (if user is at bottom)
  useEffect(() => {
    if (isAtBottom && typingUsers && typingUsers.length > 0) {
      scrollToBottom();
    }
  }, [typingUsers, isAtBottom, scrollToBottom]);

  // Extract copy button component
  const CopyButton: React.FC<{ message: Message; isCopied: boolean }> = ({ message, isCopied }) => {
    const messageText = getMessageText(message);
    
    if (!messageText) return null;
    
    return (
      <motion.button
        className={`copy-button ${isCopied ? 'copied' : ''}`}
        onClick={() => copyMessage(message)}
        title={isCopied ? 'Copied!' : 'Copy message'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <FaCopy />
        <AnimatePresence>
          {isCopied && (
            <motion.span 
              className="copy-feedback"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              Copied!
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  // Extract motion props
  const messageMotionProps = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { 
      duration: 0.3, 
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    },
    layout: true
  };

  const renderMessage = (message: Message, _index: number) => {
    const fromSelf = currentUser === message.f;
    const isCopied = copiedMessageId === message.id;

    return (
      <motion.div 
        key={message.id}
        className={`message-item ${fromSelf ? 'message-from-self' : 'message-from-peer'}`}
        {...messageMotionProps}
      >
        <div className="message-header">
          <span 
            className="username" 
            style={getUsernameStyle(message.f, users)}
          >
            {message.f}
          </span>
          <span className="timestamp">
            {message.t ? new Date(message.t).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'now'}
          </span>
        </div>
        <div className="message-content">
          <div className="message-text">
            <EmojiReplacer content={message.m} />
          </div>
          <CopyButton message={message} isCopied={isCopied} />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="message-list">
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => renderMessage(message, index))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};