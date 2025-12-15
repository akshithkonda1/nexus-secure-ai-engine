export type ToronStageChunkType = "stage" | "progress" | "complete" | "error";

export interface ToronStageChunk<TData = unknown> {
  type: ToronStageChunkType;
  stage?: string;
  progress?: number;
  data?: TData;
  message?: string;
}

export interface ToronRequestPayload {
  requestId?: string;
  prompt: string;
  attachments?: string[];
  metadata?: Record<string, unknown>;
  stream?: boolean;
}

export interface ToronResponse<TData = unknown> {
  stage?: string;
  output?: string;
  data?: TData;
}

export interface ToronHealthStatus {
  healthy: boolean;
  version?: string;
  latencyMs?: number;
}

export interface ToronSnapshot<TData = unknown> {
  requestId: string;
  stage: string;
  createdAt: string;
  data?: TData;
}

export interface ToronStreamHandlers<TData = unknown> {
  onChunk?: (chunk: ToronStageChunk<TData>) => void;
  onComplete?: (response: ToronResponse<TData>) => void;
  onError?: (error: Error) => void;
}

const API_BASE = "/api/toron";
const activeControllers = new Map<string, AbortController>();

const defaultDecoder = new TextDecoder();

function parseLine<TData>(line: string): ToronStageChunk<TData> | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as ToronStageChunk<TData>;
  } catch (error) {
    console.warn("Unable to parse Toron stream line", error);
    return null;
  }
}

async function readStream<TData>(
  response: Response,
  handlers: ToronStreamHandlers<TData>
): Promise<ToronResponse<TData> | null> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming not supported by the current environment");
  }

  let buffered = "";
  let latest: ToronResponse<TData> | null = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffered += defaultDecoder.decode(value, { stream: true });

    const lines = buffered.split("\n");
    buffered = lines.pop() ?? "";

    for (const line of lines) {
      const chunk = parseLine<TData>(line);
      if (!chunk) continue;
      handlers.onChunk?.(chunk);

      if (chunk.type === "complete") {
        latest = {
          stage: chunk.stage,
          output: typeof chunk.data === "string" ? (chunk.data as string) : undefined,
          data: chunk.data,
        };
      }
    }
  }

  return latest;
}

async function simulateStream<TData>(
  payload: ToronRequestPayload,
  handlers: ToronStreamHandlers<TData>
): Promise<ToronResponse<TData>> {
  const start = Date.now();
  const stagedChunks: ToronStageChunk<TData>[] = [
    { type: "stage", stage: "analyzing", progress: 0.18 },
    { type: "progress", stage: "validating", progress: 0.46 },
    { type: "progress", stage: "synthesizing", progress: 0.74 },
    {
      type: "complete",
      stage: "complete",
      progress: 1,
      data: (`${payload.prompt}\n\nToron synthesized this request with calm, stage-aware processing.` as unknown) as TData,
    },
  ];

  for (const chunk of stagedChunks) {
    const elapsed = Date.now() - start;
    const delay = Math.max(120, 360 - elapsed);
    await new Promise((resolve) => setTimeout(resolve, delay));
    handlers.onChunk?.(chunk);
  }

  const final = stagedChunks[stagedChunks.length - 1];
  const response: ToronResponse<TData> = {
    stage: final.stage,
    output: typeof final.data === "string" ? (final.data as string) : undefined,
    data: final.data,
  };
  handlers.onComplete?.(response);
  return response;
}

export const toronService = {
  async generate<TData>(payload: ToronRequestPayload): Promise<ToronResponse<TData>> {
    const response = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Toron generate failed: ${response.status}`);
    }

    const json = (await response.json()) as ToronResponse<TData>;
    return json;
  },

  async streamGenerate<TData>(
    payload: ToronRequestPayload,
    handlers: ToronStreamHandlers<TData>,
    options: { allowSimulation?: boolean } = { allowSimulation: true }
  ): Promise<ToronResponse<TData> | null> {
    const requestId = payload.requestId ?? `toron-${Date.now()}`;
    const controller = new AbortController();
    activeControllers.set(requestId, controller);

    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, requestId, stream: true }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Toron stream failed: ${response.status}`);
      }

      const latest = await readStream<TData>(response, handlers);
      if (latest) {
        handlers.onComplete?.(latest);
      }
      return latest;
    } catch (error) {
      const err = error as Error;
      if ((err as DOMException).name === "AbortError") {
        return null;
      }
      handlers.onError?.(err);
      if (options.allowSimulation) {
        return simulateStream(payload, handlers);
      }
      throw err;
    } finally {
      activeControllers.delete(requestId);
    }
  },

  cancel(requestId: string) {
    const controller = activeControllers.get(requestId);
    controller?.abort();
    activeControllers.delete(requestId);
  },

  async snapshot<TData>(requestId: string): Promise<ToronSnapshot<TData>> {
    const response = await fetch(`${API_BASE}/snapshots/${encodeURIComponent(requestId)}`);
    if (!response.ok) {
      throw new Error(`Toron snapshot failed: ${response.status}`);
    }
    const json = (await response.json()) as ToronSnapshot<TData>;
    return json;
  },

  async checkHealth(): Promise<ToronHealthStatus> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (!response.ok) {
        return { healthy: false };
      }
      const json = (await response.json()) as ToronHealthStatus;
      return { healthy: true, ...json };
    } catch (error) {
      console.warn("Toron health check failed", error);
      return { healthy: false };
    }
  },
};

export default toronService;
