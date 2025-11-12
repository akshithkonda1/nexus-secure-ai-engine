'use client';

import React, { useState, useEffect } from "react";
import { ArrowRight, Clock, Send, ShieldCheck, Sparkles, Settings, Bell, Plus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { requestDocumentsView, requestNewPrompt } from "@/lib/actions";

/* ------------------------------------------------------------------ */
/*  Static demo data (replace with real API calls later)               */
/* ------------------------------------------------------------------ */
const deliveries = [
  { id: "dl-1", title: "Executive briefing draft", owner: "Leadership", due: "Today • 5:00pm", status: "Awaiting review" },
  { id: "dl-2", title: "Governance pulse", owner: "Risk Team", due: "Tomorrow • 11:00am", status: "Queued" },
  { id: "dl-3", title: "Research synthesis", owner: "Product Insights", due: "Fri • 3:30pm", status: "Drafting" },
];

const templates = [
  { id: "tp-1", name: "Policy variance summary", description: "Capture weekly guardrail exceptions and mitigations." },
  { id: "tp-2", name: "Red team recap", description: "Send a condensed walkthrough of the latest adversarial test." },
];

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type Role =
  | "student"
  | "professional"
  | "executive"
  | "parent"
  | "custom";

type Connector =
  | "canvas"
  | "google-calendar"
  | "slack"
  | "jira"
  | "notion"
  | "outlook"
  | "apple-reminders";

interface WorkflowConfig {
  role: Role;
  roleLabel?: string; // for custom
  connectors: Connector[];
  customInstructions: string;
}

/* ------------------------------------------------------------------ */
/*  Helper: load / save config                                         */
/* ------------------------------------------------------------------ */
const CONFIG_KEY = "nexusWorkflowConfig";

function loadConfig(): WorkflowConfig | null {
  const raw = localStorage.getItem(CONFIG_KEY);
  return raw ? JSON.parse(raw) : null;
}
function saveConfig(cfg: WorkflowConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}

/* ------------------------------------------------------------------ */
/*  Connector definitions (icons, labels)                              */
/* ------------------------------------------------------------------ */
const connectorInfo: Record<
  Connector,
  { label: string; icon: React.ReactNode }
> = {
  canvas: { label: "Canvas", icon: <span className="size-4 rounded bg-indigo-600 text-white flex items-center justify-center text-xs">C</span> },
  "google-calendar": { label: "Google Calendar", icon: <Clock className="size-4 text-green-600" /> },
  slack: { label: "Slack", icon: <Send className="size-4 text-purple-600" /> },
  jira: { label: "Jira", icon: <span className="size-4 rounded bg-blue-600 text-white flex items-center justify-center text-xs">J</span> },
  notion: { label: "Notion", icon: <span className="size-4 rounded bg-gray-800 text-white flex items-center justify-center text-xs">N</span> },
  outlook: { label: "Outlook", icon: <Clock className="size-4 text-blue-600" /> },
  "apple-reminders": { label: "Apple Reminders", icon: <Bell className="size-4 text-orange-600" /> },
};

/* ------------------------------------------------------------------ */
/*  Role-specific UI fragments                                         */
/* ------------------------------------------------------------------ */
function RoleSidebarSection({ role }: { role: Role }) {
  switch (role) {
    case "student":
      return (
        <div className="card space-y-3">
          <h3 className="text-lg font-semibold">Upcoming Assignments</h3>
          <p className="text-sm text-[rgb(var(--subtle))]">Canvas sync active • 2 items due this week</p>
        </div>
      );
    case "professional":
      return (
        <div className="card space-y-3">
          <h3 className="text-lg font-semibold">Sprint Board</h3>
          <p className="text-sm text-[rgb(var(--subtle))]">Jira sync • 5 tickets in review</p>
        </div>
      );
    case "executive":
      return (
        <div className="card space-y-3">
          <h3 className="text-lg font-semibold">Board Prep</h3>
          <p className="text-sm text-[rgb(var(--subtle))]">Calendar sync • 3 meetings today</p>
        </div>
      );
    case "parent":
      return (
        <div className="card space-y-3">
          <h3 className="text-lg font-semibold">Family Calendar</h3>
          <p className="text-sm text-[rgb(var(--subtle))]">Apple Reminders • Soccer practice at 4pm</p>
        </div>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Workflow Setup Modal                                               */
/* ------------------------------------------------------------------ */
function WorkflowSetupModal({
  onClose,
}: {
  onClose: (cfg?: WorkflowConfig) => void;
}) {
  /* ----- Step handling ----- */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<Role | "">("");
  const [roleLabel, setRoleLabel] = useState("");
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [customInstructions, setCustomInstructions] = useState("");

  const finish = () => {
    if (!role) return;
    const cfg: WorkflowConfig = {
      role: role as Role,
      roleLabel: role === "custom" ? roleLabel.trim() : undefined,
      connectors,
      customInstructions: customInstructions.trim(),
    };
    saveConfig(cfg);
    onClose(cfg);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card max-w-xl w-full p-6 space-y-6 bg-white dark:bg-gray-900 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Configure Your Workflow</h2>
          <button
            onClick={() => onClose()}
            className="text-[rgb(var(--subtle))] hover:text-[rgb(var(--text))]"
          >
            ×
          </button>
        </div>

        {/* Step 1 – Role */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm">1. Who are you?</p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "student", label: "Student" },
                  { value: "professional", label: "Professional" },
                  { value: "executive", label: "Executive" },
                  { value: "parent", label: "Parent" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  className={`p-3 rounded-xl border transition ${
                    role === opt.value
                      ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5"
                      : "border-[rgb(var(--subtle))]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => setRole("custom")}
                className={`p-3 rounded-xl border transition ${
                  role === "custom"
                    ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5"
                    : "border-[rgb(var(--subtle))]"
                }`}
              >
                Custom…
              </button>
            </div>
            {role === "custom" && (
              <input
                type="text"
                placeholder="e.g. Freelance Designer"
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                className="input w-full"
              />
            )}
            <div className="flex justify-end">
              <button
                disabled={!role}
                onClick={() => setStep(2)}
                className="btn btn-primary"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2 – Connectors */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm">
              2. Which tools should Nexus pull from?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(connectorInfo).map(([key, { label, icon }]) => {
                const conn = key as Connector;
                const checked = connectors.includes(conn);
                return (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition"
                    style={{
                      borderColor: checked
                        ? "rgb(var(--brand))"
                        : "rgb(var(--subtle))",
                      background: checked
                        ? "rgba(var(--brand), 0.05)"
                        : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConnectors((c) => [...c, conn]);
                        } else {
                          setConnectors((c) => c.filter((x) => x !== conn));
                        }
                      }}
                      className="sr-only"
                    />
                    {icon}
                    <span className="text-sm">{label}</span>
                    {checked && <Check className="size-4 ml-auto text-[rgb(var(--brand))]" />}
                  </label>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn btn-ghost">
                Back
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary">
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3 – Custom */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm">
              3. Anything else? (flashcards, templates, reminders…)
            </p>
            <textarea
              rows={4}
              placeholder="e.g. Create daily anatomy flashcards from Canvas quizzes"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="input w-full resize-none"
            />
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn btn-ghost">
                Back
              </button>
              <button onClick={finish} className="btn btn-primary">
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Notification Bell (demo)                                           */
/* ------------------------------------------------------------------ */
function NotificationBell({ config }: { config: WorkflowConfig }) {
  const [open, setOpen] = useState(false);
  // In a real app you would poll / websockets here
  const demoAlerts = [
    config.role === "student" && "Canvas quiz due in 2h",
    config.connectors.includes("google-calendar") && "Meeting at 3pm",
    config.customInstructions && "Custom task: flashcards ready",
  ].filter(Boolean) as string[];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-white/10 transition"
      >
        <Bell className="size-5" />
        {demoAlerts.length > 0 && (
          <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {open && demoAlerts.length > 0 && (
        <div className="absolute right-0 mt-2 w-64 card p-3 space-y-2 text-sm">
          {demoAlerts.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export function Outbox() {
  const navigate = useNavigate();

  /* ---------- Config handling ---------- */
  const [config, setConfig] = useState<WorkflowConfig | null>(loadConfig);
  const [showSetup, setShowSetup] = useState(!config);

  const handleSetupClose = (newCfg?: WorkflowConfig) => {
    if (newCfg) setConfig(newCfg);
    setShowSetup(false);
  };

  /* ---------- UI helpers ---------- */
  const statusBuckets = deliveries.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {/* Setup modal */}
      {showSetup && <WorkflowSetupModal onClose={handleSetupClose} />}

      <main className="dashboard-grid">
        {/* ---------- LEFT SIDEBAR ---------- */}
        <aside className="sidebar flex flex-col gap-4">
          {/* Queue health */}
          <div className="card space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
                {config?.roleLabel ?? "Workspace"} outbox
              </p>
              <h1 className="text-[22px] font-bold leading-tight text-[rgb(var(--text))]">
                Scheduled briefs
              </h1>
              <p className="text-sm text-[rgb(var(--subtle))]">
                Monitor queue health at a glance and see which automations are currently staged.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              {Object.entries(statusBuckets).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-[18px] bg-white/20 px-3 py-2 text-[rgb(var(--text))] dark:bg-white/5"
                >
                  <span className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--subtle))]">
                    {status}
                  </span>
                  <span className="text-base font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Role-specific section */}
          {config && <RoleSidebarSection role={config.role} />}

          {/* Automation controls */}
          <div className="card space-y-3">
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
              Automation controls
            </h2>
            <p className="text-sm text-[rgb(var(--subtle))]">
              Auto-sync keeps {deliveries.length} deliveries aligned with policy updates and routing rules.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="chip">Auto-sync</span>
              <span className="chip">Audit log</span>
              <span className="chip">Policy map</span>
              {config?.connectors.map((c) => (
                <span key={c} className="chip">
                  {connectorInfo[c].label}
                </span>
              ))}
            </div>
          </div>

          {/* Re-configure button */}
          <button
            onClick={() => setShowSetup(true)}
            className="btn btn-ghost w-full flex items-center justify-center gap-2"
          >
            <Settings className="size-4" /> Re-configure workflow
          </button>
        </aside>

        {/* ---------- MAIN CONTENT ---------- */}
        <section className="content-col">
          {/* Header card */}
          <div className="card panel-hover space-y-5">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
                  {config?.roleLabel ?? "Workspace"} outbox
                </p>
                <h2 className="text-[22px] font-bold text-[rgb(var(--text))]">
                  Scheduled briefs &amp; auto sends
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Notification bell */}
                {config && <NotificationBell config={config} />}

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
              Nexus keeps drafts, approvals, and distribution in one queue. Review upcoming sends, accelerate handoffs, and trace governance-ready audit trails before anything leaves the workspace.
            </p>
          </div>

          {/* Delivery queue */}
          <div className="card panel-hover space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
                  Delivery queue
                </p>
                <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
                  Next sends
                </h3>
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

          {/* Compliance */}
          <div className="card panel-hover space-y-3">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
                  Compliance routing
                </p>
                <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
                  Approvals &amp; guardrails
                </h3>
              </div>
              <ShieldCheck className="size-5 text-[rgb(var(--brand))]" />
            </header>
            <p className="text-sm text-[rgb(var(--subtle))]">
              Every outbound asset runs through Nexus guardrails. Track pending approvals and ensure each stakeholder signs off before final delivery.
            </p>
          </div>
        </section>

        {/* ---------- RIGHT RAIL ---------- */}
        <aside className="right-rail flex flex-col gap-4">
          {/* Templates */}
          <div className="card panel-hover space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
                Quick actions
              </p>
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
                Templates in focus
              </h3>
            </div>
            <ul className="space-y-3 text-sm">
              {templates.map((template) => (
                <li key={template.id} className="panel panel-hover rounded-2xl p-4">
                  <p className="font-semibold text-[rgb(var(--text))]">
                    {template.name}
                  </p>
                  <p className="text-xs text-[rgb(var(--subtle))]">
                    {template.description}
                  </p>
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

          {/* Distribution */}
          <div className="card panel-hover space-y-3 text-sm text-[rgb(var(--text))]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
                Distribution
              </p>
              <Send className="size-4 text-[rgb(var(--brand))]" />
            </div>
            <p className="text-base font-semibold">Last export</p>
            <p className="text-sm text-[rgb(var(--subtle))]">
              Sent to stakeholder list • 18 hours ago
            </p>
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

          {/* Connectors shortcut */}
          {config && config.connectors.length > 0 && (
            <div className="card panel-hover space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
                Active connectors
              </p>
              <div className="flex flex-wrap gap-1">
                {config.connectors.map((c) => (
                  <span key={c} className="chip">
                    {connectorInfo[c].label}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate("/connectors")}
                className="btn btn-ghost w-full text-xs"
              >
                Manage connectors
              </button>
            </div>
          )}
        </aside>
      </main>
    </>
  );
}

export default Outbox;
