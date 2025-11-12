'use client';

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Clock,
  Send,
  ShieldCheck,
  Sparkles,
  Settings,
  Bell,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { requestDocumentsView, requestNewPrompt } from "@/lib/actions";

/* ------------------------------------------------------------------ */
/*  Demo data (replace with API later)                                 */
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
type Role = "student" | "professional" | "executive" | "parent" | "custom";
type Connector =
  | "canvas"
  | "google-calendar"
  | "slack"
  | "jira"
  | "notion"
  | "outlook"
  | "apple-reminders";

interface WorkflowConfig {
  roles: Role[];
  customRoleLabel?: string;
  connectors: Connector[];
  customInstructions: string;
}

/* ------------------------------------------------------------------ */
/*  Local storage helpers                                             */
/* ------------------------------------------------------------------ */
const CONFIG_KEY = "nexusWorkflowConfig";
const loadConfig = (): WorkflowConfig | null => {
  const raw = localStorage.getItem(CONFIG_KEY);
  return raw ? JSON.parse(raw) : null;
};
const saveConfig = (cfg: WorkflowConfig) => localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));

/* ------------------------------------------------------------------ */
/*  Connector UI data                                                 */
/* ------------------------------------------------------------------ */
const connectorInfo: Record<Connector, { label: string; icon: React.ReactNode }> = {
  canvas: { label: "Canvas", icon: <span className="size-4 rounded bg-indigo-600 text-white flex items-center justify-center text-xs">C</span> },
  "google-calendar": { label: "Google Calendar", icon: <Clock className="size-4 text-green-600" /> },
  slack: { label: "Slack", icon: <Send className="size-4 text-purple-600" /> },
  jira: { label: "Jira", icon: <span className="size-4 rounded bg-blue-600 text-white flex items-center justify-center text-xs">J</span> },
  notion: { label: "Notion", icon: <span className="size-4 rounded bg-gray-800 text-white flex items-center justify-center text-xs">N</span> },
  outlook: { label: "Outlook", icon: <Clock className="size-4 text-blue-600" /> },
  "apple-reminders": { label: "Apple Reminders", icon: <Bell className="size-4 text-orange-600" /> },
};

/* ------------------------------------------------------------------ */
/*  Role-specific sections                                            */
/* ------------------------------------------------------------------ */
const RoleSections = ({ roles }: { roles: Role[] }) => (
  <>
    {roles.map((role) => {
      switch (role) {
        case "student":
          return (
            <div key={role} className="card space-y-4">
              <h3 className="text-lg font-semibold">Upcoming Assignments</h3>
              <p className="text-sm text-[rgb(var(--subtle))]">
                Canvas sync • 2 items due this week
              </p>
            </div>
          );
        case "professional":
          return (
            <div key={role} className="card space-y-4">
              <h3 className="text-lg font-semibold">Sprint Board</h3>
              <p className="text-sm text-[rgb(var(--subtle))]">
                Jira sync • 5 tickets in review
              </p>
            </div>
          );
        case "executive":
          return (
            <div key={role} className="card space-y-4">
              <h3 className="text-lg font-semibold">Board Prep</h3>
              <p className="text-sm text-[rgb(var(--subtle))]">
                Calendar sync • 3 meetings today
              </p>
            </div>
          );
        case "parent":
          return (
            <div key={role} className="card space-y-4">
              <h3 className="text-lg font-semibold">Family Calendar</h3>
              <p className="text-sm text-[rgb(var(--subtle))]">
                Apple Reminders • Soccer practice at 4pm
              </p>
            </div>
          );
        case "custom":
          return null; // Handled via custom label in headers
        default:
          return null;
      }
    })}
  </>
);

/* ------------------------------------------------------------------ */
/*  Setup Modal (3 steps)                                             */
/* ------------------------------------------------------------------ */
function SetupModal({ onClose }: { onClose: (cfg?: WorkflowConfig) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [customRoleLabel, setCustomRoleLabel] = useState("");
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [custom, setCustom] = useState("");

  const toggleRole = (r: Role) => {
    setRoles((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const finish = () => {
    if (!roles.length) return;
    const cfg: WorkflowConfig = {
      roles,
      customRoleLabel: roles.includes("custom") ? customRoleLabel.trim() : undefined,
      connectors,
      customInstructions: custom.trim(),
    };
    saveConfig(cfg);
    onClose(cfg);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full p-8 space-y-8 bg-white dark:bg-gray-900 rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Configure Your Workspace</h2>
          <button onClick={() => onClose()} className="text-2xl text-[rgb(var(--subtle))]">
            ×
          </button>
        </div>

        {/* Step 1 – Roles (multi-select) */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-base">1. Who are you? (select all that apply)</p>
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  { value: "student", label: "Student" },
                  { value: "professional", label: "Professional / Employee" },
                  { value: "executive", label: "Executive" },
                  { value: "parent", label: "Parent" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all text-left font-medium
                    ${roles.includes(opt.value) ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5" : "border-[rgb(var(--subtle))]"}`}
                >
                  <input
                    type="checkbox"
                    checked={roles.includes(opt.value)}
                    onChange={() => toggleRole(opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                  {roles.includes(opt.value) && <Check className="size-5 ml-auto text-[rgb(var(--brand))]" />}
                </label>
              ))}
              <label
                className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all text-left font-medium
                  ${roles.includes("custom") ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5" : "border-[rgb(var(--subtle))]"}`}
              >
                <input
                  type="checkbox"
                  checked={roles.includes("custom")}
                  onChange={() => toggleRole("custom")}
                  className="sr-only"
                />
                Custom…
                {roles.includes("custom") && <Check className="size-5 ml-auto text-[rgb(var(--brand))]" />}
              </label>
            </div>
            {roles.includes("custom") && (
              <input
                type="text"
                placeholder="e.g. Freelance Designer"
                value={customRoleLabel}
                onChange={(e) => setCustomRoleLabel(e.target.value)}
                className="input w-full"
              />
            )}
            <div className="flex justify-end">
              <button disabled={!roles.length} onClick={() => setStep(2)} className="btn btn-primary">
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2 – Connectors */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-base">2. Which calendars and services do you use daily?</p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(connectorInfo).map(([key, { label, icon }]) => {
                const c = key as Connector;
                const checked = connectors.includes(c);
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all
                      ${checked ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5" : "border-[rgb(var(--subtle))]"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setConnectors((prev) =>
                          e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)
                        );
                      }}
                      className="sr-only"
                    />
                    {icon}
                    <span>{label}</span>
                    {checked && <Check className="size-5 ml-auto text-[rgb(var(--brand))]" />}
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
          <div className="space-y-6">
            <p className="text-base">3. Any custom workflows or instructions?</p>
            <textarea
              rows={4}
              placeholder="e.g. Sync my student assignments with family calendar for better planning"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
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
/*  Notification Bell (demo)                                          */
/* ------------------------------------------------------------------ */
function NotificationBell({ config }: { config: WorkflowConfig }) {
  const [open, setOpen] = useState(false);
  const alerts = [
    config.roles.includes("student") && "Canvas quiz due in 2h",
    config.connectors.includes("google-calendar") && "Meeting at 3pm",
    config.customInstructions && "Custom task ready",
    config.roles.includes("parent") && "Family event reminder",
  ].filter(Boolean) as string[];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-white/10 transition"
      >
        <Bell className="size-5" />
        {alerts.length > 0 && (
          <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {open && alerts.length > 0 && (
        <div className="absolute right-0 mt-2 w-64 card p-4 space-y-3 text-sm">
          {alerts.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                    */
/* ------------------------------------------------------------------ */
export function Outbox() {
  const navigate = useNavigate();

  /* ---------- Config ---------- */
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

  const roleDisplay = config?.roles.includes("custom") && config.customRoleLabel
    ? config.customRoleLabel
    : (config?.roles ?? []).join(" / ") || "Workspace";

  return (
    <>
      {showSetup && <SetupModal onClose={handleSetupClose} />}

      <main className="dashboard-grid">
        {/* ---------- LEFT SIDEBAR ---------- */}
        <aside className="sidebar flex flex-col gap-8">
          {/* Queue health */}
          <div className="card space-y-6 p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--subtle))]">
                {roleDisplay} outbox
              </p>
              <h1 className="text-2xl font-bold leading-tight text-[rgb(var(--text))]">
                Scheduled briefs
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {Object.entries(statusBuckets).map(([status, count]) => (
                <div
                  key={status}
                  className="flex flex-col items-center rounded-2xl bg-white/20 dark:bg-white/5 p-4"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--subtle))]">
                    {status}
                  </span>
                  <span className="text-3xl font-bold mt-2">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Role-specific blocks */}
          {config && <RoleSections roles={config.roles} />}

          {/* Automation controls – only if connectors exist */}
          {config?.connectors.length ? (
            <div className="card space-y-4 p-6">
              <h2 className="text-lg font-semibold">Automation controls</h2>
              <div className="flex flex-wrap gap-3">
                {config.connectors.map((c) => (
                  <span key={c} className="chip px-4 py-2">
                    {connectorInfo[c].label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        {/* ---------- MAIN CONTENT ---------- */}
        <section className="content-col space-y-8">
          {/* Header */}
          <header className="card panel-hover flex items-center justify-between p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--subtle))]">
                {roleDisplay} outbox
              </p>
              <h2 className="text-2xl font-bold text-[rgb(var(--text))]">
                Scheduled briefs & auto sends
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {config && <NotificationBell config={config} />}

              <button
                onClick={() => setShowSetup(true)}
                className="p-3 rounded-full hover:bg-white/10 transition"
                title="Re-configure workflow"
              >
                <Settings className="size-6" />
              </button>

              <button
                onClick={() => {
                  requestNewPrompt();
                  navigate("/chat");
                }}
                className="btn btn-primary flex items-center gap-2 px-5 py-3"
              >
                <Sparkles className="size-5" /> Compose new
              </button>

              <button onClick={() => navigate("/templates")} className="btn btn-ghost px-5 py-3">
                Browse templates
              </button>
            </div>
          </header>

          {/* Delivery queue */}
          <div className="card panel-hover space-y-6 p-8">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--subtle))]">
                  Delivery queue
                </p>
                <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
                  Next sends
                </h3>
              </div>
              <span className="inline-flex items-center gap-2 text-xs text-[rgb(var(--subtle))]">
                <Clock className="size-5" /> Auto-sync enabled
              </span>
            </header>

            <ul className="space-y-6">
              {deliveries.map((item) => (
                <li
                  key={item.id}
                  className="panel panel-hover flex items-center justify-between rounded-3xl p-5 text-base"
                >
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-[rgb(var(--subtle))] mt-1">{item.owner}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[rgb(var(--subtle))]">{item.due}</p>
                    <span className="chip chip-warn mt-1">{item.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance – always shown (core Nexus feature) */}
          <div className="card panel-hover space-y-4 p-8">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--subtle))]">
                  Compliance routing
                </p>
                <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
                  Approvals & guardrails
                </h3>
              </div>
              <ShieldCheck className="size-6 text-[rgb(var(--brand))]" />
            </header>
            <p className="text-base text-[rgb(var(--subtle))]">
              Every outbound asset runs through Nexus guardrails. Track pending approvals and ensure each stakeholder signs off before final delivery.
            </p>
          </div>
        </section>

        {/* ---------- RIGHT RAIL ---------- */}
        <aside className="right-rail flex flex-col gap-8">
          {/* Templates */}
          <div className="card panel-hover space-y-6 p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--subtle))]">
                Quick actions
              </p>
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
                Templates in focus
              </h3>
            </div>
            <ul className="space-y-6">
              {templates.map((t) => (
                <li key={t.id} className="panel panel-hover rounded-3xl p-5">
                  <p className="font-semibold text-base">{t.name}</p>
                  <p className="text-sm text-[rgb(var(--subtle))] mt-1">{t.description}</p>
                  <button
                    onClick={() => navigate(`/templates?highlight=${t.id}`)}
                    className="btn btn-ghost mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider"
                  >
                    Launch <ArrowRight className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Distribution */}
          <div className="card panel-hover space-y-4 p-8">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--subtle))]">
                Distribution
              </p>
              <Send className="size-5 text-[rgb(var(--brand))]" />
            </div>
            <p className="text-lg font-semibold">Last export</p>
            <p className="text-base text-[rgb(var(--subtle))]">
              Sent to stakeholder list • 18 hours ago
            </p>
            <button
              onClick={() => {
                requestDocumentsView("exports");
                navigate("/documents");
              }}
              className="btn btn-ghost w-full mt-4 text-base"
            >
              Review history
            </button>
          </div>

          {/* Active connectors – only if any */}
          {config?.connectors.length ? (
            <div className="card panel-hover space-y-4 p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--subtle))]">
                Active connectors
              </p>
              <div className="flex flex-wrap gap-3">
                {config.connectors.map((c) => (
                  <span key={c} className="chip px-4 py-2">
                    {connectorInfo[c].label}
                  </span>
                ))}
              </div>
              <button onClick={() => navigate("/connectors")} className="btn btn-ghost w-full mt-4 text-base">
                Manage connectors
              </button>
            </div>
          ) : null}
        </aside>
      </main>
    </>
  );
}

export default Outbox;
