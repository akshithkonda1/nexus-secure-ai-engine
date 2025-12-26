/**
 * InputArea Component
 * World-class chat input with attachments
 *
 * Features:
 * - Auto-resizing textarea
 * - File and image uploads
 * - Attachment previews
 * - Send/Stop buttons
 * - Keyboard shortcuts
 * - Integration shortcuts
 */

import { useState, useRef, useCallback, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import {
  Send,
  StopCircle,
  Plus,
  Paperclip,
  Image as ImageIcon,
  X,
  Github,
  FolderOpen,
  Link2,
} from 'lucide-react';
import { cn, text, bg, border, shadow } from '../../utils/theme';
import type { Attachment } from '../../stores/useToronStore';

// ============================================================================
// TYPES
// ============================================================================

interface InputAreaProps {
  onSend: (message: string, attachments: Attachment[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function generateAttachmentId(prefix: string = 'att'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function InputArea({
  onSend,
  onStop,
  isStreaming,
  disabled = false,
  placeholder = 'Ask Toron anything...',
}: InputAreaProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target as Node)
      ) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  // Handle Enter to send
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [input, attachments, isStreaming]);

  // Submit message
  const handleSubmit = useCallback(() => {
    const trimmedInput = input.trim();
    if ((!trimmedInput && attachments.length === 0) || isStreaming) return;

    onSend(trimmedInput, attachments);

    // Reset
    setInput('');
    setAttachments([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Refocus
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [input, attachments, isStreaming, onSend]);

  // Handle file selection
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach(file => {
      const attachment: Attachment = {
        id: generateAttachmentId('file'),
        name: file.name,
        type: 'file',
        size: file.size,
        url: URL.createObjectURL(file),
        metadata: {
          mimeType: file.type,
        },
      };

      setAttachments(prev => [...prev, attachment]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAttachMenu(false);
  }, []);

  // Handle image selection
  const handleImageSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const attachment: Attachment = {
          id: generateAttachmentId('img'),
          name: file.name,
          type: 'image',
          size: file.size,
          url: URL.createObjectURL(file),
          preview: event.target?.result as string,
          metadata: {
            mimeType: file.type,
          },
        };

        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    setShowAttachMenu(false);
  }, []);

  // Handle URL attachment
  const handleAttachURL = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url && url.trim()) {
      const attachment: Attachment = {
        id: generateAttachmentId('url'),
        name: url,
        type: 'url',
        url: url.trim(),
      };
      setAttachments(prev => [...prev, attachment]);
    }
    setShowAttachMenu(false);
  }, []);

  // Remove attachment
  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const canSend = (input.trim() || attachments.length > 0) && !isStreaming && !disabled;

  return (
    <div className="space-y-3">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div
          className={cn(
            'flex flex-wrap gap-2 rounded-xl border p-3',
            border.subtle,
            bg.surface
          )}
        >
          {attachments.map(attachment => (
            <AttachmentChip
              key={attachment.id}
              attachment={attachment}
              onRemove={() => handleRemoveAttachment(attachment.id)}
            />
          ))}
        </div>
      )}

      {/* Input Container */}
      <div
        className={cn(
          'relative rounded-2xl border backdrop-blur-xl',
          border.subtle,
          bg.glass,
          shadow.lg,
          'transition-all duration-200',
          'focus-within:border-[var(--accent-primary)] focus-within:ring-2 focus-within:ring-[var(--accent-subtle)]'
        )}
      >
        {/* Plus/Attach Button */}
        <div className="absolute left-4 top-4 z-10" ref={attachMenuRef}>
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            disabled={disabled}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-slate-700',
              showAttachMenu && 'bg-gray-100 dark:bg-slate-700',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            aria-label="Attach files"
          >
            <Plus className={cn('h-5 w-5', text.muted)} />
          </button>

          {/* Attach Menu Dropdown */}
          {showAttachMenu && (
            <div
              className={cn(
                'absolute bottom-12 left-0 z-50 w-64 rounded-xl border p-1',
                border.subtle,
                bg.surface,
                shadow.xl
              )}
            >
              <AttachMenuItem
                icon={Paperclip}
                title="Upload files"
                description="Documents, PDFs, code files"
                onClick={() => fileInputRef.current?.click()}
              />
              <AttachMenuItem
                icon={ImageIcon}
                title="Upload images"
                description="PNG, JPG, GIF, and more"
                onClick={() => imageInputRef.current?.click()}
              />

              <div className={cn('my-1 h-px', 'bg-gray-200 dark:bg-slate-700')} />

              <AttachMenuItem
                icon={Github}
                title="From GitHub"
                description="Link a repository or file"
                onClick={() => {
                  // TODO: Implement GitHub picker
                  setShowAttachMenu(false);
                }}
              />
              <AttachMenuItem
                icon={FolderOpen}
                title="From Google Drive"
                description="Search and attach files"
                onClick={() => {
                  // TODO: Implement Drive picker
                  setShowAttachMenu(false);
                }}
              />
              <AttachMenuItem
                icon={Link2}
                title="Paste a link"
                description="Attach any URL"
                onClick={handleAttachURL}
              />
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isStreaming}
          rows={1}
          placeholder={placeholder}
          className={cn(
            'w-full resize-none bg-transparent py-4 pl-14 pr-6 text-base outline-none',
            text.primary,
            'placeholder:text-gray-400 dark:placeholder:text-slate-500',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          style={{ maxHeight: '200px' }}
          aria-label="Message input"
        />

        {/* Bottom Bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className={cn('text-xs', text.muted)}>
            {isStreaming
              ? 'Toron is thinking...'
              : 'Press Enter to send, Shift+Enter for new line'}
          </div>

          {/* Send/Stop Button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold',
                'bg-red-600 text-white',
                'transition-all hover:bg-red-700 hover:shadow-lg'
              )}
            >
              <StopCircle className="h-4 w-4" />
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSend}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white',
                'bg-gradient-to-r from-blue-600 to-purple-600',
                'transition-all hover:scale-[1.02] hover:shadow-lg',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
              )}
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.json,.xml,.md,.js,.ts,.jsx,.tsx,.py,.rb,.go,.rs,.java,.cpp,.c,.h"
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
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface AttachMenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}

function AttachMenuItem({ icon: Icon, title, description, onClick }: AttachMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        'hover:bg-gray-100 dark:hover:bg-slate-800'
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', text.primary)} />
      <div className="flex-1">
        <div className={cn('text-sm font-medium', text.primary)}>{title}</div>
        <div className={cn('text-xs', text.muted)}>{description}</div>
      </div>
    </button>
  );
}

interface AttachmentChipProps {
  attachment: Attachment;
  onRemove: () => void;
}

function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  // Image thumbnail
  if (attachment.type === 'image' && attachment.preview) {
    return (
      <div className="group relative h-20 w-20 overflow-hidden rounded-lg">
        <img
          src={attachment.preview}
          alt={attachment.name}
          className="h-full w-full object-cover"
        />
        <button
          onClick={onRemove}
          className={cn(
            'absolute right-1 top-1 rounded-full p-1',
            'bg-red-600 text-white',
            'opacity-0 transition-opacity group-hover:opacity-100'
          )}
          aria-label="Remove attachment"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  // File chip
  return (
    <div className={cn('flex items-center gap-2 rounded-lg px-3 py-2', bg.muted)}>
      <Paperclip className={cn('h-4 w-4', text.muted)} />
      <span className={cn('max-w-[150px] truncate text-xs', text.primary)}>
        {attachment.name}
      </span>
      {attachment.size && (
        <span className={cn('text-xs', text.muted)}>
          ({formatFileSize(attachment.size)})
        </span>
      )}
      <button
        onClick={onRemove}
        className={cn(
          'rounded p-0.5 transition-colors',
          'hover:bg-red-100 dark:hover:bg-red-900/30'
        )}
        aria-label="Remove attachment"
      >
        <X className="h-3 w-3 text-red-600" />
      </button>
    </div>
  );
}
