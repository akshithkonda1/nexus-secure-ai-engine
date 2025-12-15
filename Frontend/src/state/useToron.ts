import { useCallback, useMemo, useRef, useState } from "react";
import toronService, {
  ToronHealthStatus,
  ToronRequestPayload,
  ToronResponse,
  ToronStageChunk,
} from "../services/toronService";

export type ToronStageState = "idle" | "processing" | "escalation" | "disagreement" | "consensus" | "error";

export interface UseToronState<TData = unknown> {
  isGenerating: boolean;
  currentStage: string | null;
  progress: number | null;
  error: string | null;
  status: ToronStageState;
  lastResponse: ToronResponse<TData> | null;
}

export interface UseToronApi<TData = unknown> extends UseToronState<TData> {
  generate: (payload: ToronRequestPayload) => Promise<ToronResponse<TData>>;
  streamGenerate: (
    payload: ToronRequestPayload,
    handlers?: { onChunk?: (chunk: ToronStageChunk<TData>) => void }
  ) => Promise<ToronResponse<TData> | null>;
  cancel: () => void;
  checkHealth: () => Promise<ToronHealthStatus>;
}

const STAGE_STATE_MAP: Record<string, ToronStageState> = {
  analyzing: "processing",
  validating: "processing",
  synthesizing: "processing",
  complete: "consensus",
};

const deriveState = (stage?: string | null): ToronStageState => {
  if (!stage) return "idle";
  return STAGE_STATE_MAP[stage] ?? "processing";
};

export function useToron<TData = unknown>(): UseToronApi<TData> {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ToronResponse<TData> | null>(null);
  const lastRequestId = useRef<string | null>(null);

  const cancel = useCallback(() => {
    if (lastRequestId.current) {
      toronService.cancel(lastRequestId.current);
    }
    lastRequestId.current = null;
    setIsGenerating(false);
    setProgress(null);
    setCurrentStage(null);
  }, []);

  const generate = useCallback(
    async (payload: ToronRequestPayload) => {
      setIsGenerating(true);
      setError(null);
      setProgress(null);
      setCurrentStage(null);
      try {
        const response = await toronService.generate<TData>(payload);
        setCurrentStage(response.stage ?? null);
        setLastResponse(response);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Toron generate failed";
        setError(message);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const streamGenerate = useCallback(
    async (
      payload: ToronRequestPayload,
      handlers?: { onChunk?: (chunk: ToronStageChunk<TData>) => void }
    ): Promise<ToronResponse<TData> | null> => {
      const requestId = payload.requestId ?? `toron-${Date.now()}`;
      lastRequestId.current = requestId;
      setIsGenerating(true);
      setError(null);
      setCurrentStage(null);
      setProgress(0);
      setLastResponse(null);

      try {
        const response = await toronService.streamGenerate<TData>(
          { ...payload, requestId },
          {
            onChunk: (chunk) => {
              setCurrentStage(chunk.stage ?? currentStage);
              if (typeof chunk.progress === "number") {
                setProgress(Math.min(1, Math.max(0, chunk.progress)));
              }
              handlers?.onChunk?.(chunk);
            },
            onComplete: (res) => {
              setLastResponse(res);
              setCurrentStage(res.stage ?? "complete");
              setProgress(1);
            },
            onError: (err) => {
              const message = err instanceof Error ? err.message : "Toron stream failed";
              setError(message);
            },
          }
        );
        return response;
      } finally {
        setIsGenerating(false);
      }
    },
    [currentStage]
  );

  const checkHealth = useCallback(() => toronService.checkHealth(), []);

  const status: ToronStageState = useMemo(() => {
    if (error) return "error";
    return deriveState(currentStage);
  }, [currentStage, error]);

  return {
    isGenerating,
    currentStage,
    progress,
    error,
    status,
    lastResponse,
    generate,
    streamGenerate,
    cancel,
    checkHealth,
  };
}

export default useToron;
