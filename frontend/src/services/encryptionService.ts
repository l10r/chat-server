import { 
  generateKeys, 
  encryptMessage, 
  decryptMessage, 
  isEncrypted, 
  getOrCreateKeys,
  type EncryptionKeys,
  type EncryptedMessage 
} from '../utils/encryption';

// Simple encryption service following KISS principle
class EncryptionService {
  private keys: EncryptionKeys | null = null;
  private userKeys: Map<string, string> = new Map();

  // Initialize encryption for current user
  init(): void {
    this.keys = getOrCreateKeys();
  }

  // Get current user's public key
  getPublicKey(): string | null {
    return this.keys?.publicKey || null;
  }

  // Store another user's public key
  setUserPublicKey(userId: string, publicKey: string): void {
    this.userKeys.set(userId, publicKey);
  }

  // Get another user's public key
  getUserPublicKey(userId: string): string | null {
    return this.userKeys.get(userId) || null;
  }

  // Encrypt message for a specific user
  encryptForUser(message: string, userId: string): EncryptedMessage | null {
    const userPublicKey = this.getUserPublicKey(userId);
    if (!userPublicKey) {
      console.warn(`No public key found for user: ${userId}`);
      return null;
    }
    
    return encryptMessage(message, userPublicKey);
  }

  // Decrypt message from any user
  decryptMessage(encryptedData: any): string | null {
    if (!isEncrypted(encryptedData)) {
      return encryptedData; // Return as-is if not encrypted
    }

    if (!this.keys?.privateKey) {
      console.warn('No private key available for decryption');
      return null;
    }

    try {
      return decryptMessage(encryptedData, this.keys.privateKey);
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      return null;
    }
  }

  // Check if encryption is available
  isEncryptionAvailable(): boolean {
    return this.keys !== null;
  }

  // Get encryption status for UI
  getEncryptionStatus(): { enabled: boolean; hasKeys: boolean } {
    return {
      enabled: this.isEncryptionAvailable(),
      hasKeys: this.userKeys.size > 0
    };
  }
}

// Export singleton instance (DRY principle)
export const encryptionService = new EncryptionService();
