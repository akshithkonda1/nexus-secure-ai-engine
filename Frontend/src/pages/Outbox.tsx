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

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-[28px] border border-[rgba(var(--border),0.7)] bg-white/80 p-6 shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Workspace outbox</p>
            <h1 className="text-2xl font-semibold text-[rgb(var(--text))]">Scheduled briefs &amp; auto sends</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                requestNewPrompt();
                navigate("/chat");
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--brand),1)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-lift)]"
            >
              <Sparkles className="size-4" /> Compose new
            </button>
            <button
              type="button"
              onClick={() => navigate("/templates")}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--border),0.7)] bg-white/80 px-5 py-2 text-sm font-semibold text-[rgb(var(--text))] transition hover:bg-[rgba(var(--panel),0.7)]"
            >
              Browse templates
            </button>
          </div>
        </div>
        <p className="max-w-2xl text-sm text-[rgba(var(--subtle),0.8)]">
          Nexus keeps drafts, approvals, and distribution in one queue. Review upcoming sends, accelerate handoffs, and trace
          governance-ready audit trails before anything leaves the workspace.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-[26px] border border-[rgba(var(--border),0.7)] bg-white/85 p-6 shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Delivery queue</p>
              <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Next sends</h2>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-[rgba(var(--subtle),0.7)]">
              <Clock className="size-4" /> Auto-sync enabled
            </span>
          </header>
          <ul className="mt-4 space-y-3">
            {deliveries.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.7)] px-4 py-3 text-sm text-[rgb(var(--text))]"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-[rgba(var(--subtle),0.7)]">{item.owner}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[rgba(var(--subtle),0.7)]">{item.due}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand">
                    {item.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 rounded-[26px] border border-[rgba(var(--border),0.7)] bg-white/85 p-6 shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Quick actions</p>
            <h2 className="mt-1 text-lg font-semibold text-[rgb(var(--text))]">Templates in focus</h2>
          </div>
          <ul className="space-y-3 text-sm">
            {templates.map((template) => (
              <li key={template.id} className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.65)] p-4">
                <p className="font-semibold text-[rgb(var(--text))]">{template.name}</p>
                <p className="text-xs text-[rgba(var(--subtle),0.75)]">{template.description}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/templates?highlight=${template.id}`)}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand"
                >
                  Launch <ArrowRight className="size-3" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-auto rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.65)] p-4 text-sm text-[rgb(var(--text))]">
            <p className="font-semibold">Last export</p>
            <p className="text-xs text-[rgba(var(--subtle),0.7)]">Sent to stakeholder list • 18 hours ago</p>
            <button
              type="button"
              onClick={() => {
                requestDocumentsView("exports");
                navigate("/documents");
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgba(var(--border),0.6)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand"
            >
              <Send className="size-3.5" /> Review history
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-[rgba(var(--border),0.7)] bg-white/85 p-6 shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.7)]">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Compliance routing</p>
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Approvals &amp; guardrails</h2>
          </div>
          <ShieldCheck className="size-5 text-brand" />
        </header>
        <p className="mt-3 text-sm text-[rgba(var(--subtle),0.8)]">
          Every outbound asset runs through Nexus guardrails. Track pending approvals and ensure each stakeholder signs off before
          final delivery.
        </p>
      </section>
    </div>
  );
}

export default Outbox;
