/**
 * Conflict Detection Component
 * Displays detected conflicts with recommendations
 */

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import type { Conflict } from '../../../types/workspace';

type ConflictDetectionProps = {
  conflicts: Conflict[];
};

const ConflictDetection = memo(function ConflictDetection({ conflicts }: ConflictDetectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const priorityColors = {
    critical: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      badge: 'bg-red-500 text-white',
      text: 'text-red-600 dark:text-red-400',
    },
    high: {
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/5',
      badge: 'bg-orange-500 text-white',
      text: 'text-orange-600 dark:text-orange-400',
    },
    medium: {
      border: 'border-yellow-500/30',
      bg: 'bg-yellow-500/5',
      badge: 'bg-yellow-500 text-black',
      text: 'text-yellow-600 dark:text-yellow-400',
    },
    low: {
      border: 'border-[var(--line-subtle)]',
      bg: 'bg-[var(--bg-elev)]',
      badge: 'bg-[var(--bg-elev)] text-[var(--text-muted)]',
      text: 'text-[var(--text-muted)]',
    },
  };

  const applyRecommendation = (conflict: Conflict) => {
    console.log('Applying recommendation for conflict:', conflict.id);
    // TODO: Implement auto-correction
    alert(`Would apply: ${conflict.recommendation.action}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-bold text-[var(--text)]">
          Conflicts Detected ({conflicts.length})
        </h2>
      </div>

      {conflicts.map((conflict) => {
        const colors = priorityColors[conflict.severity];
        const isExpanded = expandedId === conflict.id;

        return (
          <motion.div
            key={conflict.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${colors.badge}`}>
                    {conflict.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {conflict.type} conflict
                  </span>
                </div>

                {/* Items */}
                <div className="mt-3 space-y-2">
                  {conflict.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <div className={`h-2 w-2 rounded-full ${
                        item.type === 'family' ? 'bg-blue-500' :
                        item.type === 'work' || item.type === 'meeting' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="font-medium text-[var(--text)]">{item.title}</span>
                      {item.time && (
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(item.time).toLocaleString('en-US', {
                            weekday: 'short',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                      <span className="text-xs text-[var(--text-muted)]">
                        (Priority: {item.priority})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="mt-4 rounded-xl bg-[var(--bg-surface)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">
                    Toron Recommendation
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {conflict.analysis.consensus}% consensus ({conflict.analysis.modelsConsulted} models)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--text-muted)]">Human-Centric Score</p>
                  <p className="text-2xl font-bold text-[var(--accent)]">
                    {conflict.analysis.humanCentricScore}/100
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm text-[var(--text)]">
                {conflict.recommendation.action}
              </p>

              {/* Toggle reasoning */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : conflict.id)}
                className="mt-2 flex items-center gap-1 text-xs text-[var(--accent)] transition hover:underline"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Hide reasoning
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    View reasoning
                  </>
                )}
              </button>

              {/* Reasoning */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 space-y-1 rounded-lg bg-[var(--bg-elev)] p-3"
                >
                  {conflict.analysis.reasoning.map((reason, i) => (
                    <p key={i} className="text-xs text-[var(--text-muted)]">
                      • {reason}
                    </p>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => applyRecommendation(conflict)}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                <CheckCircle2 className="h-4 w-4" />
                Apply Recommendation
              </button>
              <button className="rounded-lg border border-[var(--line-subtle)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--bg-elev)]">
                View Alternatives
              </button>
              <button className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--text)]">
                Dismiss
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

export default ConflictDetection;
