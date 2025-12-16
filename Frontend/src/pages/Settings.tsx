import { useTheme, ThemeMode } from "../theme/ThemeProvider";
import { motion } from "framer-motion";
import { useState } from "react";
import { Bell, Shield, Database, Zap, User, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const { mode, resolved, setMode } = useTheme();
  const [notifications, setNotifications] = useState({
    workspace: true,
    mentions: true,
    updates: false,
  });
  const [privacy, setPrivacy] = useState({
    analytics: true,
    crashReports: true,
    telemetry: false,
  });
  const [performance, setPerformance] = useState("balanced");
  const [language, setLanguage] = useState("en");

  const handleThemeChange = (value: ThemeMode) => {
    setMode(value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section className="flex flex-col" variants={containerVariants} initial="hidden" animate="visible">
      <motion.header className="mb-8 space-y-3" variants={itemVariants}>
        <h1 className="text-3xl font-semibold text-[var(--text-strong)]">Settings</h1>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          Customize your Ryuzen experience with appearance, notifications, privacy, performance, and account preferences.
        </p>
      </motion.header>

      <div className="space-y-6 md:space-y-8">
        {/* Appearance Section */}
        <motion.div
          className="rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6"
          variants={itemVariants}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">Appearance</h2>
              <p className="text-xs text-[var(--text-muted)]">Customize how Ryuzen looks</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Theme</label>
              <div className="flex flex-wrap gap-2">
                {(["light", "dark", "system"] as ThemeMode[]).map((value) => (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => handleThemeChange(value)}
                    className={`flex-1 min-w-[140px] rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                      mode === value
                        ? "border-[var(--accent)] bg-[var(--layer-muted)] text-[var(--text-strong)]"
                        : "border-[var(--line-subtle)] text-[var(--text-muted)] hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {value}
                  </motion.button>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">Currently using: {resolved} mode</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-surface)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--line-strong)] focus:border-[var(--accent)] focus:outline-none"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          className="rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6"
          variants={itemVariants}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">Notifications</h2>
              <p className="text-xs text-[var(--text-muted)]">Fine-tune alerts and updates</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: "workspace", label: "Workspace activity", description: "Mentions, assignments, and workspace changes" },
              { key: "mentions", label: "Mentions", description: "Notify when someone mentions you" },
              { key: "updates", label: "Product updates", description: "Release notes and announcements" },
            ].map((item) => (
              <motion.div
                key={item.key}
                className="flex items-center justify-between rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-4 py-3 transition-colors hover:border-[var(--accent)]"
                whileHover={{ x: 2 }}
              >
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{item.label}</div>
                  <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full border border-[var(--line-subtle)] bg-[var(--layer-surface)] transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-5" />
                </label>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Privacy & Security Section */}
        <motion.div
          className="rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6"
          variants={itemVariants}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">Privacy & Security</h2>
              <p className="text-xs text-[var(--text-muted)]">Manage your data and privacy settings</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: "analytics", label: "Analytics", description: "Help improve Ryuzen with usage data" },
              { key: "crashReports", label: "Crash Reports", description: "Automatically send crash reports" },
              { key: "telemetry", label: "Telemetry", description: "Share performance metrics" },
            ].map((item) => (
              <motion.div
                key={item.key}
                className="flex items-center justify-between rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-4 py-3 transition-colors hover:border-[var(--accent)]"
                whileHover={{ x: 2 }}
              >
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{item.label}</div>
                  <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={privacy[item.key as keyof typeof privacy]}
                    onChange={(e) => setPrivacy({ ...privacy, [item.key]: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full border border-[var(--line-subtle)] bg-[var(--layer-surface)] transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-5" />
                </label>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Section */}
        <motion.div
          className="rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6"
          variants={itemVariants}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">Performance</h2>
              <p className="text-xs text-[var(--text-muted)]">Optimize app performance and resource usage</p>
            </div>
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-[var(--text-primary)]">Performance Mode</label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {["eco", "balanced", "performance"].map((mode) => (
                <motion.button
                  key={mode}
                  type="button"
                  onClick={() => setPerformance(mode)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                    performance === mode
                      ? "border-[var(--accent)] bg-[var(--layer-muted)] text-[var(--text-strong)]"
                      : "border-[var(--line-subtle)] text-[var(--text-muted)] hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {mode}
                </motion.button>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              {performance === "eco" && "Reduces resource usage for longer battery life"}
              {performance === "balanced" && "Optimal balance between performance and efficiency"}
              {performance === "performance" && "Maximum performance, higher resource usage"}
            </p>
          </div>
        </motion.div>

        {/* Account Section */}
        <motion.div
          className="rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6"
          variants={itemVariants}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-strong)]">Account</h2>
              <p className="text-xs text-[var(--text-muted)]">Manage your account settings</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Profile Settings", description: "Update your profile information" },
              { label: "Connected Apps", description: "Manage third-party integrations" },
              { label: "Billing & Subscription", description: "View and manage your plan" },
              { label: "Advanced Settings", description: "Developer options and experimental features" },
            ].map((item, index) => (
              <motion.button
                key={index}
                className="flex w-full items-center justify-between rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-4 py-3 text-left transition-colors hover:border-[var(--accent)]"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{item.label}</div>
                  <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
