import React from "react";
import { ArrowRight, Clock, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { requestDocumentsView, requestNewPrompt } from "@/lib/actions";

const deliveries = [
  {
    id: "dl-1",
    title: "Executive briefing draft",
    owner: "Leadership",
    due: "Today • 5:00pm",
    status: "Awaiting review",
  },
  {
    id: "dl-2",
    title: "Governance pulse",
    owner: "Risk Team",
    due: "Tomorrow • 11:00am",
    status: "Queued",
  },
  {
    id: "dl-3",
    title: "Research synthesis",
    owner: "Product Insights",
    due: "Fri • 3:30pm",
    status: "Drafting",
  },
];

const templates = [
  {
    id: "tp-1",
    name: "Policy variance summary",
    description: "Capture weekly guardrail exceptions and mitigations.",
  },
  {
    id: "tp-2",
    name: "Red team recap",
    description: "Send a condensed walkthrough of the latest adversarial test.",
  },
];

export function Outbox() {
  const navigate = useNavigate();

  const statusBuckets = deliveries.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="dashboard-grid">
      <aside className="sidebar flex flex-col gap-4">
        <div className="card space-y-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
              Workspace outbox
            </p>
            <h1 className="text-[22px] font-bold leading-tight text-[rgb(var(--text))]">Scheduled briefs</h1>
            <p className="text-sm text-[rgb(var(--subtle))]">
              Monitor queue health at a glance and see which automations are currently staged.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            {Object.entries(statusBuckets).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-[18px] bg-white/20 px-3 py-2 text-[rgb(var(--text))] dark:bg-white/5">
                <span className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--subtle))]">
                  {status}
                </span>
                <span className="text-base font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Automation controls</h2>
          <p className="text-sm text-[rgb(var(--subtle))]">
            Auto-sync keeps {deliveries.length} deliveries aligned with policy updates and routing rules.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="chip">Auto-sync</span>
            <span className="chip">Audit log</span>
            <span className="chip">Policy map</span>
          </div>
        </div>
      </aside>

      <section className="content-col">
        <div className="card panel-hover space-y-5">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
                Workspace outbox
              </p>
              <h2 className="text-[22px] font-bold text-[rgb(var(--text))]">Scheduled briefs &amp; auto sends</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  requestNewPrompt();
                  navigate("/chat");
                }}
                className="btn btn-primary"
              >
                <Sparkles className="size-4" /> Compose new
              </button>
              <button
                type="button"
                onClick={() => navigate("/templates")}
                className="btn btn-ghost"
              >
                Browse templates
              </button>
            </div>
          </header>
          <p className="max-w-2xl text-sm text-[rgb(var(--subtle))]">
            Nexus keeps drafts, approvals, and distribution in one queue. Review upcoming sends, accelerate handoffs, and trace
            governance-ready audit trails before anything leaves the workspace.
          </p>
        </div>

        <div className="card panel-hover space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">Delivery queue</p>
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">Next sends</h3>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-[rgb(var(--subtle))]">
              <Clock className="size-4" /> Auto-sync enabled
            </span>
          </header>
          <ul className="space-y-3">
            {deliveries.map((item) => (
              <li
                key={item.id}
                className="panel panel-hover flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-[rgb(var(--text))]"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-[rgb(var(--subtle))]">{item.owner}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[rgb(var(--subtle))]">{item.due}</p>
                  <span className="chip chip-warn">{item.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card panel-hover space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
                Compliance routing
              </p>
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">Approvals &amp; guardrails</h3>
            </div>
            <ShieldCheck className="size-5 text-[rgb(var(--brand))]" />
          </header>
          <p className="text-sm text-[rgb(var(--subtle))]">
            Every outbound asset runs through Nexus guardrails. Track pending approvals and ensure each stakeholder signs off
            before final delivery.
          </p>
        </div>
      </section>

      <aside className="right-rail flex flex-col gap-4">
        <div className="card panel-hover space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">Quick actions</p>
            <h3 className="text-lg font-semibold text-[rgb(var(--text))]">Templates in focus</h3>
          </div>
          <ul className="space-y-3 text-sm">
            {templates.map((template) => (
              <li key={template.id} className="panel panel-hover rounded-2xl p-4">
                <p className="font-semibold text-[rgb(var(--text))]">{template.name}</p>
                <p className="text-xs text-[rgb(var(--subtle))]">{template.description}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/templates?highlight=${template.id}`)}
                  className="btn btn-ghost mt-3 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]"
                >
                  Launch <ArrowRight className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card panel-hover space-y-3 text-sm text-[rgb(var(--text))]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
              Distribution
            </p>
            <Send className="size-4 text-[rgb(var(--brand))]" />
          </div>
          <p className="text-base font-semibold">Last export</p>
          <p className="text-sm text-[rgb(var(--subtle))]">Sent to stakeholder list • 18 hours ago</p>
          <button
            type="button"
            onClick={() => {
              requestDocumentsView("exports");
              navigate("/documents");
            }}
            className="btn btn-ghost w-full justify-center"
          >
            Review history
          </button>
        </div>
      </aside>
    </main>
  );
}

export default Outbox;
