import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  FileWarning,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Workflow,
} from "lucide-react";

import { requestDocumentsView } from "@/lib/actions";

type SafetyMode = "relaxed" | "balanced" | "strict";

const SAFETY_MODES: {
  id: SafetyMode;
  label: string;
  tagline: string;
  barFill: number; // 0–100
}[] = [
  {
    id: "relaxed",
    label: "Relaxed",
    tagline: "Fewer blocks, more flexibility. Great for exploration and creative play.",
    barFill: 62,
  },
  {
    id: "balanced",
    label: "Balanced",
    tagline: "The default: helpful AI with strong guardrails for everyday use.",
    barFill: 78,
  },
  {
    id: "strict",
    label: "Strict",
    tagline: "Maximum caution for sensitive work, young users, or high-risk topics.",
    barFill: 92,
  },
];

const checklist = [
  {
    id: "ctl-1",
    title: "Turn on two-factor authentication",
    badge: "1 min",
    body: "Add a second step at sign-in so your chat history and settings stay locked to you.",
    tone: "ok" as const,
  },
  {
    id: "ctl-2",
    title: "Review what data you share with AI",
    badge: "Privacy tip",
    body: "Avoid full IDs, passwords, or anything you wouldn’t email to a colleague you barely know.",
    tone: "warn" as const,
  },
  {
    id: "ctl-3",
    title: "Set your data retention window",
    badge: "Recommended",
    body: "Choose how long chats are kept before auto-delete, so your history matches your comfort level.",
    tone: "ok" as const,
  },
];

const safetyEvents = [
  {
    id: "evt-1",
    label: "Blocked sensitive upload",
    detail: "Potential financial account number removed from a file.",
    when: "Just now",
    level: "high" as const,
  },
  {
    id: "evt-2",
    label: "Flagged risky prompt",
    detail: "Request for medical advice routed for extra safety checks.",
    when: "2 hours ago",
    level: "med" as const,
  },
  {
    id: "evt-3",
    label: "History cleared",
    detail: "You removed 18 older conversations from your account.",
    when: "Yesterday",
    level: "info" as const,
  },
];

export function Governance() {
  const [mode, setMode] = useState<SafetyMode>("balanced");
  const [completedChecklist, setCompletedChecklist] = useState<string[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [isChecklistOpen, setIsChecklistOpen] = useState(true);

  const activeMode =
    SAFETY_MODES.find((m) => m.id === mode) ?? SAFETY_MODES[1];

  const checklistProgress = {
    total: checklist.length,
    done: completedChecklist.length,
  };

  return (
    <div className="space-y-8">
      {/* HERO / INTRO */}
      <header className="panel panel--glassy panel--immersive panel--edge panel--halo panel--alive panel--glow panel--gradient-border rounded-[28px] border border-[rgba(var(--border),0.7)] bg-[radial-gradient(circle_at_top,_rgba(var(--brand-soft),0.18),_transparent)_0_0/100%_50%_no-repeat,_rgba(var(--surface),0.9)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">
              Zora safety center
            </p>
            <h1 className="accent-ink text-2xl font-semibold leading-snug text-[rgb(var(--text))] sm:text-3xl">
              AI that feels powerful <span className="text-brand">and</span>{" "}
              private.
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-[rgba(var(--subtle),0.84)]">
              This is your home base for AI security. See how protected you are,
              understand what we do behind the scenes, and follow a simple
              checklist to stay safe while you create, explore, and ship.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-3xl border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.9)] px-4 py-3 text-sm shadow-[var(--shadow-soft)]">
            <ShieldCheck className="size-7 text-brand" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.75)]">
                Overall safety
              </p>
              <p className="text-sm font-semibold text-[rgb(var(--text))]">
                Strong protection
              </p>
              <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                Encryption on • Safety filters on • Tracking off
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* SAFETY SNAPSHOT */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Left: score + bar + mode switch */}
        <div className="panel panel--glassy panel--immersive panel--alive panel--glow rounded-[24px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.9)] p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(var(--subtle),0.7)]">
                Your safety snapshot
              </p>
              <p className="mt-1 text-lg font-semibold text-[rgb(var(--text))]">
                Mode: {activeMode.label}
              </p>
              <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.82)]">
                {activeMode.tagline}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.95)] p-1 text-[10px] font-semibold text-[rgba(var(--subtle),0.9)]">
              {SAFETY_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`rounded-full px-2.5 py-1 transition ${
                    m.id === mode
                      ? "bg-[rgba(var(--brand-soft),0.28)] text-brand shadow-[0_0_0_1px_rgba(var(--brand),0.36)]"
                      : "text-[rgba(var(--subtle),0.85)] hover:bg-[rgba(var(--panel),0.9)]"
                  }`}
                  aria-pressed={m.id === mode}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* pseudo score bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[rgba(var(--subtle),0.8)]">
              <span>Privacy</span>
              <span>Safety</span>
              <span>Control</span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-[rgba(var(--border),0.5)]">
              <div
                className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,rgba(var(--accent-emerald),0.95),rgba(var(--brand),0.95))]"
                style={{ width: `${activeMode.barFill}%` }}
              />
            </div>
            <p className="text-[11px] text-[rgba(var(--subtle),0.85)]">
              We tune filters, redaction, and logging to match your chosen mode.
              You can adjust this at any time.
            </p>
          </div>

          {/* three-pill summary */}
          <dl className="mt-4 grid gap-3 text-xs text-[rgba(var(--subtle),0.9)] sm:grid-cols-3">
            <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.9)] px-3 py-2.5">
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.85)]">
                <Lock className="size-3.5 text-brand" /> Your data
              </dt>
              <dd className="mt-1 text-[11px]">
                Encrypted in transit and at rest. No selling your data. You stay
                in control.
              </dd>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.9)] px-3 py-2.5">
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.85)]">
                <UserCheck className="size-3.5 text-brand" /> Your account
              </dt>
              <dd className="mt-1 text-[11px]">
                Designed for single-owner access with optional 2FA and device
                sign-out.
              </dd>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.9)] px-3 py-2.5">
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.85)]">
                <ShieldAlert className="size-3.5 text-brand" /> AI behavior
              </dt>
              <dd className="mt-1 text-[11px]">
                Safety filters watch for harmful, biased, or dangerous outputs
                before they hit your screen.
              </dd>
            </div>
          </dl>
        </div>

        {/* Right: quick metrics / status */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="panel panel--glassy panel--alive rounded-[22px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.9)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <Workflow className="size-5 text-brand" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(var(--subtle),0.7)]">
                  Safety filters
                </p>
                <p className="text-sm font-semibold text-[rgb(var(--text))]">
                  High protection enabled
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[rgba(var(--subtle),0.82)]">
              We automatically down-rank or block content that looks harmful,
              spammy, or clearly wrong for everyday use.
            </p>
          </div>

          <div className="panel panel--glassy panel--alive rounded-[22px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.9)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(var(--subtle),0.7)]">
                  Data retention
                </p>
                <p className="text-sm font-semibold text-[rgb(var(--text))]">
                  Auto-delete after 90 days
                </p>
              </div>
              <span className="rounded-full border border-[rgba(var(--border),0.55)] bg-[rgba(var(--panel),0.95)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.9)]">
                Editable in settings
              </span>
            </div>
            <p className="mt-2 text-[11px] text-[rgba(var(--subtle),0.82)]">
              Shorter windows mean less long-term data, longer windows mean a
              richer history. You choose the balance.
            </p>
          </div>
        </div>
      </section>

      {/* CHECKLIST (collapsible) */}
      <section className="panel panel--glassy panel--immersive panel--alive panel--glow panel--gradient-border rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.9)] p-6 shadow-[var(--shadow-soft)]">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsChecklistOpen((prev) => !prev)}
            className="flex flex-1 items-center justify-between gap-3 text-left"
            aria-expanded={isChecklistOpen}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">
                Next best steps
              </p>
              <h2 className="accent-ink text-lg font-semibold text-[rgb(var(--text))]">
                Three things you can do today
              </h2>
              <p className="mt-1 text-xs text-[rgba(var(--subtle),0.82)]">
                These aren&apos;t required—but if you complete them, you&apos;ll be
                operating at the same safety level we recommend for journalists,
                creators, and power users.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="hidden text-[11px] text-[rgba(var(--subtle),0.78)] sm:inline">
                {checklistProgress.done}/{checklistProgress.total} done
              </p>
              <span
                className={`flex size-7 items-center justify-center rounded-full border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.95)] transition-transform ${
                  isChecklistOpen ? "rotate-180" : ""
                }`}
              >
                <ChevronDown className="size-4 text-[rgba(var(--subtle),0.9)]" />
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => requestDocumentsView("audit")}
            className="btn btn-ghost btn-neo btn-quiet rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand"
          >
            <FileWarning className="size-4" /> View full activity log
          </button>
        </header>

        {isChecklistOpen && (
          <>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[rgba(var(--subtle),0.8)]">
              <p>
                {checklistProgress.done} of {checklistProgress.total} steps
                completed
              </p>
              {checklistProgress.done === checklistProgress.total && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--accent-emerald),0.2)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--accent-emerald-ink))]">
                  <CheckCircle className="size-3" /> Fully secured
                </span>
              )}
            </div>

            <ul className="mt-3 space-y-3">
              {checklist.map((item) => {
                const isDone = completedChecklist.includes(item.id);

                return (
                  <li
                    key={item.id}
                    className="panel panel--glassy panel--hover panel--alive flex items-start justify-between rounded-2xl border border-[rgba(var(--border),0.65)] bg-[rgba(var(--panel),0.72)] px-4 py-3 text-sm text-[rgb(var(--text))]"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setCompletedChecklist((current) =>
                            current.includes(item.id)
                              ? current.filter((id) => id !== item.id)
                              : [...current, item.id]
                          )
                        }
                        className={`mt-0.5 flex size-4 items-center justify-center rounded-[10px] border text-[10px] transition ${
                          isDone
                            ? "border-[rgba(var(--accent-emerald),0.9)] bg-[rgba(var(--accent-emerald),0.25)] text-[rgb(var(--accent-emerald-ink))]"
                            : "border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.9)] text-[rgba(var(--subtle),0.7)] hover:border-[rgba(var(--brand),0.5)]"
                        }`}
                        aria-pressed={isDone}
                        aria-label={
                          isDone
                            ? `Mark "${item.title}" as not done`
                            : `Mark "${item.title}" as done`
                        }
                      >
                        {isDone ? "✓" : ""}
                      </button>

                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs text-[rgba(var(--subtle),0.78)]">
                          {item.body}
                        </p>
                      </div>
                    </div>
                    <div className="ml-3 text-right text-xs">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                          item.tone === "ok"
                            ? "chip chip--ok"
                            : "chip chip--warn"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {/* RECENT SAFETY ACTIVITY */}
      <section className="panel panel--glassy panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.9)] p-6 shadow-[var(--shadow-soft)]">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-brand" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">
                Recent safety activity
              </p>
              <p className="text-sm font-semibold text-[rgb(var(--text))]">
                How we&apos;ve been protecting you
              </p>
            </div>
          </div>
          <span className="rounded-full border border-[rgba(var(--border),0.55)] bg-[rgba(var(--panel),0.95)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.9)]">
            No incidents open
          </span>
        </header>

        <ul className="mt-4 space-y-3 text-sm">
          {safetyEvents.map((event) => {
            const isExpanded = expandedEventId === event.id;

            return (
              <li
                key={event.id}
                className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.72)]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedEventId((current) =>
                      current === event.id ? null : event.id
                    )
                  }
                  className="flex w-full items-start justify-between px-4 py-3 text-left"
                >
                  <div className="max-w-md">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                          event.level === "high"
                            ? "bg-[rgba(var(--status-critical),0.18)] text-[rgb(var(--status-critical))]"
                            : event.level === "med"
                            ? "bg-[rgba(var(--status-warning),0.18)] text-[rgb(var(--status-warning))]"
                            : "bg-[rgba(var(--border),0.5)] text-[rgba(var(--subtle),0.95)]"
                        }`}
                      >
                        {event.level === "high"
                          ? "Blocked"
                          : event.level === "med"
                          ? "Reviewed"
                          : "Info"}
                      </span>
                      <p className="text-sm font-semibold text-[rgb(var(--text))]">
                        {event.label}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
                      {event.detail}
                    </p>
                  </div>
                  <p className="ml-3 whitespace-nowrap text-[11px] text-[rgba(var(--subtle),0.75)]">
                    {event.when}
                  </p>
                </button>

                {isExpanded && (
                  <div className="border-t border-[rgba(var(--border),0.4)] px-4 pb-3 pt-2 text-[11px] text-[rgba(var(--subtle),0.9)]">
                    <p className="font-semibold text-[rgb(var(--text))]">
                      What this means
                    </p>
                    <p className="mt-1">
                      We apply extra checks when content looks sensitive or
                      risky. This keeps your data safer and reduces harmful or
                      misleading outputs.
                    </p>
                    <p className="mt-2 font-semibold text-[rgb(var(--text))]">
                      What you can do
                    </p>
                    <ul className="mt-1 ml-4 list-disc space-y-0.5">
                      <li>Remove any private info that isn&apos;t needed.</li>
                      <li>Rephrase the request with more context, less detail.</li>
                      <li>
                        If this looks wrong, report it in settings so we can
                        improve.
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* BEST PRACTICES / EDUCATION */}
      <section className="panel panel--glassy panel--immersive panel--alive panel--glow rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[radial-gradient(circle_at_top,_rgba(var(--brand-soft),0.16),_transparent)_0_0/100%_60%_no-repeat,_rgba(var(--surface),0.9)] p-6 shadow-[var(--shadow-soft)]">
        <header className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">
          <AlertTriangle className="size-4 text-brand" /> Everyday best
          practices
        </header>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.85)]">
              Before you share
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-[rgba(var(--subtle),0.9)]">
              <li>Strip out full names, account numbers, and exact addresses.</li>
              <li>
                If it&apos;s too sensitive for a group chat, it&apos;s probably too
                sensitive for AI.
              </li>
              <li>Keep originals stored somewhere you control, not just here.</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.85)]">
              While you chat
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-[rgba(var(--subtle),0.9)]">
              <li>
                Use AI as a co-pilot, not an oracle—especially for health,
                money, or legal decisions.
              </li>
              <li>
                Ask, &quot;What are the limits of this answer?&quot; to surface
                uncertainty.
              </li>
              <li>
                Pause if something feels off, biased, or unsafe and report it.
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.85)]">
              After you&apos;re done
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-[rgba(var(--subtle),0.9)]">
              <li>Clear chats that include real people or sensitive projects.</li>
              <li>
                Download important outputs so you&apos;re not dependent on one
                tool forever.
              </li>
              <li>Review your settings once in a while—your needs will change.</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-[rgba(var(--subtle),0.8)]">
          Zora handles the heavy lifting—encryption, filters, monitoring. These
          habits are the human layer that makes the whole system feel calm,
          predictable, and yours.
        </p>
      </section>

      {/* CRISIS & HOTLINE RESOURCES */}
      <section className="panel panel--glassy panel--alive rounded-[24px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.96)] p-5 shadow-[var(--shadow-soft)]">
        <header className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-[rgb(var(--status-critical))]" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.8)]">
              If you or someone you know is in crisis
            </p>
            <p className="text-xs text-[rgba(var(--subtle),0.85)]">
              Zora is not an emergency service. If you&apos;re in immediate danger
              or thinking about harming yourself, please reach out to a real
              human right away.
            </p>
          </div>
        </header>
        <div className="mt-3 grid gap-4 text-[11px] text-[rgba(var(--subtle),0.9)] md:grid-cols-3">
          <div>
            <p className="font-semibold text-[rgb(var(--text))]">
              United States & Canada
            </p>
            <ul className="mt-1 space-y-1">
              <li>
                <span className="font-semibold">Emergency:</span> Call{" "}
                <span className="font-semibold">911</span> for immediate help.
              </li>
              <li>
                <span className="font-semibold">
                  988 Suicide &amp; Crisis Lifeline:
                </span>{" "}
                Call or text <span className="font-semibold">988</span> or visit{" "}
                <a
                  href="https://988lifeline.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand underline underline-offset-2"
                >
                  988lifeline.org
                </a>
                .
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[rgb(var(--text))]">
              Domestic & relationship abuse (US)
            </p>
            <ul className="mt-1 space-y-1">
              <li>
                <span className="font-semibold">
                  National Domestic Violence Hotline:
                </span>{" "}
                Call <span className="font-semibold">1-800-799-SAFE (7233)</span>
                , text <span className="font-semibold">START</span> to{" "}
                <span className="font-semibold">88788</span>, or visit{" "}
                <a
                  href="https://www.thehotline.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand underline underline-offset-2"
                >
                  thehotline.org
                </a>
                .
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[rgb(var(--text))]">
              Outside the US
            </p>
            <ul className="mt-1 space-y-1">
              <li>
                Search for{" "}
                <a
                  href="https://www.google.com/search?q=suicide+prevention+hotline"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand underline underline-offset-2"
                >
                  suicide prevention hotline
                </a>{" "}
                or{" "}
                <a
                  href="https://www.google.com/search?q=domestic+violence+helpline"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand underline underline-offset-2"
                >
                  domestic violence helpline
                </a>{" "}
                with your country or region.
              </li>
              <li>
                You can also contact local emergency services or a trusted
                friend, family member, or professional.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Governance;
