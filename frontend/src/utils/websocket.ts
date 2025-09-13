// Simple WebSocket utilities
import debug from 'debug';

const log = debug('chat:websocket');

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

let ws: WebSocket | null = null;
let callbacks: {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
} = {};

export const connectWebSocket = (url: string, cb: typeof callbacks) => {
  callbacks = cb;
  log('Connecting to WebSocket:', url);
  ws = new WebSocket(url);
  
  ws.onopen = () => {
    log('WebSocket connected successfully');
    callbacks.onOpen?.();
  };
  
  ws.onclose = (event) => {
    log('WebSocket disconnected:', event.code, event.reason);
    callbacks.onClose?.();
  };
  
  ws.onerror = (error) => {
    log('WebSocket error:', error);
    callbacks.onError?.(error);
  };
  
  ws.onmessage = (event) => {
    //console.log('Received message:', event.data);
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      //console.log('Parsed message:', message);
      callbacks.onMessage?.(message);
    } catch (error) {
      log('Error parsing message:', error);
    }
  };
};

export const sendMessage = (message: WebSocketMessage) => {
  //console.log('Sending message:', message);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
    //console.log('Message sent successfully');
  } else {
   // console.warn('WebSocket not connected, cannot send message');
  }
};

export const disconnectWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};

export const isConnected = () => ws?.readyState === WebSocket.OPEN;
