/**
 * Suggestion Card Component
 * Displays AI-powered suggestions with reasoning and actions
 */

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2, X } from 'lucide-react';
import type { Suggestion } from '../../../types/workspace';
import { useToron } from '../../../hooks/useToron';

type SuggestionCardProps = {
  suggestion: Suggestion;
  onAccept: () => void;
  onDismiss: () => void;
  onCustomize?: () => void;
};

const SuggestionCard = memo(function SuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
  onCustomize,
}: SuggestionCardProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const [showDissent, setShowDissent] = useState(false);
  const { submitFeedback } = useToron();

  const handleAccept = () => {
    submitFeedback(suggestion.id, 'accepted');
    onAccept();
  };

  const handleDismiss = () => {
    submitFeedback(suggestion.id, 'dismissed');
    onDismiss();
  };

  const handleCustomize = () => {
    submitFeedback(suggestion.id, 'customized');
    if (onCustomize) onCustomize();
  };

  const priorityColors = {
    critical: 'border-red-500/30 bg-red-500/8',
    important: 'border-orange-500/30 bg-orange-500/8',
    helpful: 'border-[var(--accent)]/30 bg-[var(--accent)]/8',
    optional: 'border-[var(--line-subtle)]/30 bg-[var(--bg-elev)]/50',
  };

  const priorityBadgeColors = {
    critical: 'bg-red-500 text-white',
    important: 'bg-orange-500 text-white',
    helpful: 'bg-[var(--accent)] text-white',
    optional: 'bg-[var(--bg-elev)] text-[var(--text-muted)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-2xl border p-4 shadow-lg backdrop-blur-xl ${priorityColors[suggestion.priority]}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/20">
          <Sparkles className="h-5 w-5 text-[var(--accent)]" />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--text)]">
                {suggestion.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {suggestion.description}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${priorityBadgeColors[suggestion.priority]}`}
            >
              {suggestion.priority.toUpperCase()}
            </span>
          </div>

          {/* Metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1">
              <span>Confidence:</span>
              <span className="font-semibold text-[var(--text)]">
                {Math.round(suggestion.confidence)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>Consensus:</span>
              <span className="font-semibold text-[var(--text)]">
                {suggestion.modelConsensus.agreed}/{suggestion.modelConsensus.total} models
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>Seen:</span>
              <span className="font-semibold text-[var(--text)]">
                {suggestion.patternFrequency}× before
              </span>
            </div>
          </div>

          {/* Reasoning Toggle */}
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="mt-2 flex items-center gap-1 text-xs text-[var(--accent)] transition hover:underline"
          >
            {showReasoning ? (
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
          {showReasoning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1 rounded-lg bg-[var(--bg-surface)]/50 p-3"
            >
              <p className="text-xs font-semibold text-[var(--text)]">
                Toron Reasoning:
              </p>
              {suggestion.reasoning.map((reason, i) => (
                <p key={i} className="text-xs text-[var(--text-muted)]">
                  • {reason}
                </p>
              ))}

              {/* Dissent */}
              {suggestion.modelConsensus.dissent.length > 0 && (
                <>
                  <button
                    onClick={() => setShowDissent(!showDissent)}
                    className="mt-2 text-xs text-orange-500 hover:underline"
                  >
                    {showDissent ? 'Hide' : 'View'} dissenting models (
                    {suggestion.modelConsensus.dissent.length})
                  </button>
                  {showDissent && (
                    <div className="mt-1 space-y-1 rounded bg-orange-500/10 p-2">
                      {suggestion.modelConsensus.dissent.map((dissent, i) => (
                        <p key={i} className="text-xs text-orange-600 dark:text-orange-400">
                          • {dissent}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleAccept}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accept
            </button>

            {suggestion.actions.length > 1 && onCustomize && (
              <button
                onClick={handleCustomize}
                className="rounded-lg border border-[var(--accent)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
              >
                Customize
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
            >
              <X className="h-3.5 w-3.5" />
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default SuggestionCard;
