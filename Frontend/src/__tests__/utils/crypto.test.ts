/**
 * Crypto Utility Tests
 * Tests for token encryption and validation
 */

import { describe, it, expect } from 'vitest';
import {
  encryptToken,
  decryptToken,
  validateToken,
  maskToken,
  isPlaceholderToken,
  generateSecureId,
  generateNonce,
} from '../../utils/crypto';

describe('Crypto Utilities', () => {
  describe('encryptToken / decryptToken', () => {
    it('should encrypt and decrypt a token correctly', () => {
      const originalToken = 'ghp_1234567890abcdefghijklmnop';

      const encrypted = encryptToken(originalToken);
      expect(encrypted).not.toBe(originalToken);
      expect(encrypted.length).toBeGreaterThan(0);

      const decrypted = decryptToken(encrypted);
      expect(decrypted).toBe(originalToken);
    });

    it('should handle special characters', () => {
      const tokenWithSpecialChars = 'token-with_special.chars';

      const encrypted = encryptToken(tokenWithSpecialChars);
      const decrypted = decryptToken(encrypted);

      expect(decrypted).toBe(tokenWithSpecialChars);
    });

    it('should handle empty string gracefully', () => {
      const encrypted = encryptToken('');
      expect(encrypted).toBe('');
    });

    it('should return empty string for invalid encrypted data', () => {
      const decrypted = decryptToken('invalid-base64-data!!!');
      expect(decrypted).toBe('');
    });
  });

  describe('validateToken', () => {
    it('should validate a proper token', () => {
      expect(validateToken('ghp_1234567890abcdef')).toBe(true);
      expect(validateToken('sk-proj-abc123xyz789')).toBe(true);
      expect(validateToken('token_with_underscore-and-dash.dot')).toBe(true);
    });

    it('should reject tokens that are too short', () => {
      expect(validateToken('short')).toBe(false);
      expect(validateToken('abc123')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(validateToken(null as unknown as string)).toBe(false);
      expect(validateToken(undefined as unknown as string)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateToken('')).toBe(false);
    });

    it('should reject tokens with invalid characters', () => {
      expect(validateToken('token with spaces')).toBe(false);
      expect(validateToken('token<script>alert(1)</script>')).toBe(false);
    });
  });

  describe('maskToken', () => {
    it('should mask a token showing first and last 4 characters', () => {
      const token = 'ghp_1234567890abcdefghijklmnop';
      const masked = maskToken(token);

      expect(masked).toMatch(/^ghp_.*mnop$/);
      expect(masked).toContain('••••');
    });

    it('should handle short tokens', () => {
      const shortToken = 'abc';
      const masked = maskToken(shortToken);

      expect(masked).toBe('••••••••');
    });

    it('should handle empty tokens', () => {
      const masked = maskToken('');
      expect(masked).toBe('••••••••');
    });
  });

  describe('isPlaceholderToken', () => {
    it('should detect placeholder tokens', () => {
      expect(isPlaceholderToken('xxxxx')).toBe(true);
      expect(isPlaceholderToken('test_token')).toBe(true);
      expect(isPlaceholderToken('demo_key')).toBe(true);
      expect(isPlaceholderToken('your_token_here')).toBe(true);
      expect(isPlaceholderToken('example_api_key')).toBe(true);
      expect(isPlaceholderToken('placeholder123')).toBe(true);
      expect(isPlaceholderToken('xxx')).toBe(true);
      expect(isPlaceholderToken('123456789')).toBe(true);
    });

    it('should not flag real-looking tokens', () => {
      expect(isPlaceholderToken('ghp_1234567890abcdef')).toBe(false);
      expect(isPlaceholderToken('sk-proj-abc123xyz789def456')).toBe(false);
      expect(isPlaceholderToken('xoxb-123456789012-1234567890123-abc')).toBe(false);
    });
  });

  describe('generateSecureId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();

      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
    });

    it('should generate valid UUID format when crypto.randomUUID is available', () => {
      const id = generateSecureId();
      // UUID v4 format or fallback format
      expect(id).toMatch(/^[a-f0-9-]+$/i);
    });
  });

  describe('generateNonce', () => {
    it('should generate a nonce of correct length', () => {
      const nonce = generateNonce();
      expect(nonce.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it('should generate unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });

    it('should only contain hex characters', () => {
      const nonce = generateNonce();
      expect(nonce).toMatch(/^[a-f0-9]+$/);
    });
  });
});
