/**
 * Background Analysis Hook
 * Runs pattern detection in a Web Worker without blocking UI
 */

import { useEffect, useRef } from 'react';
import { useWorkspace } from './useWorkspace';

type WorkerMessage = {
  type: 'PATTERNS_DETECTED' | 'ERROR';
  patterns?: unknown[];
  error?: string;
};

export function useBackgroundAnalysis(enabled = true) {
  const workerRef = useRef<Worker | null>(null);
  const intervalRef = useRef<number | null>(null);

  const workspaceData = useWorkspace(state => ({
    lists: state.lists,
    tasks: state.tasks,
    calendarEvents: state.calendarEvents,
    connectors: state.connectors,
    pages: state.pages,
    notes: state.notes,
    boards: state.boards,
    flows: state.flows,
    suggestions: state.suggestions,
    analyses: state.analyses,
    history: state.history,
  }));

  const addSuggestion = useWorkspace(state => state.addSuggestion);

  useEffect(() => {
    if (!enabled) return;

    // Create worker
    try {
      workerRef.current = new Worker(
        new URL('../workers/patternDetection.worker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch (error) {
      console.error('Failed to create pattern detection worker:', error);
      return;
    }

    const worker = workerRef.current;

    // Handle messages from worker
    worker.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
      const { type, patterns, error } = event.data;

      if (type === 'PATTERNS_DETECTED' && patterns) {
        // Add new suggestions to workspace
        patterns.forEach(pattern => {
          // Check if suggestion already exists
          const exists = workspaceData.suggestions.some(s => s.id === (pattern as { id: string }).id);
          if (!exists) {
            addSuggestion(pattern as never);
          }
        });
      } else if (type === 'ERROR') {
        console.error('Pattern detection error:', error);
      }
    });

    // Run analysis periodically
    const runAnalysis = () => {
      // Only run if document is visible (tab is active)
      if (document.visibilityState === 'visible' && worker) {
        worker.postMessage({
          type: 'DETECT_PATTERNS',
          data: workspaceData,
        });
      }
    };

    // Initial analysis
    runAnalysis();

    // Periodic analysis every 30 seconds
    intervalRef.current = window.setInterval(runAnalysis, 30000);

    // Re-run when visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runAnalysis();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'STOP' });
        workerRef.current.terminate();
      }
    };
  }, [enabled, workspaceData, addSuggestion]);

  return {
    isRunning: workerRef.current !== null,
  };
}
