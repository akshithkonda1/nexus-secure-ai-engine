import { ZodSchema } from "zod";
import { handleMockRequest } from "@/mocks/server";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

async function request<T>(
  method: HttpMethod,
  url: string,
  schema: ZodSchema<T>,
  options: RequestOptions = {},
): Promise<T> {
  const { body, signal, headers = {} } = options;

  if (import.meta.env.DEV) {
    const mocked = await handleMockRequest(method, url, body);
    if (mocked !== undefined) {
      return schema.parse(mocked);
    }
  }

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    signal,
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);
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
