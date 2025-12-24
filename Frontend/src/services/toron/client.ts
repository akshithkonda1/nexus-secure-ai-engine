/**
 * Toron API Client
 * Handles all communication with Toron's 8-tier epistemic reasoning system
 */

import type {
  ToronQueryRequest,
  ToronQueryResponse,
  Suggestion,
  PatternType,
} from '../../types/workspace';
import { getToronConfig } from './config';

export class ToronError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ToronError';
  }
}

// Anonymize data to preserve privacy
function anonymize(data: unknown): unknown {
  // TODO: Implement proper anonymization
  // For now, just return the data (metadata only)
  return data;
}

export class ToronClient {
  private baseURL: string;
  private apiKey: string;

  constructor(config = getToronConfig()) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
  }

  /**
   * Execute a query using Toron's multi-tier reasoning
   */
  async query(request: ToronQueryRequest): Promise<ToronQueryResponse> {
    try {
      const response = await fetch(`${this.baseURL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Ryuzen-Client': 'workspace',
        },
        body: JSON.stringify({
          query: request.query,
          scope: request.scope || 'widgets',
          depth: request.depth || 4,
          models: request.models || 'all',
          context: request.context,
          includeReasoning: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ToronError(
          `Query failed: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ToronError) {
        throw error;
      }
      throw new ToronError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Analyze widget data for pattern-based suggestions
   */
  async analyzeSuggestion(
    widgetType: string,
    widgetData: unknown,
    patternType: PatternType
  ): Promise<Suggestion> {
    try {
      const response = await fetch(`${this.baseURL}/analyze/pattern`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Ryuzen-Client': 'workspace',
        },
        body: JSON.stringify({
          widgetType,
          data: anonymize(widgetData),
          patternType,
        }),
      });

      if (!response.ok) {
        throw new ToronError(
          `Pattern analysis failed: ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ToronError) {
        throw error;
      }
      throw new ToronError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Request holistic workspace analysis (Analyze mode)
   */
  async analyzeWorkspace(workspaceData: unknown): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseURL}/analyze/workspace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Ryuzen-Client': 'workspace',
        },
        body: JSON.stringify({
          data: workspaceData,
          includeConflicts: true,
          includeOptimizations: true,
          includeAutoCorrections: true,
        }),
      });

      if (!response.ok) {
        throw new ToronError(
          `Workspace analysis failed: ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ToronError) {
        throw error;
      }
      throw new ToronError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Submit feedback on a suggestion (for learning)
   */
  async submitFeedback(
    suggestionId: string,
    action: 'accepted' | 'dismissed' | 'customized',
    details?: unknown
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Ryuzen-Client': 'workspace',
        },
        body: JSON.stringify({
          suggestionId,
          action,
          details,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new ToronError(
          `Feedback submission failed: ${response.statusText}`,
          response.status
        );
      }
    } catch (error) {
      // Don't throw on feedback errors, just log
      console.error('Failed to submit feedback:', error);
    }
  }

  /**
   * Health check
   */
  async health(): Promise<{ status: string; version: string }> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (!response.ok) {
        throw new ToronError('Health check failed', response.status);
      }
      return await response.json();
    } catch (error) {
      throw new ToronError(
        `Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Singleton instance
let toronClientInstance: ToronClient | null = null;

export function getToronClient(): ToronClient {
  if (!toronClientInstance) {
    toronClientInstance = new ToronClient();
  }
  return toronClientInstance;
}

// Query with retry logic
export async function queryWithRetry(
  request: ToronQueryRequest,
  maxRetries = 3
): Promise<ToronQueryResponse> {
  const client = getToronClient();
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.query(request);
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw new ToronError(
    `Query failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  );
}
