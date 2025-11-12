'use client';

import React, { useState } from "react";
import {
  ArrowRight,
  Clock,
  Send,
  ShieldCheck,
  Sparkles,
  Settings,
  Bell,
  Check,
  Calendar,
  BookOpen,
  Briefcase,
  Home,
  FileText,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { requestDocumentsView, requestNewPrompt } from "@/lib/actions";

/* ------------------------------------------------------------------ */
/*  Demo data                                                         */
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
type Connector = "canvas" | "google-calendar" | "slack" | "jira" | "notion" | "outlook" | "apple-reminders";

interface WorkflowConfig {
  roles: Role[];
  customRoleLabel?: string;
  connectors: Connector[];
  customInstructions: string;
}

/* ------------------------------------------------------------------ */
/*  Local storage                                                     */
/* ------------------------------------------------------------------ */
const CONFIG_KEY = "nexusWorkflowConfig";
const loadConfig = (): WorkflowConfig | null => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const saveConfig = (cfg: WorkflowConfig) => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  } catch {}
};

/* ------------------------------------------------------------------ */
/*  Connector Info                                                    */
/* ------------------------------------------------------------------ */
const connectorInfo: Record<Connector, { label: string; icon: React.ReactNode }> = {
  canvas: { label: "Canvas", icon: <BookOpen className="size-4" /> },
  "google-calendar": { label: "Google Calendar", icon: <Calendar className="size-4" /> },
  slack: { label: "Slack", icon: <Send className="size-4" /> },
  jira: { label: "Jira", icon: <Briefcase className="size-4" /> },
  notion: { label: "Notion", icon: <FileText className="size-4" /> },
  outlook: { label: "Outlook", icon: <Calendar className="size-4" /> },
  "apple-reminders": { label: "Apple Reminders", icon: <Bell className="size-4" /> },
};

/* ------------------------------------------------------------------ */
/*  Role Widgets                                                      */
/* ------------------------------------------------------------------ */
const RoleWidget = ({ role }: { role: Role }) => {
  const data = {
    student: { title: "Upcoming Assignments", content: "Canvas sync • 2 items due this week", icon: <BookOpen className="size-6" /> },
    professional: { title: "Sprint Board", content: "Jira sync • 5 tickets in review", icon: <Briefcase className="size-6" /> },
    executive: { title: "Board Prep", content: "Calendar sync • 3 meetings today", icon: <Calendar className="size-6" /> },
    parent: { title: "Family Calendar", content: "Apple Reminders • Soccer practice at 4pm", icon: <Home className="size-6" /> },
  }[role];

  if (!data) return null;

  return (
    <div className="widget p-6 rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-2xl bg-[rgb(var(--brand))]/10 text-[rgb(var(--brand))]">
          {data.icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{data.title}</h3>
      <p className="text-sm text-[rgb(var(--subtle))]">{data.content}</p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Setup Modal                                                       */
/* ------------------------------------------------------------------ */
function SetupModal({ onClose }: { onClose: (cfg?: WorkflowConfig) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [customRoleLabel, setCustomRoleLabel] = useState("");
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [custom, setCustom] = useState("");

  const toggleRole = (r: Role) => {
    setRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
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
      <div className="card max-w-3xl w-full p-10 space-y-10 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Configure Your Workspace</h2>
          <button onClick={() => onClose()} className="text-3xl text-[rgb(var(--subtle))]">
            ×
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-8">
            <p className="text-lg">1. Who are you? (select all that apply)</p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "student" as const, label: "Student" },
                { value: "professional" as const, label: "Professional / Employee" },
                { value: "executive" as const, label: "Executive" },
                { value: "parent" as const, label: "Parent" },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all text-left font-medium text-base
                    ${roles.includes(opt.value) ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5 shadow-md" : "border-gray-200 dark:border-gray-700"}`}
                >
                  <input type="checkbox" checked={roles.includes(opt.value)} onChange={() => toggleRole(opt.value)} className="sr-only" />
                  {opt.label}
                  {roles.includes(opt.value) && <Check className="size-6 ml-auto text-[rgb(var(--brand))]" />}
                </label>
              ))}
              <label
                className={`flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all text-left font-medium text-base
                  ${roles.includes("custom") ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5 shadow-md" : "border-gray-200 dark:border-gray-700"}`}
              >
                <input type="checkbox" checked={roles.includes("custom")} onChange={() => toggleRole("custom")} className="sr-only" />
                Custom…
                {roles.includes("custom") && <Check className="size-6 ml-auto text-[rgb(var(--brand))]" />}
              </label>
            </div>
            {roles.includes("custom") && (
              <input
                type="text"
                placeholder="e.g. Freelance Designer"
                value={customRoleLabel}
                onChange={e => setCustomRoleLabel(e.target.value)}
                className="input w-full text-lg p-4 rounded-2xl"
              />
            )}
            <div className="flex justify-end">
              <button disabled={!roles.length} onClick={() => setStep(2)} className="btn btn-primary px-8 py-3 text-lg">
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <p className="text-lg">2. Which calendars and services do you use daily?</p>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(connectorInfo).map(([key, { label, icon }]) => {
                const c = key as Connector;
                const checked = connectors.includes(c);
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all
                      ${checked ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5 shadow-md" : "border-gray-200 dark:border-gray-700"}`}
                  >
                    <input type="checkbox" checked={checked} onChange={e => {
                      setConnectors(prev => e.target.checked ? [...prev, c] : prev.filter(x => x !== c));
                    }} className="sr-only" />
                    <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800">{icon}</div>
                    <span className="text-base font-medium">{label}</span>
                    {checked && <Check className="size-6 ml-auto text-[rgb(var(--brand))]" />}
                  </label>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn btn-ghost px-6 py-3 text-base">Back</button>
              <button onClick={() => setStep(3)} className="btn btn-primary px-8 py-3 text-lg">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <p className="text-lg">3. Any custom workflows or instructions?</p>
            <textarea
              rows={5}
              placeholder="e.g. Sync my student assignments with family calendar for better planning"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              className="input w-full resize-none p-5 rounded-3xl text-base"
            />
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn btn-ghost px-6 py-3 text-base">Back</button>
              <button onClick={finish} className="btn btn-primary px-8 py-3 text-lg">Finish</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Notification Bell                                                 */
/* ------------------------------------------------------------------ */
function NotificationBell({ config }: { config: WorkflowConfig | null }) {
  const [open, setOpen] = useState(false);
  const roles = config?.roles ?? [];
  const connectors = config?.connectors ?? [];

  const alerts = [
    roles.includes("student") && "Canvas quiz due in 2h",
    connectors.includes("google-calendar") && "Meeting at 3pm",
    config?.customInstructions && "Custom task ready",
    roles.includes("parent") && "Family event reminder",
  ].filter(Boolean) as string[];

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-3 rounded-full hover:bg-white/10 transition">
        <Bell className="size-6" />
        {alerts.length > 0 && <span className="absolute top-1 right-1 size-3 bg-red-500 rounded-full animate-pulse" />}
      </button>
      {open && alerts.length > 0 && (
        <div className="absolute right-0 mt-3 w-80 card p-5 space-y-3 text-base rounded-3xl shadow-xl">
          {alerts.map((a, i) => <p key={i} className="font-medium">{a}</p>)}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN OUTBOX                                                       */
/* ------------------------------------------------------------------ */
export function Outbox() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<WorkflowConfig | null>(loadConfig);
  const [showSetup, setShowSetup] = useState(!config);

  const handleSetupClose = (newCfg?: WorkflowConfig) => {
    if (newCfg) setConfig(newCfg);
    setShowSetup(false);
  };

  const statusBuckets = deliveries.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  const safeRoles = config?.roles ?? [];
  const roleDisplay = safeRoles.includes("custom") && config?.customRoleLabel
    ? config.customRoleLabel
    : safeRoles.length > 0 ? safeRoles.join(" / ") : "Workspace";

  return (
    <>
      {showSetup && <SetupModal onClose={handleSetupClose} />}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 p-8">
        <div className="max-w-screen-2xl mx-auto">

          {/* HEADER */}
          <header className="flex items-center justify-between mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[rgb(var(--subtle))]">
                {roleDisplay} Outbox
              </p>
              <h1 className="text-4xl font-bold mt-2">Scheduled Briefs & Auto Sends</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell config={config} />
              <button onClick={() => setShowSetup(true)} className="p-3 rounded-full hover:bg-white/10 transition" title="Configure">
                <Settings className="size-6" />
              </button>
              <button
                onClick={() => { requestNewPrompt(); navigate("/chat"); }}
                className="btn btn-primary flex items-center gap-3 px-6 py-3 text-lg font-semibold rounded-2xl shadow-lg"
              >
                <Sparkles className="size-5" /> Compose New
              </button>
              <button onClick={() => navigate("/templates")} className="btn btn-ghost px-6 py-3 text-lg rounded-2xl">
                Browse Templates
              </button>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-8">

            {/* LEFT COLUMN - QUEUE & ROLES */}
            <div className="col-span-3 space-y-8">

              {/* Queue Health Widget */}
              <div className="widget p-8 rounded-3xl bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-dark))] text-white shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Scheduled Briefs</h2>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(statusBuckets).map(([status, count]) => (
                    <div key={status} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                      <p className="text-xs uppercase tracking-wider opacity-90">{status}</p>
                      <p className="text-4xl font-bold mt-2">{count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Widgets */}
              {safeRoles.length > 0 && safeRoles.map(role => <RoleWidget key={role} role={role} />)}

              {/* Automation Controls */}
              {config?.connectors?.length ? (
                <div className="widget p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="size-5 text-[rgb(var(--brand))]" /> Automation Controls
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {config.connectors.map(c => (
                      <span key={c} className="chip px-4 py-2 bg-white dark:bg-gray-800 shadow-sm">
                        {connectorInfo[c].label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

            </div>

            {/* CENTER COLUMN - DELIVERY & COMPLIANCE */}
            <div className="col-span-6 space-y-8">

              {/* Delivery Queue */}
              <div className="widget p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">Delivery Queue</p>
                    <h3 className="text-2xl font-bold mt-1">Next Sends</h3>
                  </div>
                  <span className="flex items-center gap-2 text-sm text-[rgb(var(--subtle))]">
                    <Clock className="size-5" /> Auto-sync enabled
                  </span>
                </div>
                <div className="space-y-5">
                  {deliveries.map(item => (
                    <div key={item.id} className="panel p-5 rounded-3xl hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{item.title}</p>
                          <p className="text-sm text-[rgb(var(--subtle))] mt-1">{item.owner}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[rgb(var(--subtle))]">{item.due}</p>
                          <span className="chip chip-warn mt-2">{item.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div className="widget p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">Compliance Routing</p>
                    <h3 className="text-2xl font-bold mt-1">Approvals & Guardrails</h3>
                  </div>
                  <ShieldCheck className="size-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-base text-[rgb(var(--subtle))]">
                  Every outbound asset runs through Nexus guardrails. Track pending approvals and ensure each stakeholder signs off before final delivery.
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN - TEMPLATES & DISTRIBUTION */}
            <div className="col-span-3 space-y-8">

              {/* Templates */}
              <div className="widget p-6 rounded-3xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">Quick Actions</p>
                </div>
                <h3 className="text-xl font-bold mb-6">Templates in Focus</h3>
                <div className="space-y-5">
                  {templates.map(t => (
                    <div key={t.id} className="panel p-5 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                      <p className="font-semibold text-base">{t.name}</p>
                      <p className="text-sm text-[rgb(var(--subtle))] mt-2">{t.description}</p>
                      <button
                        onClick={() => navigate(`/templates?highlight=${t.id}`)}
                        className="btn btn-ghost w-full mt-4 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider"
                      >
                        Launch <ArrowRight className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distribution */}
              <div className="widget p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">Distribution</p>
                  <Send className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-lg font-semibold">Last Export</p>
                <p className="text-base text-[rgb(var(--subtle))] mt-1">
                  Sent to stakeholder list • 18 hours ago
                </p>
                <button
                  onClick={() => { requestDocumentsView("exports"); navigate("/documents"); }}
                  className="btn btn-ghost w-full mt-5"
                >
                  Review History
                </button>
              </div>

              {/* Active Connectors */}
              {config?.connectors?.length ? (
                <div className="widget p-6 rounded-3xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
                  <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))] mb-4">Active Connectors</p>
                  <div className="flex flex-wrap gap-3">
                    {config.connectors.map(c => (
                      <span key={c} className="chip px-4 py-2 bg-white dark:bg-gray-800 shadow-sm">
                        {connectorInfo[c].label}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => navigate("/connectors")} className="btn btn-ghost w-full mt-5 text-base">
                    Manage Connectors
                  </button>
                </div>
              ) : null}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Outbox;
