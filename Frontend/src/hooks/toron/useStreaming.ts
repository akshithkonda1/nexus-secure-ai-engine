/**
 * useStreaming Hook
 * Manages SSE streaming for Toron AI chat
 *
 * Features:
 * - Optimistic UI updates
 * - Proper abort handling
 * - Error recovery
 * - Streaming state management
 * - Token estimation
 */

import { useCallback, useRef, useState } from 'react';
import { toronAPI } from '../../services/toron/api';
import { useToronStore, type Attachment } from '../../stores/useToronStore';

// ============================================================================
// TYPES
// ============================================================================

interface UseStreamingOptions {
  chatId: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

interface UseStreamingReturn {
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  stopStreaming: () => void;
  isStreaming: boolean;
  error: Error | null;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Estimate token count (rough approximation)
 * ~4 characters per token for English text
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useStreaming({
  chatId,
  onComplete,
  onError,
}: UseStreamingOptions): UseStreamingReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get store actions
  const addMessage = useToronStore(state => state.addMessage);
  const updateMessage = useToronStore(state => state.updateMessage);
  const setStoreStreaming = useToronStore(state => state.setStreaming);
  const chats = useToronStore(state => state.chats);

  // Get current chat
  const currentChat = chats.find(c => c.id === chatId);

  const sendMessage = useCallback(async (
    content: string,
    attachments?: Attachment[]
  ) => {
    if (!chatId) {
      console.error('No chatId provided to useStreaming');
      return;
    }

    // Clear previous error
    setError(null);

    // Add user message immediately (optimistic update)
    addMessage(chatId, {
      role: 'user',
      content,
      attachments,
    });

    // Add assistant placeholder
    addMessage(chatId, {
      role: 'assistant',
      content: '',
      isStreaming: true,
      streamingContent: '',
    });

    // Update streaming state
    setIsStreaming(true);
    setStoreStreaming(true, chatId);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      let fullContent = '';
      const startTime = Date.now();

      // Get the assistant message ID (it's the last one added)
      const chatAfterAdd = useToronStore.getState().chats.find(c => c.id === chatId);
      const lastMessage = chatAfterAdd?.messages[chatAfterAdd.messages.length - 1];
      const actualAssistantMsgId = lastMessage?.id || '';

      await toronAPI.streamChat(
        {
          message: content,
          chatId,
          attachments,
          messageHistory: currentChat?.messages.map(m => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })) || [],
          model: currentChat?.model,
          systemPrompt: currentChat?.systemPrompt,
          temperature: currentChat?.temperature,
        },
        {
          signal: abortControllerRef.current.signal,

          onContent: (chunk: string) => {
            fullContent += chunk;

            // Update message with streamed content
            updateMessage(chatId, actualAssistantMsgId, {
              content: fullContent,
              streamingContent: fullContent,
            });
          },

          onComplete: () => {
            const latency = Date.now() - startTime;

            // Finalize message
            updateMessage(chatId, actualAssistantMsgId, {
              isStreaming: false,
              streamingContent: undefined,
              metadata: {
                latency,
                tokens: estimateTokens(fullContent),
                model: currentChat?.model,
              },
            });

            setIsStreaming(false);
            setStoreStreaming(false);
            onComplete?.();
          },

          onError: (err: Error) => {
            console.error('Streaming error:', err);

            // Mark message as error
            updateMessage(chatId, actualAssistantMsgId, {
              isStreaming: false,
              error: true,
              content: fullContent || 'Sorry, an error occurred while generating a response.',
            });

            setError(err);
            setIsStreaming(false);
            setStoreStreaming(false);
            onError?.(err);
          },

          onMetadata: (metadata) => {
            // Could update chat with conversation ID if needed
            if (metadata.model) {
              updateMessage(chatId, actualAssistantMsgId, {
                metadata: { model: metadata.model },
              });
            }
          },
        }
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');

      if (error.name !== 'AbortError') {
        console.error('Send message error:', error);
        setError(error);
        onError?.(error);
      }

      setIsStreaming(false);
      setStoreStreaming(false);
    }
  }, [chatId, currentChat, addMessage, updateMessage, setStoreStreaming, onComplete, onError]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsStreaming(false);
    setStoreStreaming(false);

    // Update the last message to mark streaming as stopped
    const chat = useToronStore.getState().chats.find(c => c.id === chatId);
    if (chat && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage.isStreaming) {
        updateMessage(chatId, lastMessage.id, {
          isStreaming: false,
          content: lastMessage.content || 'Response stopped by user.',
        });
      }
    }
  }, [chatId, setStoreStreaming, updateMessage]);

  return {
    sendMessage,
    stopStreaming,
    isStreaming,
    error,
  };
}

export default useStreaming;
