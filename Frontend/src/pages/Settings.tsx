import { useTheme, ThemeMode } from "../theme/ThemeProvider";
import { motion } from "framer-motion";
import { useState } from "react";
import { Bell, Shield, Database, Zap, User, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const { mode, resolved, setTheme } = useTheme();
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
    setTheme(value);
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
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
          Customize your Ryuzen experience with appearance, notifications, privacy, performance, and account preferences.
        </p>
      </motion.header>

      <div className="space-y-6 md:space-y-8">
        {/* Appearance Section */}
        <motion.div
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
          variants={itemVariants}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-blue-600 dark:bg-slate-700/50 dark:text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Appearance</h2>
              <p className="text-xs text-gray-600 dark:text-slate-400">Customize how Ryuzen looks</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Theme</p>
              <div className="flex flex-wrap gap-2">
                {(["light", "dark", "system"] as ThemeMode[]).map((value) => (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => handleThemeChange(value)}
                    className={`flex-1 min-w-[140px] rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                      mode === value
                        ? "border-blue-600 bg-gray-50 text-gray-900 dark:border-blue-500 dark:bg-slate-700/50 dark:text-slate-100"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300"
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    aria-pressed={mode === value}
                    aria-label={`Set theme to ${value} mode`}
                  >
                    {value}
                  </motion.button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-slate-400">Currently using: {resolved} mode</p>
            </div>
            <div>
              <label htmlFor="language-select" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Language</label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:focus:border-blue-500"
                aria-label="Select language"
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
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
          variants={itemVariants}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-blue-600 dark:bg-slate-700/50 dark:text-blue-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Notifications</h2>
              <p className="text-xs text-gray-600 dark:text-slate-400">Fine-tune alerts and updates</p>
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
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:border-blue-600 dark:border-slate-700 dark:bg-slate-700/50 dark:hover:border-blue-500"
                whileHover={{ x: 2 }}
              >
                <div>
                  <div className="font-medium text-gray-700 dark:text-slate-300">{item.label}</div>
                  <p className="text-xs text-gray-600 dark:text-slate-400">{item.description}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                    className="peer sr-only"
                    aria-label={item.label}
                  />
                  <div className="peer relative h-6 w-11 rounded-full border border-gray-200 bg-white transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-gray-600 after:transition-transform peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:after:translate-x-5 peer-checked:after:bg-white dark:border-slate-700 dark:bg-slate-800 dark:after:bg-slate-400 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500" />
                </label>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Privacy & Security Section */}
        <motion.div
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
          variants={itemVariants}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-blue-600 dark:bg-slate-700/50 dark:text-blue-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Privacy & Security</h2>
              <p className="text-xs text-gray-600 dark:text-slate-400">Manage your data and privacy settings</p>
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
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:border-blue-600 dark:border-slate-700 dark:bg-slate-700/50 dark:hover:border-blue-500"
                whileHover={{ x: 2 }}
              >
                <div>
                  <div className="font-medium text-gray-700 dark:text-slate-300">{item.label}</div>
                  <p className="text-xs text-gray-600 dark:text-slate-400">{item.description}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={privacy[item.key as keyof typeof privacy]}
                    onChange={(e) => setPrivacy({ ...privacy, [item.key]: e.target.checked })}
                    className="peer sr-only"
                    aria-label={item.label}
                  />
                  <div className="peer relative h-6 w-11 rounded-full border border-gray-200 bg-white transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-gray-600 after:transition-transform peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:after:translate-x-5 peer-checked:after:bg-white dark:border-slate-700 dark:bg-slate-800 dark:after:bg-slate-400 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500" />
                </label>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Section */}
        <motion.div
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
          variants={itemVariants}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-blue-600 dark:bg-slate-700/50 dark:text-blue-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Performance</h2>
              <p className="text-xs text-gray-600 dark:text-slate-400">Optimize app performance and resource usage</p>
            </div>
          </div>
          <div>
            <p className="mb-3 block text-sm font-medium text-gray-700 dark:text-slate-300">Performance Mode</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {["eco", "balanced", "performance"].map((mode) => (
                <motion.button
                  key={mode}
                  type="button"
                  onClick={() => setPerformance(mode)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                    performance === mode
                      ? "border-blue-600 bg-gray-50 text-gray-900 dark:border-blue-500 dark:bg-slate-700/50 dark:text-slate-100"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  aria-pressed={performance === mode}
                  aria-label={`Set performance mode to ${mode}`}
                >
                  {mode}
                </motion.button>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-600 dark:text-slate-400">
              {performance === "eco" && "Reduces resource usage for longer battery life"}
              {performance === "balanced" && "Optimal balance between performance and efficiency"}
              {performance === "performance" && "Maximum performance, higher resource usage"}
            </p>
          </div>
        </motion.div>

        {/* Account Section */}
        <motion.div
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
          variants={itemVariants}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-blue-600 dark:bg-slate-700/50 dark:text-blue-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Account</h2>
              <p className="text-xs text-gray-600 dark:text-slate-400">Manage your account settings</p>
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
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:border-blue-600 dark:border-slate-700 dark:bg-slate-700/50 dark:hover:border-blue-500"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`Open ${item.label}`}
              >
                <div>
                  <div className="font-medium text-gray-700 dark:text-slate-300">{item.label}</div>
                  <p className="text-xs text-gray-600 dark:text-slate-400">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-slate-400" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
