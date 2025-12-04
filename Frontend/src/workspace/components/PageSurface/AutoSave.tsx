import React, { useEffect, useRef } from "react";
import { autoTitle } from "../../utils/autoTitle";

export type AutoSaveProps = {
  content: string;
  onSave: (payload: { content: string; title: string }) => void;
};

export const AutoSave: React.FC<AutoSaveProps> = ({ content, onSave }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      onSave({ content, title: autoTitle(content) });
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [content, onSave]);

  return (
    <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed" aria-live="polite">
      Auto-saving... (every 2 seconds or on blur)
    </div>
  );
};
