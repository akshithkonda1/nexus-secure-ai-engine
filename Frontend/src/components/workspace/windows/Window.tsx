/**
 * Window Component
 * Draggable, resizable window wrapper
 */

import { memo, type ReactNode, type ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { useWindowDrag, useWindowResize } from '../../../hooks/useWindowDrag';
import type { Position, Size } from '../../../types/workspace';

type WindowProps = {
  id: string;
  title: string;
  icon: ElementType;
  position: Position;
  size: Size;
  zIndex: number;
  isMinimized?: boolean;
  isMaximized?: boolean;
  isPinned?: boolean;
  canDrag?: boolean;
  canResize?: boolean;
  canClose?: boolean;
  onClose?: () => void;
  onDrag?: (position: Position) => void;
  onResize?: (size: Size) => void;
  onFocus?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  children: ReactNode;
  suggestionCount?: number;
};

const windowVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

export const Window = memo(function Window({
  id,
  title,
  icon: Icon,
  position,
  size,
  zIndex,
  isMinimized = false,
  isMaximized = false,
  isPinned = false,
  canDrag = true,
  canResize = true,
  canClose = true,
  onClose,
  onDrag,
  onResize,
  onFocus,
  onMinimize,
  onMaximize,
  children,
  suggestionCount = 0,
}: WindowProps) {
  const { position: dragPosition, isDragging, handleMouseDown } = useWindowDrag({
    initialPosition: position,
    onDragEnd: onDrag,
    bounds: { minX: 0, minY: 0 },
    magnetic: true,
    magneticThreshold: 10,
  });

  const { size: resizeSize, isResizing, handleResizeStart } = useWindowResize({
    initialSize: size,
    minSize: { width: 280, height: 300 },
    maxSize: typeof window !== 'undefined' ? {
      width: window.innerWidth * 0.9,
      height: window.innerHeight * 0.9,
    } : undefined,
    onResizeEnd: onResize,
  });

  const handleClick = () => {
    if (onFocus) onFocus();
  };

  if (isMinimized) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key={id}
        variants={windowVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute select-none"
        style={{
          left: dragPosition.x,
          top: dragPosition.y,
          width: resizeSize.width,
          height: resizeSize.height,
          zIndex,
        }}
        onClick={handleClick}
        role="dialog"
        aria-label={`${title} window`}
        aria-modal="false"
        tabIndex={-1}
      >
        <div
          className={`flex h-full flex-col rounded-2xl border shadow-2xl backdrop-blur-xl transition-shadow ${
            isDragging || isResizing
              ? 'border-[var(--accent)]/40 shadow-[0_20px_80px_-30px_rgba(43,159,255,0.4)]'
              : 'border-[var(--line-subtle)]/40 shadow-[0_18px_60px_-20px_rgba(0,0,0,0.3)]'
          } ${
            isPinned ? 'ring-2 ring-[var(--accent)]/30' : ''
          } bg-[var(--bg-surface)]/85`}
        >
          {/* Title Bar */}
          <div
            className={`flex items-center justify-between gap-2 rounded-t-2xl border-b border-[var(--line-subtle)]/30 bg-[var(--bg-elev)]/50 px-4 py-3 ${
              canDrag ? 'cursor-move' : ''
            }`}
            onMouseDown={canDrag ? handleMouseDown : undefined}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--layer-muted)] text-[var(--accent)] ring-1 ring-[var(--line-subtle)]/50">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight text-[var(--text)]">
                  {title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onMinimize && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMinimize();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
                  aria-label="Minimize window"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
              )}
              {onMaximize && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMaximize();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
                  aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
                >
                  {isMaximized ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
              {canClose && onClose && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-500"
                  aria-label="Close window"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Suggestion Badge */}
            {suggestionCount > 0 && (
              <motion.div
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] shadow-lg"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <span className="text-xs font-bold text-white">
                  {suggestionCount}
                </span>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden p-4">
            {children}
          </div>

          {/* Resize Handles */}
          {canResize && !isMaximized && (
            <>
              {/* Corners */}
              <div
                className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
                onMouseDown={(e) => handleResizeStart(e, 'se')}
              />
              <div
                className="absolute bottom-0 left-0 h-4 w-4 cursor-nesw-resize"
                onMouseDown={(e) => handleResizeStart(e, 'sw')}
              />
              <div
                className="absolute right-0 top-12 h-4 w-4 cursor-nesw-resize"
                onMouseDown={(e) => handleResizeStart(e, 'ne')}
              />
              <div
                className="absolute left-0 top-12 h-4 w-4 cursor-nwse-resize"
                onMouseDown={(e) => handleResizeStart(e, 'nw')}
              />

              {/* Edges */}
              <div
                className="absolute bottom-0 left-4 right-4 h-1 cursor-ns-resize"
                onMouseDown={(e) => handleResizeStart(e, 's')}
              />
              <div
                className="absolute left-0 top-12 bottom-4 w-1 cursor-ew-resize"
                onMouseDown={(e) => handleResizeStart(e, 'w')}
              />
              <div
                className="absolute right-0 top-12 bottom-4 w-1 cursor-ew-resize"
                onMouseDown={(e) => handleResizeStart(e, 'e')}
              />
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
},
(prevProps, nextProps) => {
  // Only re-render if these props changed
  return (
    prevProps.position.x === nextProps.position.x &&
    prevProps.position.y === nextProps.position.y &&
    prevProps.size.width === nextProps.size.width &&
    prevProps.size.height === nextProps.size.height &&
    prevProps.isMinimized === nextProps.isMinimized &&
    prevProps.isMaximized === nextProps.isMaximized &&
    prevProps.zIndex === nextProps.zIndex &&
    prevProps.suggestionCount === nextProps.suggestionCount
  );
});
