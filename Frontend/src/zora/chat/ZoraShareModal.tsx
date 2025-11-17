"use client";

import React, { useState } from "react";

import { copyToClipboard } from "@/api/zoraClient";

type ZoraShareModalProps = {
  open: boolean;
  onClose(): void;
  shareUrl?: string | null;
  messagePreview?: string | null;
  loading?: boolean;
  error?: string | null;
};

export function ZoraShareModal({
  open,
  onClose,
  shareUrl,
  messagePreview,
  loading,
  error,
}: ZoraShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    if (!shareUrl) return;
    await copyToClipboard(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="zora-share-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200/70 bg-white/10 p-6 text-slate-900 shadow-2xl backdrop-blur-2xl dark:border-slate-700/70 dark:bg-slate-900/50 dark:text-slate-50">
        <div className="space-y-2">
          <h2 id="zora-share-title" className="text-lg font-semibold">
            Share this Zora insight
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Generate a secure link that you can drop into Workspace, docs, or chat.
          </p>
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-white/20 bg-white/30 p-4 text-sm text-slate-800 shadow-inner dark:border-slate-600/30 dark:bg-slate-900/60 dark:text-slate-100">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Preview
            </p>
            <div className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
              {messagePreview ?? "Select a message to share."}
            </div>
          </div>
          <label className="block text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Share link
            <input
              type="text"
              readOnly
              value={shareUrl ?? "Generating share link…"}
              className="mt-1 w-full rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-50"
            />
          </label>
          {error ? (
            <p className="text-sm text-rose-500">{error}</p>
          ) : null}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/40 dark:border-slate-700/70 dark:text-slate-200 dark:hover:bg-slate-800/80"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!shareUrl || loading}
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copied" : loading ? "Generating…" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}
