import { useCallback, useEffect, useRef, useState } from "react";

export type DebateSource = {
  url: string;
  title?: string;
  snippet?: string;
};

export type DebateAnswer = {
  text: string;
  model?: string;
  latency?: number;
  participants?: string[];
  sources?: DebateSource[];
  meta?: Record<string, any>;
  winner?: string;
};

type DebateStreamRequest = {
  prompt: string;
  models?: string[];
  piiProtection?: boolean;
  piiOverride?: boolean;
};

type DebateStreamEvent = {
  type?: string;
  [key: string]: any;
};

const API_BASE_URL = (() => {
  try {
    return (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ?? "";
  } catch {
    return "";
  }
})();

const resolveApiKey = (): string | undefined => {
  try {
    const envKey = (import.meta as unknown as { env?: { VITE_API_KEY?: string } }).env?.VITE_API_KEY;
    if (envKey?.trim()) {
      return envKey.trim();
    }
  } catch {
    // ignore
  }
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage?.getItem("nexus.apiKey")?.trim();
      if (stored) {
        return stored;
      }
    } catch {
      // ignore storage errors
    }
  }
  if (typeof document !== "undefined") {
    const metaKey = document.querySelector('meta[name="x-api-key"]')?.getAttribute("content")?.trim();
    if (metaKey) {
      return metaKey;
    }
  }
  return undefined;
};

const resolveUrl = (path: string) => {
  if (!API_BASE_URL || /^https?:/i.test(path)) {
    return path;
  }
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${base}/${normalized}`;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const normalizeAnswer = (payload: any): DebateAnswer => {
  if (!payload) {
    return { text: "" };
  }
  const sourceList = Array.isArray(payload.sources)
    ? payload.sources
    : Array.isArray(payload.result?.sources)
      ? payload.result.sources
      : [];
  return {
    text: payload.answer ?? payload.text ?? payload.result?.answer ?? "",
    model: payload.model ?? payload.winner ?? payload.result?.winner,
    latency: typeof payload.latency === "number" ? payload.latency : undefined,
    participants: payload.participants ?? payload.result?.participants ?? [],
    sources: sourceList,
    meta: payload.meta ?? payload.result?.meta,
    winner: payload.winner ?? payload.result?.winner,
  };
};

export function useStreamingDebate() {
  const [firstAnswer, setFirstAnswer] = useState<DebateAnswer | null>(null);
  const [partialAnswer, setPartialAnswer] = useState<DebateAnswer | null>(null);
  const [finalAnswer, setFinalAnswer] = useState<DebateAnswer | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, []);

  const start = useCallback(
    async ({ prompt, models = [], piiProtection = true, piiOverride = false }: DebateStreamRequest) => {
      if (!prompt?.trim()) {
        return;
      }
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      setIsStreaming(true);
      setError(null);
      setFirstAnswer(null);
      setPartialAnswer(null);
      setFinalAnswer(null);
      setProgress(0);

      const handleEvent = (event: DebateStreamEvent) => {
        if (!event || !event.type) {
          return;
        }
        switch (event.type) {
          case "start":
            setProgress((prev) => (prev === 0 ? 0.05 : prev));
            break;
          case "progress":
            if (typeof event.value === "number") {
              setProgress((prev) => Math.max(prev, clamp(event.value)));
            }
            break;
          case "first_answer":
            setFirstAnswer(normalizeAnswer(event));
            setProgress((prev) => Math.max(prev, 0.35));
            break;
          case "consensus":
            setPartialAnswer(normalizeAnswer(event));
            setProgress((prev) => Math.max(prev, 0.6));
            break;
          case "final_answer":
            setFinalAnswer(normalizeAnswer(event));
            setProgress(1);
            break;
          case "complete":
            if (event.result) {
              setFinalAnswer(normalizeAnswer(event.result));
            }
            setProgress(1);
            setIsStreaming(false);
            break;
          case "error":
            setError(event.message ?? "Streaming error");
            setIsStreaming(false);
            break;
          default:
            break;
        }
      };

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        const apiKey = resolveApiKey();
        if (apiKey) {
          headers["X-API-Key"] = apiKey;
        }
        const response = await fetch(resolveUrl("/debate/stream"), {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            prompt,
            models,
            pii_protection: piiProtection,
            pii_override: piiOverride,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Streaming failed (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        const processBuffer = () => {
          let boundary = buffer.indexOf("\n\n");
          while (boundary !== -1) {
            const raw = buffer.slice(0, boundary).trim();
            buffer = buffer.slice(boundary + 2);
            if (raw) {
              const dataPayload = raw
                .split("\n")
                .filter((line) => line.startsWith("data:"))
                .map((line) => line.replace(/^data:\s*/, ""))
                .join("");
              if (dataPayload) {
                try {
                  const parsed = JSON.parse(dataPayload);
                  handleEvent(parsed as DebateStreamEvent);
                } catch (parseError) {
                  console.error("Failed to parse SSE payload", parseError);
                }
              }
            }
            boundary = buffer.indexOf("\n\n");
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          processBuffer();
        }
        buffer += decoder.decode();
        processBuffer();
      } catch (err) {
        const domErr = err as DOMException;
        if (domErr?.name === "AbortError") {
          return;
        }
        setError((err as Error)?.message ?? "Streaming error");
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
        setIsStreaming(false);
      }
    },
    [],
  );

  return {
    start,
    cancel,
    firstAnswer,
    partialAnswer,
    finalAnswer,
    progress,
    error,
    isStreaming,
  };
}
