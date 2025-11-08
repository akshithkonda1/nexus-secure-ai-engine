import { useCallback, useEffect, useRef, useState } from "react";
import { readJSON } from "@/lib/utils";

type Initializer<T> = T | (() => T);

export function useLocalStore<T>(key: string, initial: Initializer<T>) {
  const initRef = useRef(initial);
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return typeof initRef.current === "function"
        ? (initRef.current as () => T)()
        : initRef.current;
    }
    const fallback =
      typeof initRef.current === "function"
        ? (initRef.current as () => T)()
        : initRef.current;
    const raw = window.localStorage.getItem(key);
    return readJSON<T>(raw, fallback);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  const reset = useCallback(() => {
    setState(
      typeof initRef.current === "function"
        ? (initRef.current as () => T)()
        : initRef.current
    );
  }, []);

  return [state, setState, reset] as const;
}
