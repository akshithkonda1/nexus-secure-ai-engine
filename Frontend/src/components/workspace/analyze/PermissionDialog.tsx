/**
 * Permission Dialog Component
 * Requests user permission to access focus modes for analysis
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Shield, Clock, Check } from 'lucide-react';
import type { PermissionScope } from '../../../types/workspace';

type PermissionDialogProps = {
  onGrant: (scope: PermissionScope) => void;
  onDeny: () => void;
};

export default function PermissionDialog({ onGrant, onDeny }: PermissionDialogProps) {
  const [scope, setScope] = useState<PermissionScope>('session');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg rounded-3xl border border-[var(--line-subtle)] bg-[var(--bg-surface)] p-8 shadow-2xl"
      >
        {/* Icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/20">
          <Brain className="h-8 w-8 text-[var(--accent)]" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[var(--text)]">
          Enable Holistic Analysis?
        </h2>

        {/* Description */}
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Toron needs to read your entire workspace to provide holistic optimization and conflict resolution.
        </p>

        {/* What's included */}
        <div className="mt-4 space-y-2 rounded-xl bg-[var(--bg-elev)] p-4">
          <p className="text-sm font-semibold text-[var(--text)]">This includes:</p>
          <ul className="space-y-1 text-sm text-[var(--text-muted)]">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[var(--accent)]" />
              All widgets (Lists, Tasks, Calendar, Connectors)
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[var(--accent)]" />
              Focus modes (Pages, Notes, Boards, Flows)
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[var(--accent)]" />
              Integration data (GitHub, Linear, Notion)
            </li>
          </ul>
        </div>

        {/* Permission scope */}
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-[var(--text)]">Grant access for:</p>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-3 transition hover:border-[var(--line-subtle)] hover:bg-[var(--bg-elev)]">
              <input
                type="radio"
                name="scope"
                value="analysis"
                checked={scope === 'analysis'}
                onChange={(e) => setScope(e.target.value as PermissionScope)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-sm font-medium text-[var(--text)]">
                    This analysis only
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  One-time access, data deleted immediately after
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-3 transition hover:border-[var(--line-subtle)] hover:bg-[var(--bg-elev)]">
              <input
                type="radio"
                name="scope"
                value="session"
                checked={scope === 'session'}
                onChange={(e) => setScope(e.target.value as PermissionScope)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-sm font-medium text-[var(--text)]">
                    This session
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Until you close Workspace (recommended)
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-3 transition hover:border-[var(--line-subtle)] hover:bg-[var(--bg-elev)]">
              <input
                type="radio"
                name="scope"
                value="always"
                checked={scope === 'always'}
                onChange={(e) => setScope(e.target.value as PermissionScope)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-sm font-medium text-[var(--text)]">
                    Always (revokable anytime)
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Continuous access until revoked in settings
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onGrant(scope)}
            className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-white transition hover:brightness-110"
          >
            Grant Access
          </button>
          <button
            onClick={onDeny}
            className="rounded-xl border border-[var(--line-subtle)] px-4 py-3 font-semibold text-[var(--muted)] transition hover:bg-[var(--bg-elev)]"
          >
            Cancel
          </button>
        </div>

        {/* Privacy note */}
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          🔒 Data is encrypted and deleted from Toron servers after analysis. You can revoke access anytime.
        </p>
      </motion.div>
    </div>
  );
}
