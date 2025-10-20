import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Message } from '../../types/chat';
import MessageBubble from './MessageBubble';

const ESTIMATED_ROW_HEIGHT = 72;
const DEFAULT_BATCH = 16;
const OVERSCAN = 6;

type Range = { start: number; end: number };

function clampRange(range: Range, total: number): Range {
  if (total === 0) {
    return { start: 0, end: 0 };
  }

  const start = Math.max(0, Math.min(range.start, total - 1));
  const end = Math.max(start + 1, Math.min(range.end, total));
  return { start, end };
}

const ChatList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const rowHeightRef = useRef<number>(ESTIMATED_ROW_HEIGHT);
  const stickToBottomRef = useRef<boolean>(true);

  const currentTime = useMemo(() => Date.now(), [messages]);
  const total = messages.length;

  const [range, setRange] = useState<Range>(() =>
    clampRange({ start: Math.max(0, total - DEFAULT_BATCH), end: total }, total)
  );

  const updateRange = useCallback(
    (node: HTMLDivElement | null, opts?: { forceToBottom?: boolean }) => {
      if (!node || total === 0) {
        setRange(clampRange({ start: 0, end: 0 }, total));
        return;
      }

      const { scrollTop, clientHeight, scrollHeight } = node;
      const itemHeight = Math.max(32, rowHeightRef.current || ESTIMATED_ROW_HEIGHT);
      const viewportHeight = clientHeight || 0;

      const visibleCount = viewportHeight
        ? Math.ceil(viewportHeight / itemHeight) + OVERSCAN
        : DEFAULT_BATCH + OVERSCAN;

      let start: number;
      if (opts?.forceToBottom) {
        start = Math.max(0, total - visibleCount);
      } else {
        start = Math.max(0, Math.floor(scrollTop / itemHeight) - OVERSCAN);
      }

      let end = Math.min(total, start + visibleCount + OVERSCAN);

      if (opts?.forceToBottom) {
        end = total;
        start = Math.max(0, end - (visibleCount + OVERSCAN));
      }

      // If we're very close to the bottom, keep everything pinned.
      if (!opts?.forceToBottom && scrollHeight - (scrollTop + viewportHeight) <= itemHeight * 1.5) {
        stickToBottomRef.current = true;
        end = total;
        start = Math.max(0, end - (visibleCount + OVERSCAN));
      }

      const next = clampRange({ start, end }, total);
      setRange((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
    },
    [total]
  );

  const handleScroll = useCallback(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }

    const { scrollTop, clientHeight, scrollHeight } = node;
    const itemHeight = Math.max(32, rowHeightRef.current || ESTIMATED_ROW_HEIGHT);
    const atBottom = scrollHeight - (scrollTop + clientHeight) <= itemHeight * 1.5;
    stickToBottomRef.current = atBottom;
    updateRange(node);
  }, [updateRange]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }

    updateRange(node, { forceToBottom: stickToBottomRef.current });

    if (stickToBottomRef.current) {
      if (typeof node.scrollTo === 'function') {
        node.scrollTo({ top: node.scrollHeight });
      } else {
        node.scrollTop = node.scrollHeight;
      }
    }
  }, [messages, updateRange]);

  useEffect(() => {
    const node = listRef.current;
    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateRange(node, { forceToBottom: stickToBottomRef.current });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [updateRange]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }

    const sample = node.querySelector<HTMLElement>('[data-virtual-item="true"]');
    if (sample) {
      const measured = sample.getBoundingClientRect().height;
      if (measured > 0 && Math.abs(measured - rowHeightRef.current) > 2) {
        rowHeightRef.current = measured;
        updateRange(node, { forceToBottom: stickToBottomRef.current });
      }
    }
  }, [range, updateRange]);

  if (total === 0) {
    return (
      <div ref={listRef} className="chatgpt-thread" aria-label="Conversation" onScroll={handleScroll}>
        <div className="chatgpt-thread-empty">
          Ask anything to begin. The secure assistant will synthesize vetted answers here.
        </div>
      </div>
    );
  }

  const itemHeight = Math.max(32, rowHeightRef.current || ESTIMATED_ROW_HEIGHT);
  const paddingTop = range.start * itemHeight;
  const paddingBottom = Math.max(0, total - range.end) * itemHeight;
  const visibleMessages = messages.slice(range.start, range.end);

  return (
    <div
      ref={listRef}
      className="chatgpt-thread"
      aria-label="Conversation"
      onScroll={handleScroll}
    >
      <div style={{ paddingTop, paddingBottom }}>
        {visibleMessages.map((message) => (
          <div key={message.id} data-virtual-item="true">
            <MessageBubble msg={message} currentTime={currentTime} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
