export interface Message {
  id: string;
  f: string; // from (nickname)
  t: number; // timestamp
  m: string | {
    text?: string;
    type?: string;
    name?: string;
    url?: string;
    blob?: Blob;
    duration?: number;
    size?: number;
  };
}

export interface User {
  nick: string;
}

export interface TypingUser {
  nick: string;
  status: boolean;
}

export interface ChatState {
  isOnline: boolean;
  isFocused: boolean;
  isTyping: boolean;
  messages: Message[];
  users: string[];
  typingUsers: string[];
  currentUser: string | null;
  lastSentNick: string | null;
}

export interface NotificationState {
  enabled: boolean;
  msgs: number;
  active: Notification | null;
}