/**
 * MessageBubble Component
 * ChatGPT-quality message display with actions
 *
 * Features:
 * - User and assistant message styles
 * - Markdown rendering
 * - Copy, regenerate, feedback actions
 * - Attachment previews
 * - Streaming indicator
 * - Error state styling
 */

import { memo, useState, useCallback } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Sparkles,
  User,
  AlertCircle,
} from 'lucide-react';
import { cn, text, bg, border, shadow } from '../../utils/theme';
import type { Message } from '../../stores/useToronStore';
import MarkdownRenderer from './MarkdownRenderer';
import AttachmentPreview from './AttachmentPreview';

// ============================================================================
// TYPES
// ============================================================================

interface MessageBubbleProps {
  message: Message;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (type: 'up' | 'down') => void;
  isLatest?: boolean;
  showActions?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const MessageBubble = memo(function MessageBubble({
  message,
  onCopy,
  onRegenerate,
  onFeedback,
  isLatest = false,
  showActions = true,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Handle copy
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [message.content, onCopy]);

  // Handle feedback
  const handleFeedback = useCallback((type: 'up' | 'down') => {
    setFeedback(prev => prev === type ? null : type);
    onFeedback?.(type);
  }, [onFeedback]);

  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div
      className={cn(
        'group relative flex gap-4 py-5',
        isUser && 'justify-end'
      )}
    >
      {/* Avatar - Assistant (left side) */}
      {isAssistant && (
        <div
          className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
            'bg-gradient-to-br from-blue-500 to-purple-600',
            'shadow-md'
          )}
        >
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          'flex max-w-[85%] flex-col gap-2',
          isUser && 'items-end'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center gap-2 text-xs font-medium uppercase tracking-wide',
            isUser ? 'flex-row-reverse' : ''
          )}
        >
          <span className={text.tertiary}>
            {isUser ? 'You' : 'Toron'}
          </span>
          <span className={text.muted}>
            {formatTime(message.timestamp)}
          </span>
          {message.metadata?.latency && (
            <>
              <span className={text.muted}>
                {(message.metadata.latency / 1000).toFixed(1)}s
              </span>
            </>
          )}
          {message.error && (
            <span className="flex items-center gap-1 text-red-500">
              <AlertCircle className="h-3 w-3" />
              Error
            </span>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={cn('flex flex-wrap gap-2', isUser && 'justify-end')}>
            {message.attachments.map(attachment => (
              <AttachmentPreview
                key={attachment.id}
                attachment={attachment}
                compact
                variant={isUser ? 'user' : 'assistant'}
              />
            ))}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-5 py-4 transition-all',
            isUser
              ? cn(
                  'bg-gradient-to-br from-blue-600 to-purple-600 text-white',
                  shadow.md
                )
              : cn(
                  'border',
                  border.subtle,
                  bg.elevated,
                  message.error && 'border-red-500/50 bg-red-50 dark:bg-red-900/10'
                )
          )}
        >
          {/* Content */}
          {message.content ? (
            <MarkdownRenderer
              content={message.content}
              isStreaming={message.isStreaming}
              className={cn(
                'prose prose-sm max-w-none',
                isUser && 'prose-invert'
              )}
            />
          ) : message.isStreaming ? (
            // Empty streaming state
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
              </div>
              <span className={cn('text-sm', text.muted)}>Thinking...</span>
            </div>
          ) : null}
        </div>

        {/* Actions - Assistant only, when not streaming */}
        {isAssistant && showActions && !message.isStreaming && message.content && (
          <div
            className={cn(
              'flex items-center gap-1',
              'opacity-0 transition-opacity duration-150',
              'group-hover:opacity-100'
            )}
          >
            {/* Copy */}
            <ActionButton
              onClick={handleCopy}
              title="Copy message"
              active={copied}
              activeColor="text-green-600"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </ActionButton>

            {/* Regenerate (only for latest message) */}
            {isLatest && onRegenerate && (
              <ActionButton onClick={onRegenerate} title="Regenerate response">
                <RotateCcw className="h-4 w-4" />
              </ActionButton>
            )}

            {/* Thumbs Up */}
            <ActionButton
              onClick={() => handleFeedback('up')}
              title="Good response"
              active={feedback === 'up'}
              activeColor="text-green-600"
              activeBg="bg-green-100 dark:bg-green-900/20"
            >
              <ThumbsUp className="h-4 w-4" />
            </ActionButton>

            {/* Thumbs Down */}
            <ActionButton
              onClick={() => handleFeedback('down')}
              title="Bad response"
              active={feedback === 'down'}
              activeColor="text-red-600"
              activeBg="bg-red-100 dark:bg-red-900/20"
            >
              <ThumbsDown className="h-4 w-4" />
            </ActionButton>

            {/* More Options */}
            <ActionButton title="More options">
              <MoreVertical className="h-4 w-4" />
            </ActionButton>
          </div>
        )}
      </div>

      {/* Avatar - User (right side) */}
      {isUser && (
        <div
          className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
            'bg-gray-200 dark:bg-slate-700'
          )}
        >
          <User className={cn('h-4 w-4', text.secondary)} />
        </div>
      )}
    </div>
  );
});

// ============================================================================
// ACTION BUTTON COMPONENT
// ============================================================================

interface ActionButtonProps {
  onClick?: () => void;
  title: string;
  active?: boolean;
  activeColor?: string;
  activeBg?: string;
  children: React.ReactNode;
}

function ActionButton({
  onClick,
  title,
  active = false,
  activeColor = '',
  activeBg = '',
  children,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'rounded-lg p-2 transition-colors',
        'hover:bg-gray-100 dark:hover:bg-slate-800',
        active && activeBg,
        active ? activeColor : text.muted
      )}
    >
      {children}
    </button>
  );
}

export default MessageBubble;
