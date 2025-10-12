import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types/chat';
import MessageBubble from './MessageBubble';
const ChatList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const listRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{ listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior:'smooth'}); }, [messages]);
  return (
    <div ref={listRef} className="chatgpt-thread" aria-label="Conversation">
      {messages.length===0? (
        <div className="chatgpt-thread-empty">
          Ask anything to begin. The secure assistant will synthesize vetted answers here.
        </div>
      ) : messages.map(m=> <MessageBubble key={m.id} msg={m} />)}
    </div>
  );
};
export default ChatList;
