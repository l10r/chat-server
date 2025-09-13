// Debug configuration for the chat application
// This file sets up debug logging for different parts of the application

import debug from 'debug';

// Enable debug logging in development
if (import.meta.env.DEV) {
  // Enable all chat-related debug logs
  debug.enabled('chat:*');
  
  // You can also enable specific modules:
  // debug.enabled('chat:audio-player');
  // debug.enabled('chat:voice-memo');
  // debug.enabled('chat:notifications');
}

export default debug;
