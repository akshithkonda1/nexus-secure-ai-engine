/**
 * Analyze Mode Component
 * Full workspace analysis with Toron
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, AlertCircle } from 'lucide-react';
import PermissionDialog from './PermissionDialog';
import ConflictDetection from './ConflictDetection';
import ErrorBoundary from '../ErrorBoundary';
import { useWorkspace } from '../../../hooks/useWorkspace';
import { useToron } from '../../../hooks/useToron';
import { detectConflicts } from '../../../services/workspace/conflicts';
import type { PermissionScope, AnalysisResult } from '../../../types/workspace';

function AnalyzeModeInner() {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPermission = useWorkspace(state => state.hasAnalyzePermission());
  const grantPermission = useWorkspace(state => state.grantAnalyzePermission);
  const workspaceData = useWorkspace(state => ({
    lists: state.lists,
    tasks: state.tasks,
    calendarEvents: state.calendarEvents,
    connectors: state.connectors,
    pages: state.pages,
    notes: state.notes,
    boards: state.boards,
    flows: state.flows,
  }));
  const addAnalysis = useWorkspace(state => state.addAnalysis);
  const analyses = useWorkspace(state => state.analyses);

  const { analyzeWorkspace } = useToron();

  // Check permission on mount
  useEffect(() => {
    if (!hasPermission) {
      setShowPermissionDialog(true);
    }
  }, [hasPermission]);

  const handleGrantPermission = async (scope: PermissionScope) => {
    grantPermission(scope);
    setShowPermissionDialog(false);
    await runAnalysis();
  };

  const handleDenyPermission = () => {
    setShowPermissionDialog(false);
    // Could navigate away or show limited view
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      // Detect conflicts locally first
      const conflicts = await detectConflicts(workspaceData);

      // Analyze with Toron for optimizations
      const toronAnalysis = await analyzeWorkspace(workspaceData);

      // Create analysis result
      const result: AnalysisResult = {
        conflicts,
        optimizations: (toronAnalysis as { optimizations?: typeof result.optimizations })?.optimizations || [],
        autoCorrections: [],
        summary: {
          totalIssues: conflicts.length,
          criticalCount: conflicts.filter(c => c.severity === 'critical').length,
          suggestionsCount: 0,
          timestamp: new Date(),
        },
      };

      addAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (showPermissionDialog) {
    return (
      <PermissionDialog
        onGrant={handleGrantPermission}
        onDeny={handleDenyPermission}
      />
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Permission required to analyze workspace
          </p>
          <button
            onClick={() => setShowPermissionDialog(true)}
            className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Grant Permission
          </button>
        </div>
      </div>
    );
  }

  const latestAnalysis = analyses[analyses.length - 1];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/20">
            <Brain className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Workspace Analysis</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Toron is analyzing your workspace for conflicts and optimizations
            </p>
          </div>
        </div>

        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Run Analysis
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-semibold text-red-600 dark:text-red-400">Analysis Error</p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analysis Results */}
      {analyzing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-muted)]">
            Analyzing workspace with Toron's 8-tier reasoning...
          </p>
        </motion.div>
      ) : latestAnalysis ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[var(--line-subtle)] bg-[var(--bg-surface)] p-4">
              <p className="text-sm text-[var(--text-muted)]">Total Issues</p>
              <p className="text-3xl font-bold text-[var(--text)]">
                {latestAnalysis.summary.totalIssues}
              </p>
            </div>
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">Critical</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {latestAnalysis.summary.criticalCount}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4">
              <p className="text-sm text-[var(--accent)]">Suggestions</p>
              <p className="text-3xl font-bold text-[var(--accent)]">
                {latestAnalysis.summary.suggestionsCount}
              </p>
            </div>
          </div>

          {/* Conflicts */}
          {latestAnalysis.conflicts.length > 0 && (
            <ConflictDetection conflicts={latestAnalysis.conflicts} />
          )}

          {/* No issues */}
          {latestAnalysis.conflicts.length === 0 && (
            <div className="rounded-2xl border border-[var(--line-subtle)] bg-[var(--bg-surface)] p-8 text-center">
              <p className="text-lg font-semibold text-[var(--text)]">
                ✓ No conflicts detected
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Your workspace looks great! Toron found no critical issues.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Brain className="mb-4 h-12 w-12 text-[var(--muted)]" />
          <p className="text-sm text-[var(--text-muted)]">
            Click "Run Analysis" to start analyzing your workspace
          </p>
        </div>
      )}
    </div>
  );
}

export default function AnalyzeMode() {
  return (
    <ErrorBoundary>
      <AnalyzeModeInner />
    </ErrorBoundary>
  );
}
