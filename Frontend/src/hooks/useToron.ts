/**
 * Toron React Hook
 * Provides easy access to Toron API in React components
 */

import { useState, useCallback } from 'react';
import { getToronClient, queryWithRetry, ToronError } from '../services/toron/client';
import type {
  ToronQueryRequest,
  ToronQueryResponse,
  PatternType,
} from '../types/workspace';

type UseToronOptions = {
  onError?: (error: ToronError) => void;
  retries?: number;
};

export function useToron(options: UseToronOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ToronError | null>(null);
  const [lastResponse, setLastResponse] = useState<ToronQueryResponse | null>(null);

  const query = useCallback(
    async (queryText: string, queryOptions?: Partial<ToronQueryRequest>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await queryWithRetry(
          {
            query: queryText,
            ...queryOptions,
          },
          options.retries || 3
        );

        setLastResponse(response);
        return response;
      } catch (err) {
        const toronError = err instanceof ToronError ? err : new ToronError(String(err));
        setError(toronError);

        if (options.onError) {
          options.onError(toronError);
        }

        throw toronError;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const analyzeSuggestion = useCallback(
    async (widgetType: string, widgetData: unknown, patternType: PatternType) => {
      setLoading(true);
      setError(null);

      try {
        const client = getToronClient();
        const suggestion = await client.analyzeSuggestion(widgetType, widgetData, patternType);
        return suggestion;
      } catch (err) {
        const toronError = err instanceof ToronError ? err : new ToronError(String(err));
        setError(toronError);

        if (options.onError) {
          options.onError(toronError);
        }

        throw toronError;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const analyzeWorkspace = useCallback(
    async (workspaceData: unknown) => {
      setLoading(true);
      setError(null);

      try {
        const client = getToronClient();
        const result = await client.analyzeWorkspace(workspaceData);
        return result;
      } catch (err) {
        const toronError = err instanceof ToronError ? err : new ToronError(String(err));
        setError(toronError);

        if (options.onError) {
          options.onError(toronError);
        }

        throw toronError;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const submitFeedback = useCallback(
    async (suggestionId: string, action: 'accepted' | 'dismissed' | 'customized', details?: unknown) => {
      try {
        const client = getToronClient();
        await client.submitFeedback(suggestionId, action, details);
      } catch (err) {
        // Feedback errors are not critical, just log
        console.error('Failed to submit feedback:', err);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setLastResponse(null);
  }, []);

  return {
    query,
    analyzeSuggestion,
    analyzeWorkspace,
    submitFeedback,
    loading,
    error,
    lastResponse,
    reset,
  };
}

/**
 * Hook for health check
 */
export function useToronHealth() {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const client = getToronClient();
      await client.health();
      setHealthy(true);
    } catch (error) {
      setHealthy(false);
    } finally {
      setChecking(false);
    }
  }, []);

  return { healthy, checking, check };
}
