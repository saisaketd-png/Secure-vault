import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static deriveKey(masterPassword: string, salt: string): string {
    return CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
  }

  static encrypt(plaintext: string, masterPassword: string): string {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const key = this.deriveKey(masterPassword, salt);
    const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();
    return `${salt}:${encrypted}`;
  }

  static decrypt(ciphertext: string, masterPassword: string): string {
    try {
      const [salt, encrypted] = ciphertext.split(':');
      if (!salt || !encrypted) throw new Error('Invalid encrypted data format');
      
      const key = this.deriveKey(masterPassword, salt);
      const decrypted = CryptoJS.AES.decrypt(encrypted, key);
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!plaintext) throw new Error('Decryption failed');
      return plaintext;
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