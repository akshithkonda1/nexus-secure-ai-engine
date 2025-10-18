const env = (import.meta as any)?.env ?? {};

export const API_URL: string = (env.VITE_API_URL || '').replace(/\/+$/, '');
const ALPHA_TOKEN: string = env.VITE_ALPHA_TOKEN || '';

const ABSOLUTE_URL = /^(?:[a-z]+:)?\/\//i;

type RequestOptions = RequestInit & { skipBaseUrl?: boolean };

type BodyValue = BodyInit | null | undefined;

function resolveUrl(path: string, skipBaseUrl?: boolean): string {
  if (skipBaseUrl || ABSOLUTE_URL.test(path) || !API_URL) {
    return path;
  }
  return path.startsWith('/') ? `${API_URL}${path}` : `${API_URL}/${path}`;
}

function normalizeBody(body: unknown): BodyValue {
  if (body === undefined) {
    return undefined;
  }
  if (body === null) {
    return 'null';
  }
  if (
    typeof body === 'string' ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    return body as BodyInit;
  }
  return JSON.stringify(body);
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipBaseUrl, ...init } = options;
  const url = resolveUrl(path, skipBaseUrl);
  const headers = new Headers(init.headers || undefined);

  if (
    init.body !== undefined &&
    !(init.body instanceof FormData) &&
    !(init.body instanceof Blob) &&
    !(init.body instanceof URLSearchParams) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    const error = new Error(`${init.method ?? 'GET'} ${url} failed: ${response.status}`);
    (error as any).response = response;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

function withBody(body: unknown, init?: RequestOptions): RequestOptions {
  const next: RequestOptions = init ? { ...init } : {};
  if (body !== undefined) {
    next.body = normalizeBody(body);
  }
  return next;
}

const baseHeaders: Record<string, string> | undefined = ALPHA_TOKEN
  ? { 'X-Alpha-Token': ALPHA_TOKEN }
  : undefined;

export const api = {
  get<T = unknown>(path: string, init?: RequestOptions) {
    return request<T>(path, { ...init, method: 'GET' });
  },
  post<T = unknown>(path: string, body?: unknown, init?: RequestOptions) {
    return request<T>(path, { ...withBody(body, init), method: 'POST' });
  },
  put<T = unknown>(path: string, body?: unknown, init?: RequestOptions) {
    return request<T>(path, { ...withBody(body, init), method: 'PUT' });
  },
  del<T = unknown>(path: string, init?: RequestOptions) {
    return request<T>(path, { ...init, method: 'DELETE' });
  },
  ask(body: { prompt: string }) {
    return api.post('/ask', body, baseHeaders ? { headers: baseHeaders } : undefined);
  },
  feedback(body: { answerId: string; rating: 'up' | 'down'; tag?: string }) {
    return api.post('/feedback', body, baseHeaders ? { headers: baseHeaders } : undefined);
  },
  events(events: any[]) {
    return api.post('/events', { events }, baseHeaders ? { headers: baseHeaders } : undefined);
  },
};

export type { RequestOptions };
