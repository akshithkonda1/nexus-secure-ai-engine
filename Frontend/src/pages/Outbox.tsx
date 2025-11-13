'use client';

import React, { useState, useEffect, useMemo, type ReactNode } from "react";
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
import {
  type NotificationItem,
  useGlobalNotifications,
} from "@/features/notifications/useNotifications";

/* ------------------------------------------------------------------ */
/* Demo Data (Replace with API in production)                         */
/* ------------------------------------------------------------------ */
const deliveries = [
  { id: "dl-1", title: "Executive briefing draft", owner: "Leadership", due: "Today • 5:00pm", status: "Awaiting review" },
  { id: "dl-2", title: "Governance pulse", owner: "Risk Team", due: "Tomorrow • 11:00am", status: "Queued" },
  { id: "dl-3", title: "Research synthesis", owner: "Product Insights", due: "Fri • 3:30pm", status: "Drafting" },
] as const;

const templates = [
  { id: "tp-1", name: "Policy variance summary", description: "Capture weekly guardrail exceptions and mitigations." },
  { id: "tp-2", name: "Red team recap", description: "Send a condensed walkthrough of the latest adversarial test." },
] as const;

/* ------------------------------------------------------------------ */
/* Types                                                              */
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
/* Local Storage (Safe, Minimal)                                      */
/* ------------------------------------------------------------------ */
const CONFIG_KEY = "nexusWorkflowConfig";

const loadConfig = (): WorkflowConfig | null => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? (JSON.parse(raw) as WorkflowConfig) : null;
  } catch {
    return null;
  }
};

const saveConfig = (cfg: WorkflowConfig): void => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  } catch {
    // Silent fail — non-critical
  }
};

/* ------------------------------------------------------------------ */
/* Connector Metadata                                                 */
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

const WORKSPACE_NOTIFICATION_SOURCE = "workspace/outbox";

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function buildWorkspaceAlerts(config: WorkflowConfig | null): string[] {
  const roles = config?.roles ?? [];
  const connectors = config?.connectors ?? [];
  const customInstructions = config?.customInstructions?.trim();

  return [
    roles.includes("student") && "Canvas quiz due in 2h",
    connectors.includes("google-calendar") && "Meeting at 3pm",
    customInstructions && "Custom task ready",
    roles.includes("parent") && "Family event reminder",
  ].filter(Boolean) as string[];
}

/* ------------------------------------------------------------------ */
/* Role Widget Component                                              */
/* ------------------------------------------------------------------ */
const RoleWidget: React.FC<{ role: Role }> = ({ role }) => {
  const config = useMemo(
    () =>
      ({
        student: { title: "Upcoming Assignments", content: "Canvas sync • 2 items due this week", icon: <BookOpen className="size-6" /> },
        professional: { title: "Sprint Board", content: "Jira sync • 5 tickets in review", icon: <Briefcase className="size-6" /> },
        executive: { title: "Board Prep", content: "Calendar sync • 3 meetings today", icon: <Calendar className="size-6" /> },
        parent: { title: "Family Calendar", content: "Apple Reminders • Soccer practice at 4pm", icon: <Home className="size-6" /> },
      }[role]),
    [role]
  );

  if (!config) return null;

  return (
    <div className="widget group p-6 rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-2xl bg-[rgb(var(--brand))]/10 text-[rgb(var(--brand))] group-hover:scale-110 transition-transform">
          {config.icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-[rgb(var(--text))]">{config.title}</h3>
      <p className="text-sm text-[rgb(var(--subtle))]">{config.content}</p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Setup Modal (3-Step, Accessible, Responsive)                       */
/* ------------------------------------------------------------------ */
const SetupModal: React.FC<{ onClose: (cfg?: WorkflowConfig) => void }> = ({ onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [customRoleLabel, setCustomRoleLabel] = useState("");
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [custom, setCustom] = useState("");

  const toggleRole = (r: Role) =>
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const finish = () => {
    if (roles.length === 0) return;
    const cfg: WorkflowConfig = {
      roles,
      customRoleLabel: roles.includes("custom") ? customRoleLabel.trim() || undefined : undefined,
      connectors,
      customInstructions: custom.trim(),
    };
    saveConfig(cfg);
    onClose(cfg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card max-w-3xl w-full p-10 space-y-10 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <header className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-[rgb(var(--text))]">Configure Your Workspace</h2>
          <button
            onClick={() => onClose()}
            className="text-3xl text-[rgb(var(--subtle))] hover:text-[rgb(var(--text))] transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* Step 1: Roles */}
        {step === 1 && (
          <section className="space-y-8">
            <p className="text-lg text-[rgb(var(--text))]">1. Who are you? (select all that apply)</p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "student" as const, label: "Student" },
                { value: "professional" as const, label: "Professional / Employee" },
                { value: "executive" as const, label: "Executive" },
                { value: "parent" as const, label: "Parent" },
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all text-left font-medium text-base
                    ${roles.includes(value) ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5 shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                >
                  <input type="checkbox" checked={roles.includes(value)} onChange={() => toggleRole(value)} className="sr-only" />
                  <span>{label}</span>
                  {roles.includes(value) && <Check className="size-6 ml-auto text-[rgb(var(--brand))]" />}
                </label>
              ))}
              <label
                className={`flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all text-left font-medium text-base
                  ${roles.includes("custom") ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5 shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
              >
                <input type="checkbox" checked={roles.includes("custom")} onChange={() => toggleRole("custom")} className="sr-only" />
                <span>Custom…</span>
                {roles.includes("custom") && <Check className="size-6 ml-auto text-[rgb(var(--brand))]" />}
              </label>
            </div>
            {roles.includes("custom") && (
              <input
                type="text"
                placeholder="e.g. Freelance Designer"
                value={customRoleLabel}
                onChange={(e) => setCustomRoleLabel(e.target.value)}
                className="input w-full text-lg p-4 rounded-2xl border border-gray-300 dark:border-gray-700 focus:border-[rgb(var(--brand))] focus:ring-2 focus:ring-[rgb(var(--brand))]/20"
              />
            )}
            <div className="flex justify-end">
              <button
                disabled={roles.length === 0}
                onClick={() => setStep(2)}
                className="btn btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Connectors */}
        {step === 2 && (
          <section className="space-y-8">
            <p className="text-lg text-[rgb(var(--text))]">2. Which calendars and services do you use daily?</p>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(connectorInfo).map(([key, { label, icon }]) => {
                const c = key as Connector;
                const checked = connectors.includes(c);
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all
                      ${checked ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand))]/5 shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setConnectors((prev) => (e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)))}
                      className="sr-only"
                    />
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
          </section>
        )}

        {/* Step 3: Custom Instructions */}
        {step === 3 && (
          <section className="space-y-8">
            <p className="text-lg text-[rgb(var(--text))]">3. Any custom workflows or instructions?</p>
            <textarea
              rows={5}
              placeholder="e.g. Sync my student assignments with family calendar for better planning"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="input w-full resize-none p-5 rounded-3xl text-base border border-gray-300 dark:border-gray-700 focus:border-[rgb(var(--brand))] focus:ring-2 focus:ring-[rgb(var(--brand))]/20"
            />
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn btn-ghost px-6 py-3 text-base">Back</button>
              <button onClick={finish} className="btn btn-primary px-8 py-3 text-lg">Finish</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const OutboxShell = ({ children }: { children: ReactNode }) => (
  <div
    className={[
      "min-h-screen w-full p-8 transition-colors duration-300",
      "bg-[rgb(var(--surface))] text-[rgb(var(--text))]",
    ].join(" ")}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* MAIN OUTBOX COMPONENT (PERFECTED)                                  */
/* ------------------------------------------------------------------ */
export const Outbox: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<WorkflowConfig | null>(loadConfig);
  const [showSetup, setShowSetup] = useState(!config);
  const { replaceBySource } = useGlobalNotifications();

  // Theme: System Preference Sync (Perfect)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => setTheme(mediaQuery.matches ? "dark" : "light");
    updateTheme();
    mediaQuery.addEventListener("change", updateTheme);
    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const alerts = buildWorkspaceAlerts(config);

    const notifications: NotificationItem[] = alerts.map((message, index) => {
      const createdAt = new Date();
      return {
        id: `outbox-${slugify(message)}-${index}`,
        title: "Workspace update",
        description: message,
        body: message,
        time: new Intl.DateTimeFormat("en", {
          hour: "numeric",
          minute: "2-digit",
        }).format(createdAt),
        tone: "info",
        kind: "workspace",
        source: WORKSPACE_NOTIFICATION_SOURCE,
        read: false,
        createdAt: createdAt.toISOString(),
      };
    });

    replaceBySource(WORKSPACE_NOTIFICATION_SOURCE, notifications);
  }, [config, replaceBySource]);

  const handleSetupClose = (newCfg?: WorkflowConfig) => {
    if (newCfg) setConfig(newCfg);
    setShowSetup(false);
  };

  const statusBuckets = useMemo(
    () =>
      deliveries.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      }, {}),
    []
  );

  const safeRoles = config?.roles ?? [];
  const roleDisplay = useMemo(
    () =>
      safeRoles.includes("custom") && config?.customRoleLabel
        ? config.customRoleLabel
        : safeRoles.length > 0
        ? safeRoles.join(" / ")
        : "Workspace",
    [safeRoles, config?.customRoleLabel]
  );

  return (
    <>
      {showSetup && <SetupModal onClose={handleSetupClose} />}

      <OutboxShell>
        <div className="max-w-screen-2xl mx-auto">

          {/* HEADER */}
          <header className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-widest text-[rgb(var(--subtle))]">
                {roleDisplay} Outbox
              </p>
              <h1 className="text-4xl font-bold text-[rgb(var(--text))]">
                Scheduled Briefs & Auto Sends
              </h1>
            </div>
            <nav className="flex items-center gap-4">
              <button
                onClick={() => setShowSetup(true)}
                className="p-3 rounded-full hover:bg-white/10 transition-all hover:scale-110"
                title="Configure Workspace"
                aria-label="Configure"
              >
                <Settings className="size-6 text-[rgb(var(--text))]" />
              </button>
              <button
                onClick={() => {
                  requestNewPrompt();
                  navigate("/chat");
                }}
                className="btn btn-primary flex items-center gap-3 px-6 py-3 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Sparkles className="size-5" /> Compose New
              </button>
              <button
                onClick={() => navigate("/templates")}
                className="btn btn-ghost px-6 py-3 text-lg rounded-2xl hover:bg-white/10 transition-all"
              >
                Browse Templates
              </button>
            </nav>
          </header>

          <div className="grid grid-cols-12 gap-8">

            {/* LEFT COLUMN */}
            <aside className="col-span-3 space-y-8">
              {/* Queue Health */}
              <div className="widget p-8 rounded-3xl bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand-dark))] text-white shadow-xl overflow-hidden">
                <h2 className="text-2xl font-bold mb-6">Scheduled Briefs</h2>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(statusBuckets).map(([status, count]) => (
                    <div key={status} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:scale-105 transition-transform">
                      <p className="text-xs uppercase tracking-wider opacity-90">{status}</p>
                      <p className="text-4xl font-bold mt-2">{count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Widgets */}
              {safeRoles.length > 0 && safeRoles.map((role) => <RoleWidget key={role} role={role} />)}

              {/* Automation Controls */}
              {config?.connectors?.length ? (
                <div className="widget p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 shadow-sm border border-indigo-200/50 dark:border-purple-800/30">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[rgb(var(--text))]">
                    <Zap className="size-5 text-[rgb(var(--brand))]" /> Automation Controls
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {config.connectors.map((c) => (
                      <span key={c} className="chip px-4 py-2 bg-white dark:bg-gray-800 shadow-sm text-sm font-medium">
                        {connectorInfo[c].label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>

            {/* CENTER COLUMN */}
            <main className="col-span-6 space-y-8">
              {/* Delivery Queue */}
              <div className="widget p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">Delivery Queue</p>
                    <h3 className="text-2xl font-bold mt-1 text-[rgb(var(--text))]">Next Sends</h3>
                  </div>
                  <span className="flex items-center gap-2 text-sm text-[rgb(var(--subtle))]">
                    <Clock className="size-5" /> Auto-sync enabled
                  </span>
                </div>
                <div className="space-y-5">
                  {deliveries.map((item) => (
                    <article
                      key={item.id}
                      className="panel p-5 rounded-3xl hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg text-[rgb(var(--text)))]">{item.title}</p>
                          <p className="text-sm text-[rgb(var(--subtle))] mt-1">{item.owner}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[rgb(var(--subtle))]">{item.due}</p>
                          <span className="chip chip-warn mt-2">{item.status}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div className="widget p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">Compliance Routing</p>
                    <h3 className="text-2xl font-bold mt-1 text-[rgb(var(--text)))]">Approvals & Guardrails</h3>
                  </div>
                  <ShieldCheck className="size-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-base text-[rgb(var(--subtle))]">
                  Every outbound asset runs through Nexus guardrails. Track pending approvals and ensure each stakeholder signs off before final delivery.
                </p>
              </div>
            </main>

            {/* RIGHT COLUMN */}
            <aside className="col-span-3 space-y-8">
              {/* Templates */}
              <div className="widget p-6 rounded-3xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">Quick Actions</p>
                </div>
                <h3 className="text-xl font-bold mb-6 text-[rgb(var(--text)))]">Templates in Focus</h3>
                <div className="space-y-5">
                  {templates.map((t) => (
                    <article key={t.id} className="panel p-5 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-md transition-all">
                      <p className="font-semibold text-base text-[rgb(var(--text)))]">{t.name}</p>
                      <p className="text-sm text-[rgb(var(--subtle))] mt-2">{t.description}</p>
                      <button
                        onClick={() => navigate(`/templates?highlight=${t.id}`)}
                        className="btn btn-ghost w-full mt-4 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider hover:text-[rgb(var(--brand))]"
                      >
                        Launch <ArrowRight className="size-4" />
                      </button>
                    </article>
                  ))}
                </div>
              </div>

              {/* Distribution */}
              <div className="widget p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">Distribution</p>
                  <Send className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-lg font-semibold text-[rgb(var(--text)))]">Last Export</p>
                <p className="text-base text-[rgb(var(--subtle))] mt-1">
                  Sent to stakeholder list • 18 hours ago
                </p>
                <button
                  onClick={() => {
                    requestDocumentsView("exports");
                    navigate("/documents");
                  }}
                  className="btn btn-ghost w-full mt-5 hover:text-[rgb(var(--brand))]"
                >
                  Review History
                </button>
              </div>

              {/* Active Connectors */}
              {config?.connectors?.length ? (
                <div className="widget p-6 rounded-3xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 shadow-sm">
                  <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))] mb-4">Active Connectors</p>
                  <div className="flex flex-wrap gap-3">
                    {config.connectors.map((c) => (
                      <span key={c} className="chip px-4 py-2 bg-white dark:bg-gray-800 shadow-sm text-sm font-medium">
                        {connectorInfo[c].label}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate("/connectors")}
                    className="btn btn-ghost w-full mt-5 text-base hover:text-[rgb(var(--brand))]"
                  >
                    Manage Connectors
                  </button>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </OutboxShell>
    </>
  );
};

export default Outbox;
