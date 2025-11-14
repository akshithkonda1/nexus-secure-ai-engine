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

type DeliveryBucket = "today-morning" | "today-afternoon" | "today-evening" | "later-week";

interface DeliveryItem {
  id: string;
  title: string;
  owner: string;
  due: string;
  status: string;
  bucket: DeliveryBucket;
  priority: number; // higher = more important
}

const deliveries: readonly DeliveryItem[] = [
  {
    id: "dl-1",
    title: "Executive briefing draft",
    owner: "Leadership",
    due: "Today • 9:30am",
    status: "Awaiting review",
    bucket: "today-morning",
    priority: 3,
  },
  {
    id: "dl-2",
    title: "Governance pulse",
    owner: "Risk Team",
    due: "Today • 2:00pm",
    status: "Queued",
    bucket: "today-afternoon",
    priority: 2,
  },
  {
    id: "dl-3",
    title: "Research synthesis",
    owner: "Product Insights",
    due: "Fri • 3:30pm",
    status: "Drafting",
    bucket: "later-week",
    priority: 1,
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
] as const;

/* ------------------------------------------------------------------ */
/* Types                                                              */
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
    // non-critical
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

/* ------------------------------------------------------------------ */
/* Notification helpers                                               */
/* ------------------------------------------------------------------ */

const WORKSPACE_NOTIFICATION_SOURCE = "workspace/outbox";

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function buildWorkspaceAlerts(config: WorkflowConfig | null): string[] {
  const roles = config?.roles ?? [];
  const connectors = config?.connectors ?? [];
  const customInstructions = config?.customInstructions?.trim();

  return [
    roles.includes("student") && "Canvas quiz due in 2 hours.",
    connectors.includes("google-calendar") && "You have a meeting this afternoon.",
    customInstructions && "Your custom workflow has tasks queued.",
    roles.includes("parent") && "Family event coming up on your shared calendar.",
  ].filter(Boolean) as string[];
}

/* ------------------------------------------------------------------ */
/* Role Widget Component                                              */
/* ------------------------------------------------------------------ */

const RoleWidget: React.FC<{ role: Role }> = ({ role }) => {
  const config = useMemo(
    () =>
      ({
        student: {
          title: "Upcoming Assignments",
          content: "Canvas sync • 2 items due this week",
          icon: <BookOpen className="size-6" />,
        },
        professional: {
          title: "Sprint Board",
          content: "Jira sync • 5 tickets in review",
          icon: <Briefcase className="size-6" />,
        },
        executive: {
          title: "Board Prep",
          content: "Calendar sync • 3 meetings today",
          icon: <Calendar className="size-6" />,
        },
        parent: {
          title: "Family Calendar",
          content: "Apple Reminders • Soccer practice at 4pm",
          icon: <Home className="size-6" />,
        },
      }[role]),
    [role]
  );

  if (!config) return null;

  return (
    <div
      className={[
        "widget group p-6 rounded-3xl shadow-sm border transition-all hover:shadow-md",
        "bg-[rgb(var(--surface))] border-[rgba(var(--border),0.7)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-2xl bg-[rgba(var(--brand),0.12)] text-[rgb(var(--brand))] group-hover:scale-110 transition-transform">
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
      <div className="card max-w-3xl w-full p-10 space-y-10 rounded-3xl border border-[rgba(var(--border),0.45)] bg-[rgb(var(--surface))] text-[rgb(var(--text))] shadow-2xl animate-in fade-in zoom-in duration-200">
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
            <p className="text-lg text-[rgb(var(--text))]">
              1. Who are you? <span className="text-[rgb(var(--subtle))]">(select all that apply)</span>
            </p>
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
                    ${
                      roles.includes(value)
                        ? "border-[rgb(var(--brand))] bg-[rgba(var(--brand),0.06)] shadow-md"
                        : "border-[rgba(var(--border),0.9)] hover:border-[rgb(var(--brand))]/60"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={roles.includes(value)}
                    onChange={() => toggleRole(value)}
                    className="sr-only"
                  />
                  <span>{label}</span>
                  {roles.includes(value) && (
                    <Check className="size-6 ml-auto text-[rgb(var(--brand))]" />
                  )}
                </label>
              ))}
              <label
                className={`flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all text-left font-medium text-base
                  ${
                    roles.includes("custom")
                      ? "border-[rgb(var(--brand))] bg-[rgba(var(--brand),0.06)] shadow-md"
                      : "border-[rgba(var(--border),0.9)] hover:border-[rgb(var(--brand))]/60"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={roles.includes("custom")}
                  onChange={() => toggleRole("custom")}
                  className="sr-only"
                />
                <span>Custom…</span>
                {roles.includes("custom") && (
                  <Check className="size-6 ml-auto text-[rgb(var(--brand))]" />
                )}
              </label>
            </div>
            {roles.includes("custom") && (
              <input
                type="text"
                placeholder="e.g. Freelance Designer"
                value={customRoleLabel}
                onChange={(e) => setCustomRoleLabel(e.target.value)}
                className="input w-full text-lg p-4 rounded-2xl border border-[rgba(var(--border),0.9)] focus:border-[rgb(var(--brand))] focus:ring-2 focus:ring-[rgb(var(--brand))]/20 bg-[rgb(var(--bg))]"
              />
            )}
            <div className="flex justify-end">
              <button
                disabled={roles.length === 0}
                onClick={() => setStep(2)}
                className="inline-flex items-center justify-center rounded-zora-lg px-8 py-3 text-lg font-semibold bg-zora-aurora text-zora-night shadow-zora-glow transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-zora-glow hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Connectors */}
        {step === 2 && (
          <section className="space-y-8">
            <p className="text-lg text-[rgb(var(--text))]">
              2. Which calendars and services do you use daily?
            </p>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(connectorInfo).map(([key, { label, icon }]) => {
                const c = key as Connector;
                const checked = connectors.includes(c);
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all
                      ${
                        checked
                          ? "border-[rgb(var(--brand))] bg-[rgba(var(--brand),0.06)] shadow-md"
                          : "border-[rgba(var(--border),0.9)] hover:border-[rgb(var(--brand))]/60"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setConnectors((prev) =>
                          e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)
                        )
                      }
                      className="sr-only"
                    />
                    <div className="p-3 rounded-2xl bg-[rgb(var(--panel))]">{icon}</div>
                    <span className="text-base font-medium">{label}</span>
                    {checked && (
                      <Check className="size-6 ml-auto text-[rgb(var(--brand))]" />
                    )}
                  </label>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center justify-center rounded-zora-lg border border-zora-border bg-zora-space px-6 py-3 text-base font-semibold text-zora-white shadow-zora-soft/40 transition hover:bg-zora-deep hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center justify-center rounded-zora-lg px-8 py-3 text-lg font-semibold bg-zora-aurora text-zora-night shadow-zora-glow transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-zora-glow hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99]"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Custom Instructions */}
        {step === 3 && (
          <section className="space-y-8">
            <p className="text-lg text-[rgb(var(--text))]">
              3. Any custom workflows or instructions?
            </p>
            <textarea
              rows={5}
              placeholder="e.g. Sync my student assignments with family calendar for better planning"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="input w-full resize-none p-5 rounded-3xl text-base border border-[rgba(var(--border),0.9)] focus:border-[rgb(var(--brand))] focus:ring-2 focus:ring-[rgb(var(--brand))]/20 bg-[rgb(var(--bg))]"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center justify-center rounded-zora-lg border border-zora-border bg-zora-space px-6 py-3 text-base font-semibold text-zora-white shadow-zora-soft/40 transition hover:bg-zora-deep hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]"
              >
                Back
              </button>
              <button
                onClick={finish}
                className="inline-flex items-center justify-center rounded-zora-lg px-8 py-3 text-lg font-semibold bg-zora-aurora text-zora-night shadow-zora-glow transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-zora-glow hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99]"
              >
                Finish
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Layout shell                                                       */
/* ------------------------------------------------------------------ */

const OutboxShell = ({ children }: { children: ReactNode }) => (
  <div
    className={[
      "min-h-screen w-full p-8 transition-colors duration-300",
      "bg-[rgb(var(--bg))] text-[rgb(var(--text))]",
    ].join(" ")}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* MAIN OUTBOX COMPONENT                                              */
/* ------------------------------------------------------------------ */

export const Outbox: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<WorkflowConfig | null>(loadConfig);
  const [showSetup, setShowSetup] = useState(!config);
  const { replaceBySource } = useGlobalNotifications();

  // Whether Nexus "balanced" the day (affects ordering + copy)
  const [isBalanced, setIsBalanced] = useState(false);

  // Push workspace alerts into the global notifications panel
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

  const safeRoles = config?.roles ?? [];
  const primaryRole: Role | null = safeRoles[0] ?? null;

  const roleDisplay = useMemo(
    () =>
      safeRoles.includes("custom") && config?.customRoleLabel
        ? config.customRoleLabel
        : safeRoles.length > 0
        ? safeRoles.join(" / ")
        : "Workspace",
    [safeRoles, config?.customRoleLabel]
  );

  const todayTitle = useMemo(() => {
    switch (primaryRole) {
      case "student":
        return "Today’s Classes & Assignments";
      case "professional":
        return "Today’s Workload";
      case "executive":
        return "Briefings & Decisions";
      case "parent":
        return "Today’s Family Plan";
      default:
        return "Today’s Plan";
    }
  }, [primaryRole]);

  const todaySubtitle = useMemo(() => {
    if (isBalanced) {
      return "Sorted by impact and urgency · Balanced by Nexus";
    }
    switch (primaryRole) {
      case "student":
        return "A quick view of what’s due and what can wait.";
      case "professional":
        return "Meetings, drafts, and follow-ups in one place.";
      case "executive":
        return "Nexus lines up the prep you need for the day.";
      case "parent":
        return "School, work, and family reminders in one list.";
      default:
        return "What matters most over the next few days.";
    }
  }, [primaryRole, isBalanced]);

  // Buckets for the "Today" view
  const bucketMeta: { key: DeliveryBucket; label: string }[] = [
    { key: "today-morning", label: "This morning" },
    { key: "today-afternoon", label: "This afternoon" },
    { key: "today-evening", label: "This evening" },
    { key: "later-week", label: "Later this week" },
  ];

  const orderedDeliveries = useMemo(() => {
    const base = [...deliveries];
    if (!isBalanced) return base;
    return base.sort((a, b) => b.priority - a.priority);
  }, [isBalanced]);

  const statusBuckets = useMemo(
    () =>
      deliveries.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      }, {}),
    []
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
              <p className="text-sm text-[rgb(var(--subtle))]">
                Nexus keeps your important sends, reminders, and workflows aligned so you
                don’t have to juggle them in your head.
              </p>
            </div>
            <nav className="flex items-center gap-4">
              <button
                onClick={() => setShowSetup(true)}
                className="inline-flex items-center justify-center rounded-full border border-zora-border bg-zora-space/80 p-3 text-zora-white shadow-zora-soft/40 transition hover:bg-zora-deep hover:shadow-zora-glow hover:scale-[1.01] active:scale-[0.99]"
                title="Configure Workspace"
                aria-label="Configure"
              >
                <Settings className="size-6" />
              </button>
              <button
                onClick={() => {
                  requestNewPrompt();
                  navigate("/chat");
                }}
                className="inline-flex items-center gap-3 rounded-zora-lg px-6 py-3 text-lg font-semibold bg-zora-aurora text-zora-night shadow-zora-glow transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-zora-glow hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99]"
              >
                <Sparkles className="size-5" /> Compose New
              </button>
              <button
                onClick={() => navigate("/templates")}
                className="inline-flex items-center justify-center rounded-zora-lg border border-zora-border bg-zora-space px-6 py-3 text-lg font-semibold text-zora-white shadow-zora-soft/40 transition hover:bg-zora-deep hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]"
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
                <h2 className="text-2xl font-bold mb-6">Scheduled Sends</h2>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(statusBuckets).map(([status, count]) => (
                    <div
                      key={status}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:scale-105 transition-transform"
                    >
                      <p className="text-xs uppercase tracking-wider opacity-90">
                        {status}
                      </p>
                      <p className="text-4xl font-bold mt-2">{count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Widgets */}
              {safeRoles.length > 0 &&
                safeRoles
                  .filter((r) => r !== "custom")
                  .map((role) => <RoleWidget key={role} role={role} />)}

              {/* Automation Controls */}
              {config?.connectors?.length ? (
                <div className="widget p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 shadow-sm border border-indigo-200/50 dark:border-purple-800/30">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[rgb(var(--text))]">
                    <Zap className="size-5 text-[rgb(var(--brand))]" /> Automation Controls
                  </h3>
                  <p className="text-sm text-[rgb(var(--subtle))] mb-3">
                    Connected tools that Nexus uses to keep your schedule in sync:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {config.connectors.map((c) => (
                      <span
                        key={c}
                        className="chip px-4 py-2 bg-[rgb(var(--panel))] shadow-sm text-sm font-medium rounded-full"
                      >
                        {connectorInfo[c].label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>

            {/* CENTER COLUMN */}
            <main className="col-span-6 space-y-8">
              {/* Today View */}
              <div className="widget p-8 rounded-3xl bg-[rgb(var(--surface))] shadow-lg border border-[rgb(var(--border))]">
                <div className="flex items-center justify-between mb-4 gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">
                      Today’s View
                    </p>
                    <h3 className="text-2xl font-bold mt-1 text-[rgb(var(--text))]">
                      {todayTitle}
                    </h3>
                    <p className="text-sm text-[rgb(var(--subtle))] mt-1">{todaySubtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBalanced((prev) => !prev)}
                    className={[
                      "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all",
                      isBalanced
                        ? "bg-[rgba(var(--brand),0.12)] text-[rgb(var(--brand))]"
                        : "bg-[rgb(var(--panel))] text-[rgb(var(--text))] hover:bg-[rgba(var(--brand),0.08)]",
                    ].join(" ")}
                  >
                    <Sparkles className="size-4" />
                    {isBalanced ? "Revert to original order" : "Let Nexus balance my day"}
                  </button>
                </div>

                <div className="space-y-6 mt-4">
                  {bucketMeta.map(({ key, label }) => {
                    const items = orderedDeliveries.filter((d) => d.bucket === key);
                    if (!items.length) return null;

                    return (
                      <section key={key} className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--subtle))]">
                          {label}
                        </h4>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <article
                              key={item.id}
                              className="panel p-5 rounded-3xl bg-[rgb(var(--panel))] hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <p className="font-semibold text-base text-[rgb(var(--text))]">
                                    {item.title}
                                  </p>
                                  <p className="text-sm text-[rgb(var(--subtle))] mt-1">
                                    {item.owner}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-[rgb(var(--subtle))]">
                                    {item.due}
                                  </p>
                                  <span className="chip chip-warn mt-2 inline-flex">
                                    {item.status}
                                  </span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>

              {/* Compliance / Guardrails */}
              <div className="widget p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">
                      Approvals & Guardrails
                    </p>
                    <h3 className="text-2xl font-bold mt-1 text-[rgb(var(--text))]">
                      Safety checks before anything goes out
                    </h3>
                  </div>
                  <ShieldCheck className="size-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-base text-[rgb(var(--subtle))]">
                  Every outbound asset runs through Nexus guardrails. Track pending approvals
                  and make sure the right people sign off before anything hits inboxes or
                  dashboards.
                </p>
              </div>
            </main>

            {/* RIGHT COLUMN */}
            <aside className="col-span-3 space-y-8">
              {/* Templates */}
              <div className="widget p-6 rounded-3xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">
                    Quick Actions
                  </p>
                </div>
                <h3 className="text-xl font-bold mb-4 text-[rgb(var(--text))]">
                  Templates in Focus
                </h3>
                <div className="space-y-4">
                  {templates.map((t) => (
                    <article
                      key={t.id}
                      className="panel p-5 rounded-3xl bg-[rgba(var(--surface),0.9)] backdrop-blur-sm hover:shadow-md transition-all"
                    >
                      <p className="font-semibold text-base text-[rgb(var(--text))]">
                        {t.name}
                      </p>
                      <p className="text-sm text-[rgb(var(--subtle))] mt-2">
                        {t.description}
                      </p>
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
                  <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))]">
                    Distribution
                  </p>
                  <Send className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-lg font-semibold text-[rgb(var(--text))]">Last Export</p>
                <p className="text-base text-[rgb(var(--subtle))] mt-1">
                  Sent to stakeholder list • 18 hours ago.
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
                  <p className="text-sm uppercase tracking-widest text-[rgb(var(--subtle))] mb-3">
                    Active Connectors
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {config.connectors.map((c) => (
                      <span
                        key={c}
                        className="chip px-4 py-2 bg-[rgb(var(--panel))] shadow-sm text-sm font-medium rounded-full"
                      >
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
