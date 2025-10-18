export type Json =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | null;

// Request cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache entries
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 5 * 60 * 1000, maxSize: 100 }) {
    this.config = config;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    // Enforce cache size limit
    if (this.cache.size >= this.config.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (typeof firstKey !== 'undefined') {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Remove entries matching pattern
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }
}

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

function dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// Request queue for rate limiting
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private maxConcurrent = 6; // Browser limit
  private activeRequests = 0;
  private minInterval = 50; // Min time between requests

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      if (this.activeRequests >= this.maxConcurrent) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      const request = this.queue.shift();
      if (!request) break;

      this.activeRequests++;
      
      request()
        .finally(() => {
          this.activeRequests--;
        });

      // Rate limiting delay
      await new Promise((resolve) => setTimeout(resolve, this.minInterval));
    }

    this.processing = false;
  }
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (
        error instanceof Response &&
        error.status >= 400 &&
        error.status < 500
      ) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// Main API client
class APIClient {
  private cache: APICache;
  private queue: RequestQueue;
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.cache = new APICache();
    this.queue = new RequestQueue();
    this.baseURL = baseURL;
  }

  private async request<T = unknown>(
    url: string,
    init?: RequestInit,
    options: {
      cache?: boolean;
      cacheTTL?: number;
      retry?: boolean;
      dedupe?: boolean;
    } = {}
  ): Promise<T> {
    const {
      cache: useCache = false,
      cacheTTL,
      retry: useRetry = true,
      dedupe: useDedupe = true,
    } = options;

    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const cacheKey = `${init?.method || 'GET'}:${fullURL}`;

    // Check cache for GET requests
    if (useCache && (!init?.method || init.method === 'GET')) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Create fetcher function
    const fetcher = async (): Promise<T> => {
      const fetchFn = async () => {
        const res = await fetch(fullURL, {
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
          },
          ...init,
        });

        if (!res.ok) {
          throw new Error(
            `${init?.method ?? 'GET'} ${fullURL} failed: ${res.status}`
          );
        }

        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('application/json')
          ? await res.json()
          : await res.text();

        return data as T;
      };

      // Add to queue and optionally retry
      const result = await this.queue.add(() =>
        useRetry ? retryWithBackoff(fetchFn) : fetchFn()
      );

      // Cache successful GET responses
      if (useCache && (!init?.method || init.method === 'GET')) {
        if (cacheTTL) {
          this.cache.set(cacheKey, result);
        } else {
          this.cache.set(cacheKey, result);
        }
      }

      return result;
    };

    // Deduplicate concurrent identical requests
    if (useDedupe && (!init?.method || init.method === 'GET')) {
      return dedupe(cacheKey, fetcher);
    }

    return fetcher();
  }

  async get<T = unknown>(
    url: string,
    options?: {
      cache?: boolean;
      cacheTTL?: number;
      headers?: HeadersInit;
    }
  ): Promise<T> {
    return this.request<T>(url, { method: 'GET' }, { ...options, cache: options?.cache ?? true });
  }

  async post<T = unknown>(
    url: string,
    body?: unknown,
    options?: {
      headers?: HeadersInit;
      retry?: boolean;
    }
  ): Promise<T> {
    return this.request<T>(
      url,
      {
        method: 'POST',
        body: body !== undefined ? JSON.stringify(body) : undefined,
        headers: options?.headers,
      },
      { cache: false, retry: options?.retry }
    );
  }

  async put<T = unknown>(
    url: string,
    body?: unknown,
    options?: {
      headers?: HeadersInit;
      retry?: boolean;
    }
  ): Promise<T> {
    return this.request<T>(
      url,
      {
        method: 'PUT',
        body: body !== undefined ? JSON.stringify(body) : undefined,
        headers: options?.headers,
      },
      { cache: false, retry: options?.retry }
    );
  }

  async delete<T = unknown>(
    url: string,
    options?: {
      headers?: HeadersInit;
      retry?: boolean;
    }
  ): Promise<T> {
    return this.request<T>(
      url,
      {
        method: 'DELETE',
        headers: options?.headers,
      },
      { cache: false, retry: options?.retry }
    );
  }

  // Cache management
  invalidateCache(pattern?: string): void {
    this.cache.invalidate(pattern);
  }

  clearCache(): void {
    this.cache.invalidate();
  }
}

// Create singleton instance
const API_URL = import.meta.env.VITE_API_URL || '';
export const api = new APIClient(API_URL);

// Convenience methods for common patterns
export const apiHelpers = {
  // Batch requests
  async batch<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(requests.map((req) => req()));
  },

  // Parallel requests with limit
  async parallel<T>(
    requests: Array<() => Promise<T>>,
    concurrency = 3
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const request of requests) {
      const promise = request().then((result) => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex((p) => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  },

  // Polling with exponential backoff
  async poll<T>(
    fn: () => Promise<T>,
    condition: (data: T) => boolean,
    options: {
      maxAttempts?: number;
      initialDelay?: number;
      maxDelay?: number;
      backoffMultiplier?: number;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 10,
      initialDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 1.5,
    } = options;

    let attempt = 0;
    let delay = initialDelay;

    while (attempt < maxAttempts) {
      const result = await fn();

      if (condition(result)) {
        return result;
      }

      attempt++;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }

    throw new Error('Polling timeout: condition not met');
  },

  // Prefetch data for optimization
  prefetch(urls: string[]): void {
    urls.forEach((url) => {
      api.get(url, { cache: true }).catch(() => {
        // Silently fail prefetch
      });
    });
  },
};

// React Query integration (optional)
export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
};

// WebSocket client with reconnection
export class WSClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const handlers = this.listeners.get(message.type) || new Set();
            handlers.forEach((handler) => handler(message.data));
          } catch (error) {
            console.error('WebSocket message parse error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.reconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms...`);
    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  on(type: string, handler: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Usage examples:
/*
// Basic usage
const data = await api.get('/users');
await api.post('/users', { name: 'John' });

// With caching
const cachedData = await api.get('/config', { cache: true, cacheTTL: 60000 });

// Invalidate cache
api.invalidateCache('/users/*');

// Batch requests
const [users, posts] = await apiHelpers.batch([
  () => api.get('/users'),
  () => api.get('/posts'),
]);

// Parallel with concurrency limit
const results = await apiHelpers.parallel(
  urls.map(url => () => api.get(url)),
  3 // max 3 concurrent requests
);

// Polling
const result = await apiHelpers.poll(
  () => api.get('/job/123'),
  (data) => data.status === 'complete',
  { maxAttempts: 20, initialDelay: 2000 }
);

// Prefetch
apiHelpers.prefetch(['/users', '/config', '/sessions']);

// WebSocket
const ws = new WSClient('wss://api.example.com/ws');
await ws.connect();

const unsubscribe = ws.on('message', (data) => {
  console.log('Received:', data);
});

ws.send('subscribe', { channel: 'updates' });
*/
