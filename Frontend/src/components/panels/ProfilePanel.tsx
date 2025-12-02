import React from "react";
import { Mail, Shield, User } from "lucide-react";

const ProfilePanel: React.FC<{ close?: () => void }> = ({ close }) => {
  return (
    <div className="rounded-[32px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-6 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
        <span className="flex items-center gap-2"><User className="h-4 w-4" /> Profile</span>
        {close && (
          <button
            onClick={close}
            className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-1 text-[11px] uppercase tracking-wide text-[color-mix(in_oklab,var(--text)_70%,transparent)]"
          >
            Close
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-4 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400/40 via-sky-400/30 to-purple-400/35 shadow-lg shadow-cyan-500/25" />
        <div>
          <p className="text-lg font-semibold text-[var(--text)]">Ryuzen Operator</p>
          <p className="text-sm text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">ID: RZ-0412-OS</p>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm text-[var(--text)] dark:text-[var(--text)]">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-2 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
          <Mail className="h-4 w-4 text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]" />
          operator@ryuzen.ai
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-2 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
          <Shield className="h-4 w-4 text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]" />
          Security status: MFA active
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
