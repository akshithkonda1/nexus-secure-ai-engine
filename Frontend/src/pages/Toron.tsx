import { FormEvent, useEffect, useRef, useState, useCallback } from "react";
import { 
  Send, 
  StopCircle, 
  Sparkles, 
  Copy, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  MoreVertical, 
  Check,
  Plus,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Github,
  FolderOpen,
  Link2,
  Code,
  Database,
  Globe,
  MessageSquarePlus
} from "lucide-react";
import { cn, bg, text, border } from "../utils/theme";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  error?: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'image' | 'github' | 'drive' | 'url';
  size?: number;
  url?: string;
  preview?: string;
}

interface Integration {
  id: string;
  name: string;
  icon: any;
  connected: boolean;
  description: string;
}

export default function ToronPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Available integrations
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      connected: false,
      description: 'Access repositories and code'
    },
    {
      id: 'drive',
      name: 'Google Drive',
      icon: FolderOpen,
      connected: false,
      description: 'Search and attach files'
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: FileText,
      connected: false,
      description: 'Connect your workspace'
    },
    {
      id: 'linear',
      name: 'Linear',
      icon: Code,
      connected: false,
      description: 'Access issues and projects'
    },
    {
      id: 'database',
      name: 'Database',
      icon: Database,
      connected: false,
      description: 'Query your data'
    },
    {
      id: 'web',
      name: 'Web Search',
      icon: Globe,
      connected: true,
      description: 'Search the internet'
    }
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  // Handle file upload (documents)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const attachment: Attachment = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: 'file',
        size: file.size,
        url: URL.createObjectURL(file)
      };
      
      setAttachments(prev => [...prev, attachment]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAttachMenu(false);
  };

  // Handle image upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const attachment: Attachment = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: 'image',
        size: file.size,
        url: URL.createObjectURL(file)
      };

      // Generate preview for images
      const reader = new FileReader();
      reader.onload = (e) => {
        attachment.preview = e.target?.result as string;
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    setShowAttachMenu(false);
  };

  // Remove attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Handle GitHub integration
  const handleGitHubConnect = () => {
    // TODO: Implement OAuth flow
    console.log('Connecting to GitHub...');
    setShowAttachMenu(false);
  };

  // Handle Google Drive integration
  const handleDriveConnect = () => {
    // TODO: Implement Google OAuth
    console.log('Connecting to Google Drive...');
    setShowAttachMenu(false);
  };

  // Handle URL attachment
  const handleAttachURL = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const attachment: Attachment = {
        id: `url_${Date.now()}`,
        name: url,
        type: 'url',
        url: url
      };
      setAttachments(prev => [...prev, attachment]);
    }
    setShowAttachMenu(false);
  };

  // Toggle integration
  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === integrationId 
        ? { ...int, connected: !int.connected }
        : int
    ));
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
    if ((!userMessage && attachments.length === 0) || isStreaming) return;

    // Add user message immediately
    const userMsgId = generateMessageId();
    const newUserMessage: Message = {
      id: userMsgId,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
      attachments: [...attachments]
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setAttachments([]);
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
          attachments: newUserMessage.attachments,
          messageHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments
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
    const userMessage = messages[messageIndex - 1];
    if (userMessage && userMessage.role === 'user') {
      setMessages(prev => prev.slice(0, messageIndex));
      setInput(userMessage.content);
      if (userMessage.attachments) {
        setAttachments(userMessage.attachments);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages]);

  // Handle feedback
  const handleFeedback = useCallback((messageId: string, feedback: 'up' | 'down') => {
    console.log(`Feedback for ${messageId}: ${feedback}`);
    // TODO: Send to backend
  }, []);

  // New conversation
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setConversationId("");
    setInput("");
    setAttachments([]);
    inputRef.current?.focus();
  }, []);

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

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
        
        <div className="flex items-center gap-2">
          {/* Integrations button */}
          <button
            onClick={() => setShowIntegrations(!showIntegrations)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              'border',
              border.subtle,
              text.primary,
              'hover:bg-gray-100 dark:hover:bg-slate-800'
            )}
          >
            <Link2 className="h-4 w-4" />
            Integrations
          </button>

          {/* New Chat button */}
          <button
            onClick={handleNewChat}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
              'hover:shadow-lg hover:scale-[1.02]'
            )}
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </button>
        </div>
      </header>

      {/* Integrations Panel */}
      {showIntegrations && (
        <div className={cn(
          'mb-4 rounded-xl border p-4',
          border.subtle,
          bg.surface
        )}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className={cn('text-sm font-semibold', text.primary)}>
              Connected Integrations
            </h3>
            <button
              onClick={() => setShowIntegrations(false)}
              className={cn('rounded p-1 transition-colors', 'hover:bg-gray-100 dark:hover:bg-slate-800')}
            >
              <X className={cn('h-4 w-4', text.muted)} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <button
                  key={integration.id}
                  onClick={() => handleToggleIntegration(integration.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all',
                    integration.connected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : cn(border.subtle, 'hover:bg-gray-50 dark:hover:bg-slate-800')
                  )}
                  title={integration.description}
                >
                  <Icon className={cn(
                    'h-5 w-5',
                    integration.connected ? 'text-blue-600 dark:text-blue-400' : text.muted
                  )} />
                  <div className="flex flex-col">
                    <span className={cn('text-xs font-medium', text.primary)}>
                      {integration.name}
                    </span>
                    {integration.connected && (
                      <span className="text-[10px] text-green-600 dark:text-green-400">
                        Connected
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
                Ask me anything, attach files, or connect your tools.
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

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {message.attachments.map(attachment => (
                          <div
                            key={attachment.id}
                            className={cn(
                              'flex items-center gap-2 rounded-lg px-3 py-2 text-xs',
                              message.role === 'user'
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-100 dark:bg-slate-800'
                            )}
                          >
                            {attachment.type === 'image' ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : attachment.type === 'github' ? (
                              <Github className="h-4 w-4" />
                            ) : attachment.type === 'drive' ? (
                              <FolderOpen className="h-4 w-4" />
                            ) : attachment.type === 'url' ? (
                              <Link2 className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <span className="max-w-[200px] truncate">
                              {attachment.name}
                            </span>
                            {attachment.size && (
                              <span className="opacity-70">
                                ({formatFileSize(attachment.size)})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message content */}
                    {message.content && (
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
                    )}

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

        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className={cn('mt-3 flex flex-wrap gap-2 rounded-xl border p-3', border.subtle, bg.surface)}>
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="group relative"
              >
                {attachment.type === 'image' && attachment.preview ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                    <img 
                      src={attachment.preview} 
                      alt={attachment.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="absolute right-1 top-1 rounded-full bg-red-600 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2',
                    bg.muted
                  )}>
                    {attachment.type === 'github' ? (
                      <Github className={cn('h-4 w-4', text.muted)} />
                    ) : attachment.type === 'drive' ? (
                      <FolderOpen className={cn('h-4 w-4', text.muted)} />
                    ) : attachment.type === 'url' ? (
                      <Link2 className={cn('h-4 w-4', text.muted)} />
                    ) : (
                      <FileText className={cn('h-4 w-4', text.muted)} />
                    )}
                    <span className={cn('max-w-[150px] truncate text-xs', text.primary)}>
                      {attachment.name}
                    </span>
                    {attachment.size && (
                      <span className={cn('text-xs', text.muted)}>
                        ({formatFileSize(attachment.size)})
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className={cn(
                        'rounded p-0.5 transition-colors',
                        'hover:bg-red-100 dark:hover:bg-red-900/30'
                      )}
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className={cn(
            'relative rounded-2xl border transition-colors',
            border.subtle,
            bg.surface,
            'focus-within:border-blue-600 dark:focus-within:border-blue-500'
          )}>
            {/* Plus button - INSIDE the input on the left */}
            <div className="absolute left-4 bottom-4 z-10" ref={attachMenuRef}>
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-slate-700',
                  showAttachMenu && 'bg-gray-100 dark:bg-slate-700'
                )}
                title="Attach files"
              >
                <Plus className={cn('h-5 w-5', text.muted)} />
              </button>

              {/* Attach menu - appears above the button */}
              {showAttachMenu && (
                <div className={cn(
                  'absolute bottom-12 left-0 w-64 rounded-xl border shadow-xl z-50',
                  border.subtle,
                  bg.surface,
                  'p-1'
                )}>
                  <div className="space-y-0.5">
                    {/* Upload files */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        'hover:bg-gray-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <Paperclip className={cn('mt-0.5 h-5 w-5 flex-shrink-0', text.primary)} />
                      <div className="flex-1">
                        <div className={cn('text-sm font-medium', text.primary)}>
                          Upload from computer
                        </div>
                        <div className={cn('text-xs', text.muted)}>
                          Documents, spreadsheets, and more
                        </div>
                      </div>
                    </button>

                    {/* Upload images */}
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        'hover:bg-gray-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <ImageIcon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', text.primary)} />
                      <div className="flex-1">
                        <div className={cn('text-sm font-medium', text.primary)}>
                          Upload images
                        </div>
                        <div className={cn('text-xs', text.muted)}>
                          PNG, JPG, GIF, and more
                        </div>
                      </div>
                    </button>

                    <div className={cn('my-1 h-px', 'bg-gray-200 dark:bg-slate-700')} />

                    {/* GitHub */}
                    <button
                      type="button"
                      onClick={handleGitHubConnect}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        'hover:bg-gray-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <Github className={cn('mt-0.5 h-5 w-5 flex-shrink-0', text.primary)} />
                      <div className="flex-1">
                        <div className={cn('text-sm font-medium', text.primary)}>
                          From GitHub
                        </div>
                        <div className={cn('text-xs', text.muted)}>
                          Link a repository or file
                        </div>
                      </div>
                    </button>

                    {/* Google Drive */}
                    <button
                      type="button"
                      onClick={handleDriveConnect}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        'hover:bg-gray-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <FolderOpen className={cn('mt-0.5 h-5 w-5 flex-shrink-0', text.primary)} />
                      <div className="flex-1">
                        <div className={cn('text-sm font-medium', text.primary)}>
                          From Google Drive
                        </div>
                        <div className={cn('text-xs', text.muted)}>
                          Search and attach files
                        </div>
                      </div>
                    </button>

                    {/* URL */}
                    <button
                      type="button"
                      onClick={handleAttachURL}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        'hover:bg-gray-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <Link2 className={cn('mt-0.5 h-5 w-5 flex-shrink-0', text.primary)} />
                      <div className="flex-1">
                        <div className={cn('text-sm font-medium', text.primary)}>
                          Paste a link
                        </div>
                        <div className={cn('text-xs', text.muted)}>
                          Attach any URL
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isStreaming}
              className={cn(
                'w-full resize-none bg-transparent pl-14 pr-6 py-4 text-base outline-none',
                text.primary,
                'placeholder:text-gray-400 dark:placeholder:text-slate-500',
                'disabled:opacity-50'
              )}
              placeholder="Ask Toron anything..."
              style={{ maxHeight: '200px' }}
            />

            {/* Bottom info bar - NO BORDER */}
            <div className={cn(
              'flex items-center justify-between px-4 py-3',
              'bg-gray-50 dark:bg-slate-800/50'
            )}>
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
                    disabled={!input.trim() && attachments.length === 0}
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

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </section>
  );
}
