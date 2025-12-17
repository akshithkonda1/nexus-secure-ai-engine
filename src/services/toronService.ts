import { useCallback, useEffect, useMemo, useState } from "react";

export type ToronSnapshot = Record<string, unknown>;

export type ToronStreamChunk =
  | { type: "stage"; stage: string; payload?: unknown }
  | { type: "progress"; progress: number; stage?: string }
  | {
      type: "complete";
      result: unknown;
      snapshot?: ToronSnapshot;
      metadata?: Record<string, unknown>;
    }
  | { type: "error"; error: string; stage?: string };

export interface ToronGenerateResponse {
  result: unknown;
  snapshot?: ToronSnapshot;
  metadata?: Record<string, unknown>;
}

export type ToronGenerateRequest = Record<string, unknown>;

export interface ToronHealthStatus {
  ok: boolean;
  details?: Record<string, unknown>;
}

export class ToronService {
  private readonly baseUrl: string;
  private streamController: AbortController | null = null;

  constructor(baseUrl = "/api/toron") {
    this.baseUrl = baseUrl;
  }

  async generate(
    payload: ToronGenerateRequest,
    signal?: AbortSignal
  ): Promise<ToronGenerateResponse> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const message = await this.safeReadError(response);
      throw new Error(message);
    }

    return response.json();
  }

  async streamGenerate(
    payload: ToronGenerateRequest,
    onChunk: (chunk: ToronStreamChunk) => void
  ): Promise<void> {
    this.cancelStream();
    this.streamController = new AbortController();

    const response = await fetch(`${this.baseUrl}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
      signal: this.streamController.signal,
    });

    if (!response.ok || !response.body) {
      const message = await this.safeReadError(response);
      throw new Error(message);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const dataLine = event
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.replace(/^data:\s?/, ""))
          .join("\n");

        if (!dataLine) continue;

        try {
          const parsed = JSON.parse(dataLine) as ToronStreamChunk;
          onChunk(parsed);
        } catch (error) {
          console.error("Failed to parse Toron stream chunk", error);
        }
      }
    }
  }

  cancelStream() {
    if (this.streamController) {
      this.streamController.abort();
      this.streamController = null;
    }
  }

  async checkHealth(signal?: AbortSignal): Promise<ToronHealthStatus> {
    const response = await fetch(`${this.baseUrl}/health`, { signal });

    if (!response.ok) {
      const message = await this.safeReadError(response);
      throw new Error(message);
    }

    return response.json();
  }

  async getSnapshot(
    snapshotId: string,
    signal?: AbortSignal
  ): Promise<ToronSnapshot> {
    const response = await fetch(
      `${this.baseUrl}/snapshots/${encodeURIComponent(snapshotId)}`,
      { signal }
    );

    if (!response.ok) {
      const message = await this.safeReadError(response);
      throw new Error(message);
    }

    return response.json();
  }

  private async safeReadError(response: Response): Promise<string> {
    try {
      const text = await response.text();
      return text || `Toron request failed with status ${response.status}`;
    } catch {
      return `Toron request failed with status ${response.status}`;
    }
  }
}

export interface UseToronState {
  isGenerating: boolean;
  currentStage: string | null;
  progress: number | null;
  error: string | null;
}

export interface UseToronActions {
  generate: (payload: ToronGenerateRequest) => Promise<ToronGenerateResponse>;
  streamGenerate: (
    payload: ToronGenerateRequest,
    onChunk?: (chunk: ToronStreamChunk) => void
  ) => Promise<ToronGenerateResponse | null>;
  cancel: () => void;
  checkHealth: () => Promise<ToronHealthStatus>;
}

export type UseToronResult = UseToronState & UseToronActions;

export function useToron(baseUrl?: string): UseToronResult {
  const service = useMemo(() => new ToronService(baseUrl), [baseUrl]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (payload: ToronGenerateRequest): Promise<ToronGenerateResponse> => {
      setIsGenerating(true);
      setError(null);
      setCurrentStage(null);
      setProgress(null);

      try {
        const result = await service.generate(payload);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Toron generate failed";
        setError(message);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [service]
  );

  const streamGenerate = useCallback(
    async (
      payload: ToronGenerateRequest,
      onChunk?: (chunk: ToronStreamChunk) => void
    ): Promise<ToronGenerateResponse | null> => {
      setIsGenerating(true);
      setError(null);
      setCurrentStage(null);
      setProgress(null);

      let finalResult: ToronGenerateResponse | null = null;

      try {
        await service.streamGenerate(payload, (chunk) => {
          onChunk?.(chunk);

          switch (chunk.type) {
            case "stage":
              setCurrentStage(chunk.stage);
              break;
            case "progress":
              setProgress(chunk.progress);
              if (chunk.stage) {
                setCurrentStage(chunk.stage);
              }
              break;
            case "complete":
              finalResult = {
                result: chunk.result,
                snapshot: chunk.snapshot,
                metadata: chunk.metadata,
              };
              setCurrentStage("complete");
              setProgress(100);
              break;
            case "error":
              setError(chunk.error);
              setCurrentStage(chunk.stage ?? null);
              break;
            default:
              break;
          }
        });

        return finalResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Toron stream failed";
        setError(message);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [service]
  );

  const cancel = useCallback(() => {
    service.cancelStream();
    setIsGenerating(false);
  }, [service]);

  const checkHealth = useCallback(() => service.checkHealth(), [service]);

  useEffect(() => () => service.cancelStream(), [service]);

  return {
    isGenerating,
    currentStage,
    progress,
    error,
    generate,
    streamGenerate,
    cancel,
    checkHealth,
  };
}
