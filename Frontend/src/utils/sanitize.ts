/**
 * Input Sanitization Utilities
 * Prevents XSS and other injection attacks
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 * Only allows safe formatting tags
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize rich HTML content (for markdown output)
 * Allows more tags for rendered markdown
 */
export const sanitizeRichHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'b', 'i', 'em', 'strong', 'u', 's', 'strike',
      'a', 'img',
      'ul', 'ol', 'li',
      'blockquote',
      'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize plain text (escape HTML entities)
 * Use when displaying user input as text content
 */
export const sanitizeText = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Escape text for safe inclusion in HTML attributes
 */
export const escapeAttribute = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Validate and sanitize URL
 * Only allows http/https protocols
 */
export const sanitizeURL = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user input for list/task items
 * Removes potentially dangerous characters while preserving formatting
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 1000); // Limit length
};

/**
 * Sanitize filename
 * Removes characters that could cause path traversal or other issues
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\.\./g, '')
    .trim()
    .slice(0, 255);
};

/**
 * Check if string contains potential script injection
 */
export const containsScriptInjection = (text: string): boolean => {
  const dangerousPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /data:/i,
    /vbscript:/i,
  ];

  return dangerousPatterns.some(pattern => pattern.test(text));
};

/**
 * Remove all HTML tags from string
 */
export const stripHTML = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};
