export type Json =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | null;

async function request<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init
  });

  if (!res.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${url} failed: ${res.status}`);
  }

  const ct = res.headers.get('content-type') || '';
  return (ct.includes('application/json') ? await res.json() : await res.text()) as T;
}

export const api = {
  get<T = unknown>(url: string, init?: RequestInit) {
    return request<T>(url, { ...init, method: 'GET' });
  },
  post<T = unknown>(url: string, body?: unknown, init?: RequestInit) {
    return request<T>(url, {
      ...init,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  },
  put<T = unknown>(url: string, body?: unknown, init?: RequestInit) {
    return request<T>(url, {
      ...init,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  },
  del<T = unknown>(url: string, init?: RequestInit) {
    return request<T>(url, { ...init, method: 'DELETE' });
  }
};
