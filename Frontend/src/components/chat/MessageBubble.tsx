import React from 'react';
import type { Message } from '../../types/chat';
import { formatRelative } from '../../lib/time';
const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const isUser = msg.role==='user';
  return (
    <div className={`my-2 ${isUser?'text-right':''}`}>
      <div className={`inline-block px-3 py-2 rounded-xl ${isUser?'bg-[rgb(var(--ring))] text-white':'card-token'}`}>
        <div className="whitespace-pre-wrap break-words">{msg.text}</div>
        <div className="mt-1 text-[10px] opacity-70">{formatRelative(msg.ts)}</div>
      </div>
    </div>
  );
};
export default MessageBubble;
