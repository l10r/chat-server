import CryptoJS from 'crypto-js';

// Simple encryption utility following KISS principle
export interface EncryptionKeys {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  content: string;
  iv: string;
  timestamp: number;
}

// Generate a simple key pair (using AES key as both public/private for simplicity)
export const generateKeys = (): EncryptionKeys => {
  const key = CryptoJS.lib.WordArray.random(256/8).toString();
  return {
    publicKey: key,
    privateKey: key
  };
};

// Encrypt message with recipient's public key
export const encryptMessage = (message: string, recipientPublicKey: string): EncryptedMessage => {
  const iv = CryptoJS.lib.WordArray.random(128/8);
  const encrypted = CryptoJS.AES.encrypt(message, recipientPublicKey, { iv });
  
  return {
    content: encrypted.toString(),
    iv: iv.toString(),
    timestamp: Date.now()
  };
};

// Decrypt message with own private key
export const decryptMessage = (encryptedMessage: EncryptedMessage, privateKey: string): string => {
  const iv = CryptoJS.enc.Hex.parse(encryptedMessage.iv);
  const decrypted = CryptoJS.AES.decrypt(encryptedMessage.content, privateKey, { iv });
  
  return decrypted.toString(CryptoJS.enc.Utf8);
};

// Check if message is encrypted
export const isEncrypted = (message: any): message is EncryptedMessage => {
  return message && typeof message === 'object' && 'content' in message && 'iv' in message;
};

// Store keys in localStorage (simple approach)
export const storeKeys = (keys: EncryptionKeys): void => {
  localStorage.setItem('chat_encryption_keys', JSON.stringify(keys));
};

export const loadKeys = (): EncryptionKeys | null => {
  const stored = localStorage.getItem('chat_encryption_keys');
  return stored ? JSON.parse(stored) : null;
};

// Generate or load existing keys
export const getOrCreateKeys = (): EncryptionKeys => {
  let keys = loadKeys();
  if (!keys) {
    keys = generateKeys();
    storeKeys(keys);
  }
  return keys;
};
