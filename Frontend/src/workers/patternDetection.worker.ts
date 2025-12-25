/**
 * Pattern Detection Web Worker
 * Runs pattern detection in background to avoid blocking UI
 */

import { detectAllPatterns } from '../services/workspace/patterns';
import type { WorkspaceDataPayload, SuggestionPayload } from '../types/workspace';

// Message types
type WorkerMessage =
  | { type: 'DETECT_PATTERNS'; data: WorkspaceDataPayload }
  | { type: 'STOP' };

type WorkerResponse =
  | { type: 'PATTERNS_DETECTED'; patterns: SuggestionPayload[] }
  | { type: 'ERROR'; error: string };

// Listen for messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'DETECT_PATTERNS':
        if ('data' in event.data) {
          const patterns = detectAllPatterns(event.data.data);
          const response: WorkerResponse = {
            type: 'PATTERNS_DETECTED',
            patterns,
          };
          self.postMessage(response);
        }
        break;

      case 'STOP':
        self.close();
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    const errorResponse: WorkerResponse = {
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    self.postMessage(errorResponse);
  }
});

// Export empty object to make this a module
export {};
