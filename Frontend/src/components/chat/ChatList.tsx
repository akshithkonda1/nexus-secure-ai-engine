import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Message } from '../../types/chat';
import MessageBubble from './MessageBubble';

const INITIAL_BATCH_SIZE = 60;
const BATCH_INCREMENT = 60;

const ChatList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [revealedCount, setRevealedCount] = useState(() => Math.min(messages.length, INITIAL_BATCH_SIZE));
  const currentTime = useMemo(() => Date.now(), [messages]);

  useEffect(() => {
    setRevealedCount((prev) => {
      if (messages.length === 0) {
        return 0;
      }

      if (prev === 0) {
        return Math.min(messages.length, INITIAL_BATCH_SIZE);
      }

      return Math.min(messages.length, Math.max(prev, INITIAL_BATCH_SIZE));
    });
  }, [messages.length]);

  const visibleMessages = useMemo(() => {
    if (messages.length === 0) {
      return [] as Message[];
    }

    const count = Math.min(messages.length, revealedCount || INITIAL_BATCH_SIZE);
    const startIndex = Math.max(0, messages.length - count);
    return messages.slice(startIndex);
  }, [messages, revealedCount]);

  const renderedMessages = useMemo(() => {
    if (visibleMessages.length === 0) {
      return [] as React.ReactNode[];
    }

    const items = new Array<React.ReactNode>(visibleMessages.length);
    for (let i = 0; i < visibleMessages.length; i++) {
      const message = visibleMessages[i];
      items[i] = <MessageBubble key={message.id} msg={message} currentTime={currentTime} />;
    }
    return items;
  }, [visibleMessages, currentTime]);

  const canLoadMore = revealedCount < messages.length;

  const handleLoadMore = () => {
    setRevealedCount((prev) => {
      const next = prev === 0 ? INITIAL_BATCH_SIZE : prev + BATCH_INCREMENT;
      return Math.min(messages.length, next);
    });
  };

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }

    if (typeof node.scrollTo === 'function') {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
      return;
    }

    node.scrollTop = node.scrollHeight;
  }, [messages]);

  return (
    <div ref={listRef} className="chatgpt-thread" aria-label="Conversation">
      {messages.length === 0 ? (
        <div className="chatgpt-thread-empty">
          Ask anything to begin. The secure assistant will synthesize vetted answers here.
        </div>
      ) : (
        <>
          {canLoadMore && (
            <div className="chatgpt-thread-load-more">
              <button
                type="button"
                className="chatgpt-thread-load-more-button"
                onClick={handleLoadMore}
              >
                Load older messages
              </button>
              <span role="status" aria-live="polite" className="chatgpt-thread-load-more-count">
                Showing {visibleMessages.length} of {messages.length} messages
              </span>
            </div>
          )}
          {renderedMessages}
        </>
      )}
    </div>
  );
};

export default ChatList;
