/**
 * AttachmentPreview Component
 * Display file and image attachments in messages
 *
 * Features:
 * - Image previews with thumbnails
 * - File type icons
 * - Size display
 * - Compact and full modes
 * - User/assistant variants
 */

import { memo } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Github,
  FolderOpen,
  Link2,
  Code,
  File,
  FileCode,
  FileSpreadsheet,
  FilePen,
} from 'lucide-react';
import { cn, text, bg } from '../../utils/theme';
import type { Attachment } from '../../stores/useToronStore';

// ============================================================================
// TYPES
// ============================================================================

interface AttachmentPreviewProps {
  attachment: Attachment;
  compact?: boolean;
  variant?: 'user' | 'assistant';
  onRemove?: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format file size to human readable string
 */
function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * Get icon for file type
 */
function getFileIcon(attachment: Attachment) {
  const { type, name } = attachment;

  // Handle known types
  if (type === 'image') return ImageIcon;
  if (type === 'github') return Github;
  if (type === 'drive') return FolderOpen;
  if (type === 'url') return Link2;
  if (type === 'code') return Code;

  // Detect by extension
  const ext = name.split('.').pop()?.toLowerCase() || '';

  switch (ext) {
    // Code files
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'py':
    case 'rb':
    case 'java':
    case 'go':
    case 'rs':
    case 'cpp':
    case 'c':
    case 'h':
    case 'php':
      return FileCode;

    // Documents
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'md':
      return FileText;

    // Spreadsheets
    case 'csv':
    case 'xlsx':
    case 'xls':
      return FileSpreadsheet;

    // Design files
    case 'sketch':
    case 'fig':
    case 'psd':
    case 'ai':
      return FilePen;

    default:
      return File;
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

const AttachmentPreview = memo(function AttachmentPreview({
  attachment,
  compact = false,
  variant = 'assistant',
}: AttachmentPreviewProps) {
  const isUser = variant === 'user';
  const Icon = getFileIcon(attachment);

  // Image preview
  if (attachment.type === 'image' && attachment.preview) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-lg',
          compact ? 'h-16 w-16' : 'h-32 w-32'
        )}
      >
        <img
          src={attachment.preview}
          alt={attachment.name}
          className="h-full w-full object-cover"
        />
        {/* Overlay with name on hover */}
        <div
          className={cn(
            'absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent',
            'opacity-0 transition-opacity hover:opacity-100'
          )}
        >
          <span className="truncate px-2 py-1 text-xs text-white">
            {attachment.name}
          </span>
        </div>
      </div>
    );
  }

  // File preview (compact)
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2',
          isUser
            ? 'bg-white/20 text-white'
            : cn(bg.muted)
        )}
      >
        <Icon className={cn('h-4 w-4 flex-shrink-0', isUser ? '' : text.muted)} />
        <span className={cn('max-w-[150px] truncate text-xs', isUser ? '' : text.primary)}>
          {attachment.name}
        </span>
        {attachment.size && (
          <span className={cn('text-xs', isUser ? 'text-white/70' : text.muted)}>
            ({formatFileSize(attachment.size)})
          </span>
        )}
      </div>
    );
  }

  // File preview (full)
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3',
        'border-gray-200 dark:border-slate-700',
        bg.surface
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          'bg-gray-100 dark:bg-slate-800'
        )}
      >
        <Icon className={cn('h-5 w-5', text.muted)} />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className={cn('truncate text-sm font-medium', text.primary)}>
          {attachment.name}
        </div>
        <div className={cn('flex items-center gap-2 text-xs', text.muted)}>
          {attachment.type && (
            <span className="uppercase">{attachment.type}</span>
          )}
          {attachment.size && (
            <span>{formatFileSize(attachment.size)}</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default AttachmentPreview;
