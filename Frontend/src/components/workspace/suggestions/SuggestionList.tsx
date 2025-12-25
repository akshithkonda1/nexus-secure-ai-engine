/**
 * Suggestion List Component
 * Shows all pending suggestions in a panel
 */

import { AnimatePresence } from 'framer-motion';
import SuggestionCard from './SuggestionCard';
import type { Suggestion } from '../../../types/workspace';
import { useWorkspace } from '../../../hooks/useWorkspace';

type SuggestionListProps = {
  suggestions: Suggestion[];
  className?: string;
};

export default function SuggestionList({ suggestions, className }: SuggestionListProps) {
  const { acceptSuggestion, dismissSuggestion } = useWorkspace();

  if (suggestions.length === 0) {
    return (
      <div className={`text-center ${className ?? ''}`}>
        <p className="text-sm text-[var(--text-muted)]">
          No suggestions right now. Keep working, and Toron will learn your patterns!
        </p>
      </div>
    );
  }

  // Sort by priority
  const priorityOrder = { critical: 0, important: 1, helpful: 2, optional: 3 };
  const sortedSuggestions = [...suggestions].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text)]">
          AI Suggestions ({suggestions.length})
        </h2>
        {suggestions.length > 0 && (
          <button
            onClick={() => suggestions.forEach(s => dismissSuggestion(s.id))}
            className="text-xs text-[var(--muted)] transition hover:text-[var(--text)]"
          >
            Dismiss all
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {sortedSuggestions.map(suggestion => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={() => acceptSuggestion(suggestion.id)}
            onDismiss={() => dismissSuggestion(suggestion.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
