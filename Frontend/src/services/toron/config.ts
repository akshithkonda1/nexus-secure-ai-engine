/**
 * Toron API Configuration
 */

export type ToronConfig = {
  baseURL: string;
  apiKey: string;
};

export function getToronConfig(): ToronConfig {
  // In production, these should come from environment variables
  return {
    baseURL: import.meta.env.VITE_TORON_API_URL || 'http://localhost:8000/api/toron',
    apiKey: import.meta.env.VITE_TORON_API_KEY || 'dev-key',
  };
}
