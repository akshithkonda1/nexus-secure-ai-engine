/**
 * Suggestion Panel Component
 * Floating panel that shows suggestions for a specific window
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';
import SuggestionCard from './SuggestionCard';
import type { Suggestion } from '../../../types/workspace';
import { useWorkspace } from '../../../hooks/useWorkspace';

type SuggestionPanelProps = {
  suggestions: Suggestion[];
  onClose: () => void;
};

export default function SuggestionPanel({
  suggestions,
  onClose,
}: SuggestionPanelProps) {
  const { acceptSuggestion, dismissSuggestion } = useWorkspace();

  if (suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed right-6 top-20 z-30 w-96 max-w-[calc(100vw-3rem)]"
      >
        <div className="rounded-2xl border border-[var(--line-subtle)]/40 bg-[var(--bg-surface)]/95 p-4 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/20">
                <Lightbulb className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  AI Suggestions
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {suggestions.length} {suggestions.length === 1 ? 'idea' : 'ideas'} from Toron
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
              aria-label="Close suggestions"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Suggestions */}
          <div className="max-h-[calc(100vh-12rem)] space-y-3 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {suggestions.map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAccept={() => {
                    acceptSuggestion(suggestion.id);
                    if (suggestions.length === 1) {
                      onClose();
                    }
                  }}
                  onDismiss={() => {
                    dismissSuggestion(suggestion.id);
                    if (suggestions.length === 1) {
                      onClose();
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
