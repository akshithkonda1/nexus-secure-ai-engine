import React, { useEffect, useMemo, useRef } from 'react';
import type { Message } from '../../types/chat';
import MessageBubble from './MessageBubble';

const ChatList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const currentTime = useMemo(() => Date.now(), [messages]);

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
        messages.map((message) => (
          <MessageBubble key={message.id} msg={message} currentTime={currentTime} />
        ))
      )}
    </div>
  );
};

export default ChatList;
