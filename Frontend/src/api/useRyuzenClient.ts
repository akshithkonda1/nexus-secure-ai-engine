import { useCallback, useState } from "react";

interface AskPayload {
  prompt: string;
  context?: Record<string, unknown>;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const normalizeError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected error";
};

export function useRyuzenClient() {
  const [state, setState] = useState<ApiState<unknown>>({ data: null, loading: false, error: null });

  const request = useCallback(
    async <T,>(path: string, options?: RequestInit, retries = 1): Promise<T> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const execute = async (attempt: number): Promise<T> => {
        try {
          const response = await fetch(path, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              ...(options?.headers ?? {}),
            },
            // TODO: insert AES encryption hook for payload/body here when backend key exchange is available.
          });

          if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
          }

          const json = (await response.json()) as T;
          setState({ data: json, loading: false, error: null });
          return json;
        } catch (error) {
          if (attempt < retries) {
            return execute(attempt + 1);
          }
          const normalized = normalizeError(error);
          setState({ data: null, loading: false, error: normalized });
          throw new Error(normalized);
        }
      };

      return execute(0);
    },
    [],
  );

  const health = useCallback(async () => request<{ status: string }>("/api/v1/health"), [request]);
  const listConnectors = useCallback(async () => request<unknown[]>("/api/v1/connectors"), [request]);
  const telemetrySummary = useCallback(async () => request<Record<string, unknown>>("/api/v1/telemetry/summary"), [request]);
  const ask = useCallback(async (payload: AskPayload) => request("/api/v1/ask", { method: "POST", body: JSON.stringify(payload) }), [request]);

  return {
    ...state,
    health,
    listConnectors,
    telemetrySummary,
    ask,
  };
}
