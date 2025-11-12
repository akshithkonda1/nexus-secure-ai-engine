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
  Loader2,
  AlertCircle,
  Inbox,
  Menu,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Demo data (simulated API)                                         */
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
  role: Role;
  roleLabel?: string;
  connectors: Connector[];
  customInstructions: string;
}

/* ------------------------------------------------------------------ */
/*  Connector UI data                                                 */
/* ------------------------------------------------------------------ */
const connectorInfo: Record<Connector, { label: string; icon: React.ReactNode }> = {
  canvas: { label: "Canvas", icon: <span className="size-4 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">C</span> },
  "google-calendar": { label: "Google Calendar", icon: <Clock className="size-4 text-green-600" /> },
  slack: { label: "Slack", icon: <Send className="size-4 text-purple-600" /> },
  jira: { label: "Jira", icon: <span className="size-4 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">J</span> },
  notion: { label: "Notion", icon: <span className="size-4 rounded bg-gray-800 dark:bg-white text-white dark:text-gray-800 flex items-center justify-center text-xs font-bold">N</span> },
  outlook: { label: "Outlook", icon: <Clock className="size-4 text-blue-600" /> },
  "apple-reminders": { label: "Apple Reminders", icon: <Bell className="size-4 text-orange-600" /> },
};

/* ------------------------------------------------------------------ */
/*  Role-specific sections                                            */
/* ------------------------------------------------------------------ */
const RoleSection = ({ role }: { role: Role }) => {
  switch (role) {
    case "student":
      return (
        <div className="card space-y-4" role="region" aria-label="Student assignments">
          <h3 className="text-lg font-semibold">Upcoming Assignments</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Canvas sync • 2 items due this week
          </p>
        </div>
      );
    case "professional":
      return (
        <div className="card space-y-4" role="region" aria-label="Sprint board">
          <h3 className="text-lg font-semibold">Sprint Board</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Jira sync • 5 tickets in review
          </p>
        </div>
      );
    case "executive":
      return (
        <div className="card space-y-4" role="region" aria-label="Board preparation">
          <h3 className="text-lg font-semibold">Board Prep</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Calendar sync • 3 meetings today
          </p>
        </div>
      );
    case "parent":
      return (
        <div className="card space-y-4" role="region" aria-label="Family calendar">
          <h3 className="text-lg font-semibold">Family Calendar</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Apple Reminders • Soccer practice at 4pm
          </p>
        </div>
      );
    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/*  Setup Modal (3 steps)                                             */
/* ------------------------------------------------------------------ */
function SetupModal({ onClose }: { onClose: (cfg?: WorkflowConfig) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<Role | "">("");
  const [roleLabel, setRoleLabel] = useState("");
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [custom, setCustom] = useState("");

  const finish = () => {
    if (!role) return;
    const cfg: WorkflowConfig = {
      role: role as Role,
      roleLabel: role === "custom" ? roleLabel.trim() : undefined,
      connectors,
      customInstructions: custom.trim(),
    };
    onClose(cfg);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-title"
    >
      <div className="bg-white dark:bg-gray-900 max-w-2xl w-full rounded-3xl shadow-2xl p-8 space-y-8 animate-slideUp">
        <div className="flex items-center justify-between">
          <h2 id="setup-title" className="text-2xl font-bold">Configure Your Workspace</h2>
          <button 
            onClick={() => onClose()} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Step 1 – Role */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-lg font-semibold mb-2">1. Who are you?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select your primary role to customize your experience</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  { value: "student", label: "Student", desc: "Track assignments & deadlines" },
                  { value: "professional", label: "Professional", desc: "Manage projects & tasks" },
                  { value: "executive", label: "Executive", desc: "Board prep & briefings" },
                  { value: "parent", label: "Parent", desc: "Family schedules & activities" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  className={`p-5 rounded-2xl border-2 transition-all text-left group hover:scale-105
                    ${role === opt.value ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-lg" : "border-gray-200 dark:border-gray-700 hover:border-blue-400"}`}
                  aria-pressed={role === opt.value}
                >
                  <div className="font-semibold text-base">{opt.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{opt.desc}</div>
                </button>
              ))}
              <button
                onClick={() => setRole("custom")}
                className={`p-5 rounded-2xl border-2 transition-all text-left group hover:scale-105
                  ${role === "custom" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-lg" : "border-gray-200 dark:border-gray-700 hover:border-blue-400"}`}
                aria-pressed={role === "custom"}
              >
                <div className="font-semibold text-base">Custom…</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Define your own role</div>
              </button>
            </div>
            {role === "custom" && (
              <input
                type="text"
                placeholder="e.g. Freelance Designer"
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-600 focus:outline-none transition"
                aria-label="Custom role name"
                autoFocus
              />
            )}
            <div className="flex justify-end">
              <button 
                disabled={!role} 
                onClick={() => setStep(2)} 
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                Next <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 – Connectors */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-lg font-semibold mb-2">2. Which tools should Nexus watch?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select all platforms you want to integrate</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(connectorInfo).map(([key, { label, icon }]) => {
                const c = key as Connector;
                const checked = connectors.includes(c);
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-105
                      ${checked ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-lg" : "border-gray-200 dark:border-gray-700 hover:border-blue-400"}`}
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
                      aria-label={`Connect to ${label}`}
                    />
                    <div className="shrink-0">{icon}</div>
                    <span className="font-medium">{label}</span>
                    {checked && <Check className="size-5 ml-auto text-blue-600" />}
                  </label>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-semibold transition">
                Back
              </button>
              <button onClick={() => setStep(3)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                Next <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 – Custom */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-lg font-semibold mb-2">3. Anything else?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add custom instructions or preferences (optional)</p>
            </div>
            <textarea
              rows={4}
              placeholder="e.g. Daily anatomy flashcards from Canvas quizzes"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-600 focus:outline-none transition resize-none"
              aria-label="Custom instructions"
            />
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-semibold transition">
                Back
              </button>
              <button onClick={finish} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                Finish <Check className="size-4" />
              </button>
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
function NotificationBell({ config }: { config: WorkflowConfig }) {
  const [open, setOpen] = useState(false);
  const alerts = [
    config.role === "student" && "Canvas quiz due in 2h",
    config.connectors.includes("google-calendar") && "Meeting at 3pm",
    config.customInstructions && "Custom task ready",
  ].filter(Boolean) as string[];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition relative"
        aria-label={`Notifications${alerts.length > 0 ? ` (${alerts.length} new)` : ""}`}
        aria-expanded={open}
      >
        <Bell className="size-5" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 space-y-3 border border-gray-200 dark:border-gray-700 z-50 animate-slideDown">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X className="size-4" />
            </button>
          </div>
          {alerts.length > 0 ? (
            alerts.map((a, i) => (
              <div key={i} className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-sm flex items-start gap-2">
                <AlertCircle className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{a}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No new notifications</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                       */
/* ------------------------------------------------------------------ */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="size-16 text-gray-300 dark:text-gray-700 mb-4" />
      <p className="text-gray-500 dark:text-gray-400 font-medium">{message}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Error State                                                       */
/* ------------------------------------------------------------------ */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="size-16 text-red-500 mb-4" />
      <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">{message}</p>
      <button onClick={onRetry} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
        Try Again
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                    */
/* ------------------------------------------------------------------ */
export default function Outbox() {
  const [config, setConfig] = useState<WorkflowConfig | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryData, setDeliveryData] = useState<typeof deliveries>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulate API load
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        setDeliveryData(deliveries);
        // Check for existing config (would normally come from API)
        const hasConfig = false; // Simulate first-time user
        if (!hasConfig) {
          setShowSetup(true);
        } else {
          // Simulate loading config
          setConfig({
            role: "professional",
            connectors: ["jira", "slack"],
            customInstructions: "",
          });
        }
      } catch (err) {
        setError("Failed to load workspace data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSetupClose = (newCfg?: WorkflowConfig) => {
    if (newCfg) setConfig(newCfg);
    setShowSetup(false);
  };

  const statusBuckets = deliveryData.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
        
        .card {
          @apply bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700;
        }
        .panel-hover {
          @apply hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all;
        }
        .chip {
          @apply inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300;
        }
        .chip-warn {
          @apply bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400;
        }
      `}</style>

      {showSetup && <SetupModal onClose={handleSetupClose} />}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-40">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        <div className="max-w-[1800px] mx-auto p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT SIDEBAR */}
            <aside className={`lg:col-span-3 space-y-6 ${mobileMenuOpen ? "block" : "hidden lg:block"}`}>
              
              <div className="card space-y-5">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {config?.roleLabel ?? config?.role ?? "Workspace"} outbox
                  </p>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Scheduled briefs
                  </h1>
                </div>

                {deliveryData.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(statusBuckets).map(([status, count]) => (
                      <div
                        key={status}
                        className="flex flex-col items-center rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-3"
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          {status}
                        </span>
                        <span className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No scheduled deliveries</p>
                )}
              </div>

              {config && <RoleSection role={config.role} />}

              {config?.connectors.length ? (
                <div className="card space-y-3">
                  <h2 className="text-lg font-semibold">Automation controls</h2>
                  <div className="flex flex-wrap gap-2">
                    {config.connectors.map((c) => (
                      <span key={c} className="chip flex items-center gap-1.5">
                        {connectorInfo[c].icon}
                        {connectorInfo[c].label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

            </aside>

            {/* MAIN CONTENT */}
            <section className="lg:col-span-6 space-y-6">

              {/* Header */}
              <header className="card panel-hover">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {config?.roleLabel ?? config?.role ?? "Workspace"} outbox
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Scheduled briefs &amp; auto sends
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {config && <NotificationBell config={config} />}

                    <button
                      onClick={() => setShowSetup(true)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      title="Re-configure workflow"
                      aria-label="Settings"
                    >
                      <Settings className="size-5" />
                    </button>

                    <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-semibold text-sm">
                      <Sparkles className="size-4" /> Compose new
                    </button>
                  </div>
                </div>
              </header>

              {/* Delivery queue */}
              <div className="card panel-hover space-y-5">
                <header className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Delivery queue
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Next sends
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="size-4" /> Auto-sync enabled
                  </span>
                </header>

                {error ? (
                  <ErrorState message={error} onRetry={() => window.location.reload()} />
                ) : deliveryData.length > 0 ? (
                  <ul className="space-y-3">
                    {deliveryData.map((item) => (
                      <li
                        key={item.id}
                        className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between rounded-xl p-4 text-sm transition cursor-pointer"
                      >
                        <div className="mb-2 sm:mb-0">
                          <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.owner}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.due}</p>
                          <span className="chip chip-warn">{item.status}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState message="No deliveries scheduled" />
                )}
              </div>

              {/* Compliance */}
              <div className="card panel-hover space-y-4">
                <header className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Compliance routing
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Approvals &amp; guardrails
                    </h3>
                  </div>
                  <ShieldCheck className="size-6 text-blue-600" />
                </header>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Every outbound asset runs through Nexus guardrails. Track pending approvals and ensure each stakeholder signs off before final delivery.
                </p>
              </div>
