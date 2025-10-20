import React from 'react';
import type { Message } from '../../types/chat';
import { formatRelative } from '../../lib/time';

type MessageBubbleProps = {
  msg: Message;
  currentTime: number;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, currentTime }) => {
  const isUser = msg.role === 'user';
  const label = isUser ? 'You' : 'Nexus Assistant';

  return (
    <article className={`chatgpt-message-row ${isUser ? 'is-user' : ''}`}>
      <div className="chatgpt-message-avatar" aria-hidden>
        {isUser ? 'You'[0] : 'NX'}
      </div>
      <div className="chatgpt-message-content">
        <div className="chatgpt-message-meta">
          <strong>{label}</strong>
          <span>{formatRelative(msg.ts, currentTime)}</span>
          {!isUser && msg.meta ? <span>{msg.meta}</span> : null}
        </div>
        <div className="chatgpt-message-bubble">{msg.text}</div>
        {isUser && msg.meta ? <div className="chatgpt-message-footnote">{msg.meta}</div> : null}
      </div>
    </article>
  );
};

export default React.memo(MessageBubble);
