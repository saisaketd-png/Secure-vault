import CryptoJS from 'crypto-js';

// Helper for Base64 ArrayBuffer
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export class EncryptionService {
  // Legacy Crypto-JS fallback
  private static legacyDeriveKey(masterPassword: string, salt: string): string {
    return CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
  }

  private static legacyDecrypt(ciphertext: string, masterPassword: string): string {
    const [salt, encrypted] = ciphertext.split(':');
    if (!salt || !encrypted) throw new Error('Invalid legacy encrypted data format');
    
    const key = this.legacyDeriveKey(masterPassword, salt);
    const decrypted = CryptoJS.AES.decrypt(encrypted, key);
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!plaintext) throw new Error('Legacy decryption failed');
    return plaintext;
  }

  // Modern WebCrypto implementation
  private static async getWebCryptoKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(masterPassword),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // 100k iterations is much stronger
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(plaintext: string, masterPassword: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM standard IV size
    
    const key = await this.getWebCryptoKey(masterPassword, salt);
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      new TextEncoder().encode(plaintext)
    );

    // Format: v2:salt:iv:ciphertext (all base64)
    return `v2:${arrayBufferToBase64(salt)}:${arrayBufferToBase64(iv)}:${arrayBufferToBase64(encryptedBuffer)}`;
  }

  static async decrypt(ciphertext: string, masterPassword: string): Promise<string> {
    try {
      // Check if it's the new v2 format
      if (ciphertext.startsWith('v2:')) {
        const [, saltB64, ivB64, encryptedB64] = ciphertext.split(':');
        const salt = new Uint8Array(base64ToArrayBuffer(saltB64));
        const iv = new Uint8Array(base64ToArrayBuffer(ivB64));
        const encryptedBuffer = base64ToArrayBuffer(encryptedB64);

        const key = await this.getWebCryptoKey(masterPassword, salt);
        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          encryptedBuffer
        );
        return new TextDecoder().decode(decryptedBuffer);
      }
      
      // Fallback to legacy
      return this.legacyDecrypt(ciphertext, masterPassword);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data. Invalid master password or corrupted data.');
    }
  }
}

export const calculatePasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  
  const hasVariety = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password)
  ].filter(Boolean).length;
  
  if (hasVariety >= 3) score += 10;
  if (hasVariety === 4) score += 10;
  
  if (score < 40) return { score, label: 'Weak', color: 'bg-destructive' };
  if (score < 60) return { score, label: 'Fair', color: 'bg-warning' };
  if (score < 80) return { score, label: 'Good', color: 'bg-info' };
  return { score, label: 'Strong', color: 'bg-success' };
};

export const generatePassword = (length: number = 16, options: {
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
} = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
}): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let charset = '';
  if (options.uppercase) charset += uppercase;
  if (options.lowercase) charset += lowercase;
  if (options.numbers) charset += numbers;
  if (options.symbols) charset += symbols;
  
  if (charset.length === 0) charset = lowercase;
  
  let password = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  
  return password;
};