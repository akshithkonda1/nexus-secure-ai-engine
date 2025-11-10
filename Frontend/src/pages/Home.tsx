import React from "react";
import {
  ArrowRight,
  Bot,
  FileText,
  MessageSquare,
  PenSquare,
  ShieldCheck,
  Sparkles,
  Video,
  Wand2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/features/profile/ProfileProvider";
import { getFirstName } from "@/lib/userName";

const quickStarts = [
  {
    label: "Write copy",
    description: "Launch marketing-ready narratives",
    icon: PenSquare,
    hue: "from-[#009EFF] to-[#0085FF]",
    to: "/templates",
  },
  {
    label: "Image generation",
    description: "Spin up branded assets",
    icon: Sparkles,
    hue: "from-[#9360FF] to-[#C5B9DA]",
    to: "/chat",
  },
  {
    label: "Create avatar",
    description: "Train a spokesperson persona",
    icon: Bot,
    hue: "from-[#0085FF] to-[#00B2FF]",
    to: "/settings",
  },
  {
    label: "Voice console",
    description: "Enable realtime co-pilot",
    icon: Video,
    hue: "from-[#C5B9DA] to-[#9360FF]",
    to: "/documents",
  },
];

const recentDocs = [
  { name: "SOC2 audit briefing", owner: "Compliance", status: "Ready" },
  { name: "Agent launch checklist", owner: "Ops", status: "In review" },
  { name: "Guardrail feedback", owner: "Security", status: "Updated" },
];

const highlights = [
  {
    title: "Summaries delivered",
    value: "248",
    delta: "+18%", // mimic style
    tone: "bg-[rgba(var(--brand),0.12)] text-brand",
  },
  {
    title: "Avg. response",
    value: "1m 42s",
    delta: "-9%",
    tone: "bg-[rgba(var(--accent-lilac),0.22)] text-[rgb(var(--text))]",
  },
  {
    title: "CSAT",
    value: "96%",
    delta: "+4%",
    tone: "bg-[rgba(var(--brand-soft),0.15)] text-[rgb(var(--text))]",
  },
];

export function Home() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const userName = getFirstName(profile);

  return (
    <div className="flex flex-col gap-12">
      <section className="relative overflow-hidden rounded-[28px] border border-[rgba(var(--border),0.7)] bg-white/85 p-10 shadow-[var(--shadow-soft)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(var(--brand),0.16),transparent_55%)]" aria-hidden="true" />
        <div className="absolute -right-20 -top-24 size-[260px] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--brand-soft),0.18),transparent_70%)]" aria-hidden="true" />
        <div className="relative grid gap-10 lg:grid-cols-[1.45fr_1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--brand),0.2)] bg-[rgba(var(--brand),0.08)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-brand">
              Nexus • Welcome back, {userName}
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-[rgb(var(--text))]">
              Operate every AI workflow with clarity, governance, and speed.
            </h1>
            <p className="max-w-2xl text-base text-[rgba(var(--subtle),0.85)]">
              Launch trusted sessions, align agents across teams, and keep insights anchored to the projects that matter most.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--brand),1)] px-6 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-lift)]"
              >
                <ShieldCheck className="size-4" /> Launch Chat
              </button>
              <button
                type="button"
                onClick={() => navigate("/templates")}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--border),0.8)] bg-white/80 px-6 py-2 text-sm font-semibold text-[rgb(var(--text))] transition hover:bg-[rgba(var(--panel),0.7)]"
              >
                Browse playbooks
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[rgba(var(--border),0.55)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.6)]">{item.title}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-2xl font-semibold text-[rgb(var(--text))]">{item.value}</span>
                    <span className={"inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase " + item.tone}>
                      {item.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-[24px] border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.65)] p-6 shadow-[var(--shadow-soft)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.8)]">Autopilot</p>
              <h2 className="mt-2 text-xl font-semibold text-[rgb(var(--text))]">Summarize the latest</h2>
              <p className="mt-2 text-sm text-[rgba(var(--subtle),0.8)]">
                We already collected transcripts from legal and research. Draft a shareable brief?
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-white/90 p-4 shadow-inner">
              <div className="flex items-center justify-between text-xs text-[rgba(var(--subtle),0.8)]">
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-brand" /> Latest thread
                </span>
                <button type="button" className="inline-flex items-center gap-1 text-[rgba(var(--subtle),0.8)] hover:text-brand">
                  View <ArrowRight className="size-3" />
                </button>
              </div>
              <div className="rounded-2xl border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.7)] p-3 text-sm text-[rgb(var(--text))]">
                Summarize the latest customer learning for the leadership weekly. Highlight tone shifts.
              </div>
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[rgba(var(--brand),1)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-lift)]"
              >
                <Wand2 className="size-4" /> Generate brief
              </button>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--border),0.7)] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Queue</p>
              <ul className="mt-3 space-y-2 text-sm text-[rgb(var(--text))]">
                <li className="flex items-center justify-between">
                  <span>Voice agents rollout</span>
                  <span className="text-xs text-[rgba(var(--subtle),0.7)]">Due today</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Compliance audit pack</span>
                  <span className="text-xs text-[rgba(var(--subtle),0.7)]">Tomorrow</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>UX research synthesis</span>
                  <span className="text-xs text-[rgba(var(--subtle),0.7)]">Fri</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {quickStarts.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.to)}
            className={`group flex h-full flex-col items-start justify-between overflow-hidden rounded-[26px] border border-[rgba(var(--border),0.55)] bg-white/90 p-6 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]`}
          >
            <span className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${item.hue} px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white`}>Quick start</span>
            <div className="mt-5 space-y-3">
              <h3 className="text-xl font-semibold text-[rgb(var(--text))]">{item.label}</h3>
              <p className="text-sm text-[rgba(var(--subtle),0.8)]">{item.description}</p>
            </div>
            <div className="mt-6 flex w-full items-center justify-between text-sm text-brand">
              <span className="inline-flex items-center gap-2">
                <item.icon className="size-4" /> Launch
              </span>
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[26px] border border-[rgba(var(--border),0.6)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Recent documents</p>
              <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Workspace library</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/documents")}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--border),0.7)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand transition hover:bg-[rgba(var(--panel),0.7)]"
            >
              View all
            </button>
          </header>
          <div className="mt-4 space-y-3">
            {recentDocs.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.7)] px-4 py-3 text-sm text-[rgb(var(--text))]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[rgba(var(--brand),0.12)] text-brand">
                    <FileText className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold">{doc.name}</p>
                    <p className="text-xs text-[rgba(var(--subtle),0.7)]">{doc.owner}</p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[rgba(var(--subtle),0.8)]">{doc.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-full flex-col rounded-[26px] border border-[rgba(var(--border),0.6)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Quick briefs</p>
          <h2 className="mt-2 text-lg font-semibold text-[rgb(var(--text))]">Latest decisions</h2>
          <div className="mt-4 flex-1 space-y-4 text-sm text-[rgb(var(--text))]">
            <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.65)] p-4">
              <p className="font-semibold">Launch guardrails in EMEA</p>
              <p className="mt-1 text-xs text-[rgba(var(--subtle),0.75)]">Pending compliance sign-off • Assigned to Ava</p>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.65)] p-4">
              <p className="font-semibold">Scale voice agents</p>
              <p className="mt-1 text-xs text-[rgba(var(--subtle),0.75)]">Session recap generated • Share with GTM</p>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.65)] p-4">
              <p className="font-semibold">Synthesize weekly research</p>
              <p className="mt-1 text-xs text-[rgba(var(--subtle),0.75)]">Brief scheduled • Auto-send every Friday</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[rgba(var(--brand),0.12)] px-4 py-2 text-sm font-semibold text-brand transition hover:bg-[rgba(var(--brand),0.18)]"
          >
            Review timeline <ArrowRight className="size-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
