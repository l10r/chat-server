import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TypingUser } from '../types/chat';
import { getUsernameStyle } from '../utils/userColors';

interface TypingIndicatorProps {
  typingUsers?: TypingUser[];
  users: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers, users }) => {
  // Add null/undefined checks to prevent TypeError
  if (!typingUsers || typingUsers.length === 0) return null;

  return (
    <AnimatePresence>
      {typingUsers && typingUsers.length > 0 && (
        <motion.div 
          className="typing-indicator"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {typingUsers.map((user) => (
            <motion.div 
              key={user.nick} 
              className="typing-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <span 
                className="prefix" 
                style={getUsernameStyle(user.nick, users)}
              >
                {user.nick}
              </span>
              <div className="message">
                <span className="body writing">
                  <motion.span 
                    className="one"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  >•</motion.span>
                  <motion.span 
                    className="two"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  >•</motion.span>
                  <motion.span 
                    className="three"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  >•</motion.span>
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};