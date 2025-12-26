/**
 * Toron Page
 * World-class AI chat interface - ChatGPT/Claude quality
 *
 * Features:
 * - Full sidebar integration
 * - Message streaming with SSE
 * - Markdown rendering with code highlighting
 * - File and image attachments
 * - Chat persistence
 * - Suggested prompts
 * - Integration panel
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Sparkles,
  MessageSquarePlus,
  Link2,
  X,
  Github,
  FolderOpen,
  FileText,
  Code,
  Database,
  Globe,
} from 'lucide-react';
import { cn, bg, text, border, shadow } from '../utils/theme';
import { useToronStore, type Attachment } from '../stores/useToronStore';
import { useStreaming } from '../hooks/toron/useStreaming';
import ToronSidebar from '../components/toron/ToronSidebar';
import MessageBubble from '../components/toron/MessageBubble';
import InputArea from '../components/toron/InputArea';

// ============================================================================
// SUGGESTED PROMPTS
// ============================================================================

const SUGGESTED_PROMPTS = [
  'Explain quantum computing in simple terms',
  'Help me debug this JavaScript code',
  'Write a professional email template',
  'Analyze this data and find insights',
];

// ============================================================================
// INTEGRATION ICONS MAP
// ============================================================================

const INTEGRATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  drive: FolderOpen,
  notion: FileText,
  linear: Code,
  database: Database,
  web: Globe,
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ToronPage() {
  // Store state
  const chats = useToronStore(state => state.chats);
  const activeChat = useToronStore(state => state.activeChat);
  const integrations = useToronStore(state => state.integrations);
  const createChat = useToronStore(state => state.createChat);
  const connectIntegration = useToronStore(state => state.connectIntegration);
  const disconnectIntegration = useToronStore(state => state.disconnectIntegration);

  // Local UI state
  const [showIntegrations, setShowIntegrations] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Get current chat
  const currentChat = activeChat ? chats.find(c => c.id === activeChat) : null;
  const messages = currentChat?.messages || [];

  // Streaming hook
  const { sendMessage, stopStreaming, isStreaming, error } = useStreaming({
    chatId: activeChat || '',
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle new chat
  const handleNewChat = useCallback(() => {
    createChat();
  }, [createChat]);

  // Handle send message
  const handleSend = useCallback(async (content: string, attachments: Attachment[]) => {
    // Create chat if none active
    let chatId = activeChat;
    if (!chatId) {
      chatId = createChat();
    }

    await sendMessage(content, attachments);
  }, [activeChat, createChat, sendMessage]);

  // Handle regenerate last response
  const handleRegenerate = useCallback(() => {
    if (!currentChat || messages.length < 2) return;

    // Find the last user message
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }

    if (lastUserMessageIndex >= 0) {
      const lastUserMessage = messages[lastUserMessageIndex];
      // Re-send the last user message
      sendMessage(lastUserMessage.content, lastUserMessage.attachments);
    }
  }, [currentChat, messages, sendMessage]);

  // Handle suggested prompt click
  const handlePromptClick = useCallback((prompt: string) => {
    handleSend(prompt, []);
  }, [handleSend]);

  // Handle integration toggle
  const handleToggleIntegration = useCallback((integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (integration?.connected) {
      disconnectIntegration(integrationId);
    } else {
      connectIntegration(integrationId);
    }
  }, [integrations, connectIntegration, disconnectIntegration]);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <ToronSidebar />

      {/* Main Chat Area */}
      <section className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header
          className={cn(
            'flex items-center justify-between border-b px-6 py-4',
            border.subtle,
            bg.surface
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              <h1 className={cn('text-2xl font-semibold', text.primary)}>
                Toron
              </h1>
              <div className="flex h-6 items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-2">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="ml-1 text-xs font-semibold text-white">AI</span>
              </div>
            </div>
            <p className={cn('mt-0.5 text-sm', text.tertiary)}>
              Precision dialogue for decisive action
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Integrations Button */}
            <button
              onClick={() => setShowIntegrations(!showIntegrations)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                border.subtle,
                text.primary,
                'hover:bg-gray-100 dark:hover:bg-slate-800'
              )}
            >
              <Link2 className="h-4 w-4" />
              Integrations
            </button>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white',
                'bg-gradient-to-r from-blue-600 to-purple-600',
                'transition-all hover:scale-[1.02] hover:shadow-lg'
              )}
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Chat
            </button>
          </div>
        </header>

        {/* Integrations Panel */}
        {showIntegrations && (
          <div
            className={cn(
              'mx-6 mt-4 rounded-xl border p-4',
              border.subtle,
              bg.surface
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className={cn('text-sm font-semibold', text.primary)}>
                Connected Integrations
              </h3>
              <button
                onClick={() => setShowIntegrations(false)}
                className={cn(
                  'rounded p-1 transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-slate-800'
                )}
              >
                <X className={cn('h-4 w-4', text.muted)} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
              {integrations.map((integration) => {
                const Icon = INTEGRATION_ICONS[integration.id] || Globe;
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
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        integration.connected
                          ? 'text-blue-600 dark:text-blue-400'
                          : text.muted
                      )}
                    />
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
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-6"
        >
          {messages.length === 0 ? (
            // Empty State
            <div className="flex h-full flex-col items-center justify-center py-12">
              <div
                className={cn(
                  'mb-6 flex h-20 w-20 items-center justify-center rounded-2xl',
                  'bg-gradient-to-br from-blue-500 to-purple-600',
                  shadow.lg
                )}
              >
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className={cn('mb-2 text-2xl font-semibold', text.primary)}>
                How can I help you today?
              </h2>
              <p className={cn('mb-10 text-center text-sm', text.tertiary)}>
                Ask me anything, analyze data, or work on complex problems together.
              </p>

              {/* Suggested Prompts */}
              <div className="grid w-full max-w-2xl grid-cols-1 gap-3 md:grid-cols-2">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className={cn(
                      'rounded-xl border p-4 text-left text-sm transition-all',
                      border.subtle,
                      bg.elevated,
                      text.secondary,
                      shadow.sm,
                      'hover:border-[var(--accent-primary)] hover:shadow-md'
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Messages List
            <div className="mx-auto max-w-4xl py-6">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLatest={
                    index === messages.length - 1 &&
                    message.role === 'assistant'
                  }
                  onRegenerate={handleRegenerate}
                  onFeedback={(type) => {
                    console.log('Feedback:', message.id, type);
                    // TODO: Implement feedback API
                  }}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={cn('border-t px-6 py-4', border.subtle)}>
          <div className="mx-auto max-w-4xl">
            <InputArea
              onSend={handleSend}
              onStop={stopStreaming}
              isStreaming={isStreaming}
            />

            {/* Error Display */}
            {error && (
              <div
                className={cn(
                  'mt-3 rounded-lg border border-red-500/50 bg-red-50 px-4 py-3 text-sm text-red-700',
                  'dark:bg-red-900/20 dark:text-red-400'
                )}
              >
                {error.message}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
