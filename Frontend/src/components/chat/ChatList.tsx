import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Message } from '../../types/chat';
import MessageBubble from './MessageBubble';

type DayStamp = { id: string; label: string };

const dayFormatter = (() => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
})();

const formatDay = (ts: number): string => {
  if (dayFormatter) {
    try {
      return dayFormatter.format(ts);
    } catch {
      // fall through to locale string
    }
  }
  return new Date(ts).toLocaleDateString();
};

const isSameDay = (a: number, b: number): boolean => {
  const first = new Date(a);
  const second = new Date(b);
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

const MAX_INITIAL_BATCH = 250;

const computeBaseline = (count: number): number => {
  if (count <= 60) return count;
  if (count <= 160) {
    return Math.max(40, Math.round(count * 0.5));
  }
  if (count <= MAX_INITIAL_BATCH) {
    return Math.max(80, Math.round(count * 0.7));
  }
  return MAX_INITIAL_BATCH;
};

const ChatList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [autoStick, setAutoStick] = useState(true);
  const hasMountedRef = useRef(false);
  const [visibleCount, setVisibleCount] = useState<number>(() =>
    computeBaseline(messages.length)
  );

  useEffect(() => {
    if (messages.length === 0) {
      setVisibleCount(0);
      return;
    }

    const baseline = computeBaseline(messages.length);
    setVisibleCount((prev) => {
      if (prev === 0) {
        return baseline;
      }
      const next = Math.min(messages.length, Math.max(prev, baseline));
      return next;
    });
  }, [messages.length]);

  const currentTime = useMemo(() => Date.now(), [messages]);

  const displayedMessages = useMemo(() => {
    if (visibleCount <= 0) {
      return [] as Message[];
    }
    if (visibleCount >= messages.length) {
      return messages;
    }
    return messages.slice(-visibleCount);
  }, [messages, visibleCount]);

  const latestId = useMemo(
    () => displayedMessages.at(-1)?.id ?? null,
    [displayedMessages]
  );

  const hiddenCount = Math.max(0, messages.length - displayedMessages.length);

  const scrollToBottom = useCallback((behavior?: ScrollBehavior) => {
    const target = bottomRef.current;
    const container = listRef.current;
    if (!target || !container) {
      return;
    }

    const resolved = behavior ?? (hasMountedRef.current ? 'smooth' : 'auto');
    if (typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: resolved, block: 'end' });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  const timeline = useMemo(() => {
    const result: (Message | DayStamp)[] = [];
    displayedMessages.forEach((message, index) => {
      const prev = displayedMessages[index - 1];
      if (!prev || !isSameDay(prev.ts, message.ts)) {
        result.push({ id: `day-${message.id}`, label: formatDay(message.ts) });
      }
      result.push(message);
    });
    return result;
  }, [displayedMessages]);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  const previousLengthRef = useRef(messages.length);

  useLayoutEffect(() => {
    if (!autoStick) {
      previousLengthRef.current = messages.length;
      return;
    }

    const isFirstRender = !hasMountedRef.current;
    if (isFirstRender || messages.length !== previousLengthRef.current) {
      scrollToBottom(isFirstRender ? 'auto' : 'smooth');
    }

    previousLengthRef.current = messages.length;
  }, [messages.length, autoStick, scrollToBottom]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }

    const handleScroll = () => {
      const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
      setAutoStick(distance <= 120);
    };

    handleScroll();
    node.addEventListener('scroll', handleScroll, { passive: true });
    return () => node.removeEventListener('scroll', handleScroll);
  }, []);

  if (displayedMessages.length === 0) {
    return (
      <div ref={listRef} className="chatgpt-thread" aria-label="Conversation history">
        <div className="chatgpt-thread-empty">
          <div className="chatgpt-thread-empty-icon" aria-hidden>
            💬
          </div>
          <h2>How can Nexus help today?</h2>
          <p>
            Ask a question, paste context, or share a document. Nexus will orchestrate trusted
            answers here.
          </p>
        </div>
        <div ref={bottomRef} aria-hidden />
      </div>
    );
  }

  return (
    <div
      className="chatgpt-thread"
      ref={listRef}
      role="log"
      aria-live="polite"
      aria-label="Conversation history"
    >
      {hiddenCount > 0 && (
        <div className="chatgpt-thread-load-more">
          <button
            type="button"
            className="chatgpt-thread-load-more-button"
            onClick={() => {
              setVisibleCount((prev) =>
                Math.min(messages.length, prev + MAX_INITIAL_BATCH)
              );
            }}
          >
            Show earlier messages
          </button>
          <span className="chatgpt-thread-load-more-count">
            {hiddenCount.toLocaleString()} older messages hidden
          </span>
        </div>
      )}

      {timeline.map((item) => {
        if ('label' in item) {
          return (
            <div key={item.id} className="chatgpt-thread-separator" aria-label={item.label}>
              <span>{item.label}</span>
            </div>
          );
        }

        const isLatest = item.id === latestId;
        return (
          <MessageBubble
            key={item.id}
            msg={item}
            currentTime={currentTime}
            isLatest={isLatest}
          />
        );
      })}

      {!autoStick && (
        <button
          type="button"
          className="chatgpt-scroll-to-bottom"
          onClick={() => {
            setAutoStick(true);
            scrollToBottom('smooth');
          }}
        >
          Jump to latest
        </button>
      )}

      <div ref={bottomRef} aria-hidden />
    </div>
  );
};

ChatList.displayName = 'ChatList';

export default React.memo(ChatList);
