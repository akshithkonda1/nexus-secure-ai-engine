import { ZodSchema } from "zod";
import { handleMockRequest } from "@/mocks/server";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  timeoutMs?: number;
  credentials?: RequestCredentials;
};

const API_BASE_URL = (() => {
  try {
    return (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ?? "";
  } catch {
    return "";
  }
})();

function resolveUrl(url: string) {
  if (/^https?:/i.test(url) || !API_BASE_URL) {
    return url;
  }
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = url.startsWith("/") ? url.slice(1) : url;
  return `${base}/${path}`;
}

function buildSignal(signal: AbortSignal | undefined, timeoutMs: number | undefined) {
  if (timeoutMs === undefined) {
    return { signal, cleanup: () => {} };
  }

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const abortOnParent = () => {
    if (!controller.signal.aborted) {
      controller.abort(signal?.reason ?? new DOMException("Parent aborted", "AbortError"));
    }
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason);
    } else {
      signal.addEventListener("abort", abortOnParent, { once: true });
    }
  }

  timer = setTimeout(() => {
    if (!controller.signal.aborted) {
      controller.abort(new DOMException("Request timed out", "TimeoutError"));
    }
  }, timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timer) clearTimeout(timer);
      if (signal) {
        signal.removeEventListener("abort", abortOnParent);
      }
    },
  } as const;
}

async function request<T>(
  method: HttpMethod,
  url: string,
  schema: ZodSchema<T>,
  options: RequestOptions = {},
): Promise<T> {
  const { body, signal, headers = {}, timeoutMs, credentials } = options;

  if (import.meta.env.DEV) {
    const mocked = await handleMockRequest(method, url, body);
    if (mocked !== undefined) {
      return schema.parse(mocked);
    }
  }

  const endpoint = resolveUrl(url);
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: credentials ?? "include",
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const { signal: finalSignal, cleanup } = buildSignal(signal, timeoutMs);
  init.signal = finalSignal;

  let res: Response;
  try {
    res = await fetch(endpoint, init);
  } finally {
    cleanup();
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${url} → ${res.status}: ${text}`);
  }

  const json = await res.json();
  return schema.parse(json);
}

export function apiGet<T>(url: string, schema: ZodSchema<T>, options?: RequestOptions) {
  return request("GET", url, schema, options);
}

export function apiPost<T>(url: string, schema: ZodSchema<T>, body?: unknown, options?: RequestOptions) {
  return request("POST", url, schema, { ...options, body });
}

export function apiPatch<T>(url: string, schema: ZodSchema<T>, body?: unknown, options?: RequestOptions) {
  return request("PATCH", url, schema, { ...options, body });
}

export function apiDelete<T>(url: string, schema: ZodSchema<T>, options?: RequestOptions) {
  return request("DELETE", url, schema, options);
}
