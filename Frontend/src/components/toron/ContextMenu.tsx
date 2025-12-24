/**
 * ContextMenu Component
 * Ultra-minimalist context menu with smooth animations
 * Design: 180px width, 8px radius, scale-in animation
 */

import { useEffect, useRef } from 'react';
import { cn, text, bg, border } from '../../utils/theme';
import { ContextMenuItem } from '../../types/toron';

interface ContextMenuProps {
  items: ContextMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  position?: { x: number; y: number };
}

export default function ContextMenu({
  items,
  isOpen,
  onClose,
  anchorEl,
  position,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add delay to prevent immediate close
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Calculate position
  const getMenuPosition = () => {
    if (position) {
      return { top: position.y, left: position.x };
    }

    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      return {
        top: rect.bottom + 4, // 4px gap
        left: rect.right - 180, // Align to right edge (menu width = 180px)
      };
    }

    return { top: 0, left: 0 };
  };

  if (!isOpen) return null;

  const menuPosition = getMenuPosition();

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backdropFilter: 'blur(8px)',
          backgroundColor: 'transparent',
        }}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        ref={menuRef}
        role="menu"
        aria-orientation="vertical"
        className={cn(
          'fixed z-50 w-[180px] rounded-lg border p-1',
          border.subtle,
          bg.surface,
          'shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
        )}
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
          animation: 'menuScaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;

          // Separator
          if (item.separator) {
            return (
              <div
                key={`separator-${index}`}
                className="my-1 h-px bg-[var(--border-subtle)]"
              />
            );
          }

          return (
            <button
              key={item.id}
              role="menuitem"
              onClick={() => {
                item.onClick();
                onClose();
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded px-2 py-2 text-left text-[13px] transition-colors',
                item.danger
                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                  : cn(text.primary, 'hover:bg-[var(--bg-hover)]')
              )}
              style={{
                transitionDuration: '100ms',
                transitionTimingFunction: 'ease',
              }}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animation keyframes injected via style tag */}
      <style>{`
        @keyframes menuScaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
