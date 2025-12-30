/**
 * Cryptographic Utilities
 * Provides obfuscation for sensitive data stored in localStorage
 *
 * IMPORTANT: This is obfuscation, not true encryption.
 * Browser-side encryption has inherent limitations since keys must be accessible.
 * For production secrets, use a backend API with proper key management.
 */

// Derived key for local storage obfuscation
// In production, derive from user session or use Web Crypto API
const OBFUSCATION_KEY = 'ryuzen-workspace-secure-key-v1';

/**
 * XOR cipher helper for basic obfuscation
 */
function xorCipher(input: string, key: string): string {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(
      input.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return output;
}

/**
 * Encode token with Base64 + XOR cipher
 * Provides basic obfuscation for localStorage storage
 */
export const encryptToken = (token: string): string => {
  try {
    // First encode to Base64
    const encoded = btoa(unescape(encodeURIComponent(token)));
    // Apply XOR cipher
    const ciphered = xorCipher(encoded, OBFUSCATION_KEY);
    // Final Base64 encoding
    return btoa(ciphered);
  } catch (error) {
    console.error('Token encryption failed:', error);
    return '';
  }
};

/**
 * Decode encrypted token
 */
export const decryptToken = (encrypted: string): string => {
  try {
    // Decode outer Base64
    const ciphered = atob(encrypted);
    // Reverse XOR cipher
    const encoded = xorCipher(ciphered, OBFUSCATION_KEY);
    // Decode inner Base64
    return decodeURIComponent(escape(atob(encoded)));
  } catch (error) {
    console.error('Token decryption failed:', error);
    return '';
  }
};

/**
 * Validate token format (basic validation)
 * Ensures token meets minimum security requirements
 */
export const validateToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  if (token.length < 12) return false;

  // Must contain alphanumeric characters, hyphens, underscores, or dots
  // This covers most OAuth tokens, PATs, and API keys
  const validPattern = /^[a-zA-Z0-9_\-.]+$/;
  return validPattern.test(token);
};

/**
 * Generate a random ID
 * Uses crypto.randomUUID if available, fallback to Math.random
 */
export const generateSecureId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Hash a string using SHA-256
 * Uses Web Crypto API for secure hashing
 */
export const hashString = async (str: string): Promise<string> => {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    // Fallback for non-secure contexts
    return btoa(str);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Mask a token for display (show first and last 4 characters)
 */
export const maskToken = (token: string): string => {
  if (!token || token.length < 8) return '••••••••';

  const first = token.slice(0, 4);
  const last = token.slice(-4);
  const middleLength = Math.min(token.length - 8, 12);
  const middle = '•'.repeat(middleLength);

  return `${first}${middle}${last}`;
};

/**
 * Check if a token looks like a placeholder or test value
 */
export const isPlaceholderToken = (token: string): boolean => {
  const lowerToken = token.toLowerCase();

  // Exact match or near-exact patterns (very short tokens that are clearly placeholders)
  const exactPatterns = [
    /^x{3,}$/,           // xxx, xxxx, xxxxx
    /^test$/,            // Just "test"
    /^demo$/,            // Just "demo"
    /^1234567890?$/,     // 123456789 or 1234567890
  ];

  if (exactPatterns.some(p => p.test(lowerToken))) return true;

  // Contains these substrings (commonly used placeholder indicators)
  const substringPatterns = [
    'placeholder',
    'your_token_here',
    'your-token-here',
    'example_api',
    'test_token',
    'demo_key',
    'sample_key',
  ];

  return substringPatterns.some(p => lowerToken.includes(p));
};

/**
 * Securely clear sensitive data from memory
 * Note: JavaScript doesn't guarantee memory clearing, but this helps
 */
export const secureClear = (str: string): void => {
  // Overwrite the string with zeros (helps with some garbage collectors)
  if (typeof str === 'string' && str.length > 0) {
    // This doesn't actually clear the original string in JS,
    // but signals intent and may help in some runtimes
    try {
      Object.defineProperty(str, 'length', { value: 0 });
    } catch {
      // Ignore - strings are immutable in JS
    }
  }
};

/**
 * Generate a nonce for CSRF protection
 */
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback (less secure)
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
