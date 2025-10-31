export interface RetryOptions {
  retries?: number;
  initialDelayMs?: number;
}

export async function retryWithBackoff<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 2, initialDelayMs = 150 } = options;

  let attempt = 0;
  let delay = initialDelayMs;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
      delay *= 2;
    }
  }
}
