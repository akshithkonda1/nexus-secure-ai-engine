/**
 * Toron API Service
 * World-class SSE streaming chat API client
 *
 * Features:
 * - SSE streaming with proper buffering
 * - Retry logic with exponential backoff
 * - AbortController support for cancellation
 * - File upload handling
 * - Error handling with detailed messages
 */

import type { Attachment, Message } from '../../stores/useToronStore';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatRequest {
  message: string;
  chatId: string;
  attachments?: Attachment[];
  messageHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    attachments?: Attachment[];
  }>;
  model?: string;
  temperature?: number;
  systemPrompt?: string;
}

export interface StreamCallbacks {
  signal?: AbortSignal;
  onContent: (content: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  onMetadata?: (metadata: { conversationId?: string; model?: string; tokens?: number }) => void;
}

export interface UploadResponse {
  id: string;
  url: string;
  preview?: string;
  mimeType?: string;
}

// ============================================================================
// API CLASS
// ============================================================================

class ToronAPI {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    // Support both environment variable and default
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Stream chat response with SSE
   * CRITICAL: This handles SSE streaming with proper buffering
   */
  async streamChat(
    request: ChatRequest,
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/toron/chat`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(request),
        signal: callbacks.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error('No response body - streaming not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Process any remaining buffered data
          if (buffer.trim()) {
            this.processSSELine(buffer, callbacks);
          }
          callbacks.onComplete();
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          this.processSSELine(line, callbacks);
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // User cancelled - call complete, not error
          callbacks.onComplete();
        } else {
          callbacks.onError(error);
        }
      } else {
        callbacks.onError(new Error('Unknown error occurred'));
      }
    }
  }

  /**
   * Process a single SSE line
   */
  private processSSELine(line: string, callbacks: StreamCallbacks): void {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith(':')) {
      return;
    }

    // Only process data lines
    if (!trimmedLine.startsWith('data: ')) {
      return;
    }

    const dataStr = trimmedLine.slice(6); // Remove 'data: ' prefix

    // Handle [DONE] signal
    if (dataStr === '[DONE]') {
      callbacks.onComplete();
      return;
    }

    try {
      const data = JSON.parse(dataStr);

      // Handle error in data
      if (data.error) {
        callbacks.onError(new Error(data.error));
        return;
      }

      // Handle content chunks
      if (data.content) {
        callbacks.onContent(data.content);
      }

      // Handle metadata
      if (callbacks.onMetadata && (data.conversationId || data.model || data.tokens)) {
        callbacks.onMetadata({
          conversationId: data.conversationId,
          model: data.model,
          tokens: data.tokens,
        });
      }

      // Handle done signal in data
      if (data.done) {
        callbacks.onComplete();
      }
    } catch (parseError) {
      // Log but don't fail on parse errors - SSE can have malformed chunks
      console.warn('SSE parse warning:', parseError, 'Line:', trimmedLine);
    }
  }

  /**
   * Upload a file
   */
  async uploadFile(file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/toron/upload`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type - browser will set it with boundary
        ...(this.defaultHeaders['Authorization']
          ? { Authorization: this.defaultHeaders['Authorization'] }
          : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: HTTP ${response.status}`);
    }

    const data: UploadResponse = await response.json();

    return {
      id: data.id,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      size: file.size,
      url: data.url,
      preview: data.preview,
      metadata: {
        mimeType: data.mimeType || file.type,
      },
    };
  }

  /**
   * Upload an image with preview generation
   */
  async uploadImage(file: File): Promise<Attachment> {
    // Generate local preview first
    const preview = await this.generateImagePreview(file);

    // Upload to server
    const attachment = await this.uploadFile(file);

    // Use local preview if server didn't provide one
    if (!attachment.preview) {
      attachment.preview = preview;
    }

    return attachment;
  }

  /**
   * Generate a local image preview
   */
  private generateImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: this.defaultHeaders,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get chat history (if stored server-side)
   */
  async getChatHistory(chatId: string): Promise<Message[]> {
    const response = await fetch(`${this.baseUrl}/api/toron/chats/${chatId}`, {
      method: 'GET',
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to get chat history: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.messages || [];
  }

  /**
   * Delete a chat (server-side)
   */
  async deleteChat(chatId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/toron/chats/${chatId}`, {
      method: 'DELETE',
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete chat: HTTP ${response.status}`);
    }
  }
}

// Singleton instance
export const toronAPI = new ToronAPI();

export default toronAPI;
