import React from "react";
import { AlertTriangle, CheckCircle, FileWarning, ShieldAlert, ShieldCheck, Workflow } from "lucide-react";

import { requestDocumentsView } from "@/lib/actions";

const controls = [
  {
    id: "ctl-1",
    title: "Model risk assessment",
    owner: "Security",
    status: "In progress",
    due: "Due Thu",
    tone: "warn",
  },
  {
    id: "ctl-2",
    title: "Regulatory review",
    owner: "Legal",
    status: "Scheduled",
    due: "Due Fri",
    tone: "warn",
  },
  {
    id: "ctl-3",
    title: "Audit log export",
    owner: "Compliance",
    status: "Ready",
    due: "Due Mon",
    tone: "ok",
  },
];

export function Governance() {
  return (
    <div className="space-y-8">
      <header className="panel panel--immersive panel--edge panel--halo panel--alive halo panel--hover panel--glow panel--gradient-border rounded-[28px] border border-[rgba(var(--border),0.7)] bg-white/80 p-6 shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Governance center</p>
            <h1 className="accent-ink text-2xl font-semibold text-[rgb(var(--text))]">Policies, guardrails, and audit trails</h1>
          </div>
          <ShieldCheck className="size-8 text-brand" />
        </div>
        <p className="mt-4 max-w-3xl text-sm text-[rgba(var(--subtle),0.8)]">
          Monitor policy health, review compliance tasks, and keep exports at the ready for your regulators. Nexus captures every
          decision so you can ship faster without compromising governance.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel panel--immersive panel--alive panel--hover panel--glow panel--gradient-border rounded-[24px] border border-[rgba(var(--border),0.7)] bg-white/85 p-5 shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-brand" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Guardrails</p>
              <p className="text-xl font-semibold text-[rgb(var(--text))]">4 active</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-[rgba(var(--subtle),0.8)]">Auto-enforced on chat, uploads, and batch orchestrations.</p>
        </div>
        <div className="panel panel--immersive panel--alive panel--hover panel--glow panel--gradient-border rounded-[24px] border border-[rgba(var(--border),0.7)] bg-white/85 p-5 shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
          <div className="flex items-center gap-3">
            <Workflow className="size-5 text-brand" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Workflows</p>
              <p className="text-xl font-semibold text-[rgb(var(--text))]">7 automated</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-[rgba(var(--subtle),0.8)]">Risk sign-off triggered when sensitive prompts are detected.</p>
        </div>
        <div className="panel panel--immersive panel--alive panel--hover panel--glow panel--gradient-border rounded-[24px] border border-[rgba(var(--border),0.7)] bg-white/85 p-5 shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-5 text-brand" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Controls</p>
              <p className="text-xl font-semibold text-[rgb(var(--text))]">12 compliant</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-[rgba(var(--subtle),0.8)]">Latest SOC2 control checks passed within the last 24 hours.</p>
        </div>
      </section>

      <section className="panel panel--immersive panel--alive panel--hover panel--glow panel--gradient-border rounded-[26px] border border-[rgba(var(--border),0.7)] bg-white/85 p-6 shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Open items</p>
            <h2 className="accent-ink text-lg font-semibold text-[rgb(var(--text))]">Compliance tasks</h2>
          </div>
          <button
            type="button"
            onClick={() => requestDocumentsView("audit")}
            className="btn btn-ghost btn-neo btn-quiet rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em] text-brand"
          >
            <FileWarning className="size-4" /> Export audit log
          </button>
        </header>
        <ul className="mt-4 space-y-3">
          {controls.map((item) => (
            <li
              key={item.id}
              className="panel panel--immersive panel--alive flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.65)] px-4 py-3 text-sm text-[rgb(var(--text))]"
            >
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-[rgba(var(--subtle),0.7)]">{item.owner}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[rgba(var(--subtle),0.7)]">{item.due}</span>
                <span
                  className={`ml-2 ${
                    item.tone === "ok"
                      ? "chip chip--ok"
                      : item.tone === "warn"
                        ? "chip chip--warn"
                        : "chip"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel panel--immersive panel--alive panel--glow rounded-[26px] border border-[rgba(var(--border),0.7)] bg-white/85 p-6 shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
        <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">
          <AlertTriangle className="size-4 text-brand" /> Policy alerts
        </header>
        <p className="mt-3 text-sm text-[rgba(var(--subtle),0.8)]">
          No active incidents. All high-sensitivity prompts have been routed to the risk queue for secondary review.
        </p>
      </section>
    </div>
  );
}

export default Governance;
