import { FormEvent, useEffect, useRef, useState, useCallback } from "react";
import { Send, StopCircle, Sparkles, Copy, RotateCcw, ThumbsUp, ThumbsDown, MoreVertical, Check } from "lucide-react";
import { cn, bg, text, border } from "../utils/theme";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  error?: boolean;
}

interface ToronAPIResponse {
  message: string;
  messageId: string;
  conversationId: string;
}

export default function ToronPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Generate unique message ID
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle textarea auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  // Handle Enter key to send (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Stop streaming response
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Send message to backend
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isStreaming) return;

    // Add user message immediately
    const userMsgId = generateMessageId();
    const newUserMessage: Message = {
      id: userMsgId,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsStreaming(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Create assistant message placeholder
    const assistantMsgId = generateMessageId();
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // TODO: Replace with your actual backend endpoint
      const response = await fetch('/api/toron/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId: conversationId || undefined,
          messageHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = "";
      let newConversationId = conversationId;

      // Read streaming response
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.conversationId) {
                newConversationId = data.conversationId;
              }

              if (data.content) {
                fullContent += data.content;
                
                // Update streaming message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              }

              if (data.done) {
                break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // Update conversation ID if new
      if (newConversationId && newConversationId !== conversationId) {
        setConversationId(newConversationId);
      }

      // Finalize message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Handle abort
      if (error.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { 
                  ...msg, 
                  content: msg.content || "Response stopped by user.",
                  isStreaming: false 
                }
              : msg
          )
        );
      } else {
        // Handle error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: "I apologize, but I encountered an error. Please try again.",
                  isStreaming: false,
                  error: true,
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      
      // Refocus input
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  };

  // Copy message content
  const handleCopy = useCallback((messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Regenerate response
  const handleRegenerate = useCallback((messageIndex: number) => {
    // Find the user message before this assistant message
    const userMessage = messages[messageIndex - 1];
    if (userMessage && userMessage.role === 'user') {
      // Remove the last assistant message and regenerate
      setMessages(prev => prev.slice(0, messageIndex));
      setInput(userMessage.content);
      
      // Trigger regeneration
      setTimeout(() => {
        inputRef.current?.focus();
        // Optionally auto-submit
        // handleSubmit(new Event('submit') as any);
      }, 100);
    }
  }, [messages]);

  // Handle feedback (thumbs up/down)
  const handleFeedback = useCallback((messageId: string, feedback: 'up' | 'down') => {
    // TODO: Send feedback to backend
    console.log(`Feedback for ${messageId}: ${feedback}`);
    
    // Example API call:
    // fetch('/api/toron/feedback', {
    //   method: 'POST',
    //   body: JSON.stringify({ messageId, feedback }),
    // });
  }, []);

  // New conversation
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setConversationId("");
    setInput("");
    inputRef.current?.focus();
  }, []);

  return (
    <section className="flex h-full flex-col">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={cn('text-3xl font-semibold', text.primary)}>Toron</h1>
            <div className="flex h-6 items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-2">
              <Sparkles className="h-3 w-3 text-white" />
              <span className="ml-1 text-xs font-semibold text-white">AI</span>
            </div>
          </div>
          <p className={cn('mt-1 text-sm', text.tertiary)}>
            Precision dialogue for decisive action.
          </p>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              'border',
              border.subtle,
              text.primary,
              'hover:bg-gray-100 dark:hover:bg-slate-800'
            )}
          >
            New Chat
          </button>
        )}
      </header>

      {/* Messages Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className={cn(
          'flex flex-1 flex-col overflow-y-auto rounded-2xl border p-6',
          border.subtle,
          bg.surface
        )}>
          {messages.length === 0 ? (
            // Empty state
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className={cn(
                'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600'
              )}>
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className={cn('mb-2 text-2xl font-semibold', text.primary)}>
                How can I help you today?
              </h2>
              <p className={cn('mb-8 text-center text-sm', text.tertiary)}>
                Ask me anything, and I'll provide precise, actionable responses.
              </p>
              
              {/* Suggested prompts */}
              <div className="grid w-full max-w-2xl grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  "Analyze yesterday's workspace updates",
                  "Create a project timeline for Q1",
                  "Review team performance metrics",
                  "Suggest workflow optimizations",
                ].map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className={cn(
                      'rounded-xl border p-4 text-left text-sm transition-all',
                      border.subtle,
                      bg.muted,
                      text.secondary,
                      'hover:border-blue-500 hover:shadow-md'
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Messages
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    'group relative',
                    message.role === 'user' ? 'flex justify-end' : ''
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-5 py-4 transition-all',
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                        : cn(
                            'border',
                            border.subtle,
                            bg.muted,
                            text.primary,
                            message.error && 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          )
                    )}
                  >
                    {/* Message header */}
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={cn(
                          'text-xs font-semibold uppercase tracking-wider',
                          message.role === 'user'
                            ? 'text-white/70'
                            : text.muted
                        )}
                      >
                        {message.role === 'assistant' ? 'Toron' : 'You'}
                      </span>
                      <span
                        className={cn(
                          'text-xs',
                          message.role === 'user'
                            ? 'text-white/60'
                            : text.muted
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Message content */}
                    <div className={cn(
                      'prose prose-sm max-w-none',
                      message.role === 'user' && 'prose-invert'
                    )}>
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                        {message.isStreaming && (
                          <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current" />
                        )}
                      </p>
                    </div>

                    {/* Assistant message actions */}
                    {message.role === 'assistant' && !message.isStreaming && (
                      <div className="mt-3 flex items-center gap-1 border-t border-gray-200 pt-3 opacity-0 transition-opacity group-hover:opacity-100 dark:border-slate-700">
                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'hover:bg-gray-200 dark:hover:bg-slate-700'
                          )}
                          title="Copy"
                        >
                          {copiedId === message.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className={cn('h-4 w-4', text.muted)} />
                          )}
                        </button>

                        <button
                          onClick={() => handleRegenerate(index)}
                          className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'hover:bg-gray-200 dark:hover:bg-slate-700'
                          )}
                          title="Regenerate"
                        >
                          <RotateCcw className={cn('h-4 w-4', text.muted)} />
                        </button>

                        <button
                          onClick={() => handleFeedback(message.id, 'up')}
                          className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'hover:bg-gray-200 dark:hover:bg-slate-700'
                          )}
                          title="Good response"
                        >
                          <ThumbsUp className={cn('h-4 w-4', text.muted)} />
                        </button>

                        <button
                          onClick={() => handleFeedback(message.id, 'down')}
                          className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'hover:bg-gray-200 dark:hover:bg-slate-700'
                          )}
                          title="Bad response"
                        >
                          <ThumbsDown className={cn('h-4 w-4', text.muted)} />
                        </button>

                        <button
                          className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'hover:bg-gray-200 dark:hover:bg-slate-700'
                          )}
                          title="More options"
                        >
                          <MoreVertical className={cn('h-4 w-4', text.muted)} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className={cn(
            'relative overflow-hidden rounded-2xl border transition-colors',
            border.subtle,
            bg.surface,
            'focus-within:border-blue-600 dark:focus-within:border-blue-500'
          )}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isStreaming}
              className={cn(
                'w-full resize-none bg-transparent px-6 py-4 text-base outline-none',
                text.primary,
                'placeholder:text-gray-400 dark:placeholder:text-slate-500',
                'disabled:opacity-50'
              )}
              placeholder="Ask Toron anything..."
              style={{ maxHeight: '200px' }}
            />

            {/* Input actions */}
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className={cn('text-xs', text.muted)}>
                  {isStreaming ? 'Toron is thinking...' : 'Press Enter to send, Shift+Enter for new line'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopStreaming}
                    className={cn(
                      'flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all',
                      'hover:bg-red-700 hover:shadow-lg'
                    )}
                  >
                    <StopCircle className="h-4 w-4" />
                    Stop
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={cn(
                      'flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white transition-all',
                      'hover:shadow-lg hover:scale-[1.02]',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                    )}
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Character count / info */}
          {input.length > 0 && (
            <div className="mt-2 flex justify-end">
              <span className={cn('text-xs', text.muted)}>
                {input.length} characters
              </span>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
