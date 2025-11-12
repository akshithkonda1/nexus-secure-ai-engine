import React, { useState, useEffect } from "react";

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
/*  SVG Icons (replacing lucide-react)                               */
/* ------------------------------------------------------------------ */
const Icons = {
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Send: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  ShieldCheck: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Settings: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Bell: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Loader: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={`${className} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  AlertCircle: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Inbox: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  Menu: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Connector UI data                                                 */
/* ------------------------------------------------------------------ */
const connectorInfo: Record<Connector, { label: string; icon: React.ReactNode }> = {
  canvas: { label: "Canvas", icon: <span className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">C</span> },
  "google-calendar": { label: "Google Calendar", icon: <Icons.Clock className="w-4 h-4 text-green-600" /> },
  slack: { label: "Slack", icon: <Icons.Send className="w-4 h-4 text-purple-600" /> },
  jira: { label: "Jira", icon: <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">J</span> },
  notion: { label: "Notion", icon: <span className="w-4 h-4 rounded bg-gray-800 dark:bg-white text-white dark:text-gray-800 flex items-center justify-center text-xs font-bold">N</span> },
  outlook: { label: "Outlook", icon: <Icons.Clock className="w-4 h-4 text-blue-600" /> },
  "apple-reminders": { label: "Apple Reminders", icon: <Icons.Bell className="w-4 h-4 text-orange-600" /> },
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
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

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
                Next <Icons.ArrowRight />
              </button>
            </div>
          </div>
        )}

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
                    {checked && <Icons.Check className="w-5 h-5 ml-auto text-blue-600" />}
                  </label>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-semibold transition">
                Back
              </button>
              <button onClick={() => setStep(3)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                Next <Icons.ArrowRight />
              </button>
            </div>
          </div>
        )}

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
                Finish <Icons.Check className="w-4 h-4" />
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
        <Icons.Bell className="w-5 h-5" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 space-y-3 border border-gray-200 dark:border-gray-700 z-50 animate-slideDown">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
          {alerts.length > 0 ? (
            alerts.map((a, i) => (
              <div key={i} className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-sm flex items-start gap-2">
                <Icons.AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
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
      <Icons.Inbox className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
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
      <Icons.AlertCircle className="w-16 h-16 text-red-500 mb-4" />
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setDeliveryData(deliveries);
        const hasConfig = false;
        if (!hasConfig) {
          setShowSetup(true);
        } else {
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
          <Icons.Loader className="w-12 h-12 text-blue-600 mx-auto mb-4" />
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
          background: white;
          border-radius: 1rem;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          padding: 1.5rem;
          border: 1px solid rgb(243 244 246);
        }
        .dark .card {
          background: rgb(31 41 55);
          border-color: rgb(55 65 81);
        }
        .panel-hover:hover {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          border-color:
