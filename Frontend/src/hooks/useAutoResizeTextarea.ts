import { useEffect } from 'react';
export function useAutoResizeTextarea(ref: React.RefObject<HTMLTextAreaElement>, value: string, max = 220) {
  useEffect(() => {
    const el = ref.current; if (!el) return; el.style.height = 'auto'; const next = Math.min(el.scrollHeight, max); el.style.height = `${next}px`;
  }, [ref, value, max]);
}
