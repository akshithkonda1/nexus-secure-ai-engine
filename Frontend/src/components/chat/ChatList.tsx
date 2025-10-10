import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types/chat';
import MessageBubble from './MessageBubble';
const ChatList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const listRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{ listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior:'smooth'}); }, [messages]);
  return (
    <div ref={listRef} className="card-token rounded-2xl p-4 max-h-[60vh] overflow-auto" aria-label="Conversation">
      {messages.length===0? <div className="text-sm opacity-70">Start the conversation—your messages and assistant answers will appear here.</div> : messages.map(m=> <MessageBubble key={m.id} msg={m} />)}
    </div>
  );
};
export default ChatList;
