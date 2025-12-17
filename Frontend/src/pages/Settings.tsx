import { useTheme, ThemeMode } from "../theme/ThemeProvider";
import { motion } from "framer-motion";
import { useState } from "react";
import { Bell, Shield, Database, Zap, User, ChevronRight } from "lucide-react";
import { Card, SectionHeader, Toggle, Select, Label, cn, text, bg, border } from "../components/ui/ThemeComponents";

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
        <h1 className={cn("text-3xl font-semibold", text.primary)}>Settings</h1>
        <p className={cn("text-sm leading-relaxed", text.muted)}>
          Customize your Ryuzen experience with appearance, notifications, privacy, performance, and account preferences.
        </p>
      </motion.header>

      <div className="space-y-6 md:space-y-8">
        {/* Appearance Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <SectionHeader
              icon={Zap}
              iconColor="blue"
              title="Appearance"
              description="Customize how Ryuzen looks"
            />
            <div className="space-y-4">
              <div>
                <Label className="mb-2">Theme</Label>
                <div className="flex flex-wrap gap-2">
                  {(["light", "dark", "system"] as ThemeMode[]).map((value) => (
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() => handleThemeChange(value)}
                      className={cn(
                        "flex-1 min-w-[140px] rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors",
                        mode === value
                          ? cn("border-[var(--accent)]", bg.elevated, text.primary)
                          : cn(border.subtle, text.muted, "hover:border-[var(--line-strong)]", "hover:text-[var(--text)]")
                      )}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      aria-pressed={mode === value}
                      aria-label={`Set theme to ${value} mode`}
                    >
                      {value}
                    </motion.button>
                  ))}
                </div>
                <p className={cn("mt-2 text-xs", text.muted)}>Currently using: {resolved} mode</p>
              </div>
              <div>
                <Label htmlFor="language-select" className="mb-2">Language</Label>
                <Select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label="Select language"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <SectionHeader
              icon={Bell}
              iconColor="blue"
              title="Notifications"
              description="Fine-tune alerts and updates"
            />
            <div className="space-y-3">
              {[
                { key: "workspace", label: "Workspace activity", description: "Mentions, assignments, and workspace changes" },
                { key: "mentions", label: "Mentions", description: "Notify when someone mentions you" },
                { key: "updates", label: "Product updates", description: "Release notes and announcements" },
              ].map((item) => (
                <motion.div
                  key={item.key}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                    border.subtle,
                    bg.elevated,
                    "hover:border-[var(--line-strong)]"
                  )}
                  whileHover={{ x: 2 }}
                >
                  <div>
                    <div className={cn("font-medium", text.primary)}>{item.label}</div>
                    <p className={cn("text-xs", text.muted)}>{item.description}</p>
                  </div>
                  <Toggle
                    enabled={notifications[item.key as keyof typeof notifications]}
                    onChange={(enabled) => setNotifications({ ...notifications, [item.key]: enabled })}
                  />
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Privacy & Security Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <SectionHeader
              icon={Shield}
              iconColor="blue"
              title="Privacy & Security"
              description="Manage your data and privacy settings"
            />
            <div className="space-y-3">
              {[
                { key: "analytics", label: "Analytics", description: "Help improve Ryuzen with usage data" },
                { key: "crashReports", label: "Crash Reports", description: "Automatically send crash reports" },
                { key: "telemetry", label: "Telemetry", description: "Share performance metrics" },
              ].map((item) => (
                <motion.div
                  key={item.key}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                    border.subtle,
                    bg.elevated,
                    "hover:border-[var(--line-strong)]"
                  )}
                  whileHover={{ x: 2 }}
                >
                  <div>
                    <div className={cn("font-medium", text.primary)}>{item.label}</div>
                    <p className={cn("text-xs", text.muted)}>{item.description}</p>
                  </div>
                  <Toggle
                    enabled={privacy[item.key as keyof typeof privacy]}
                    onChange={(enabled) => setPrivacy({ ...privacy, [item.key]: enabled })}
                  />
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Performance Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <SectionHeader
              icon={Database}
              iconColor="blue"
              title="Performance"
              description="Optimize app performance and resource usage"
            />
            <div>
              <p className={cn("mb-3 block text-sm font-medium", text.primary)}>Performance Mode</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {["eco", "balanced", "performance"].map((perfMode) => (
                  <motion.button
                    key={perfMode}
                    type="button"
                    onClick={() => setPerformance(perfMode)}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors",
                      performance === perfMode
                        ? cn("border-[var(--accent)]", bg.elevated, text.primary)
                        : cn(border.subtle, text.muted, "hover:border-[var(--line-strong)]", "hover:text-[var(--text)]")
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    aria-pressed={performance === perfMode}
                    aria-label={`Set performance mode to ${perfMode}`}
                  >
                    {perfMode}
                  </motion.button>
                ))}
              </div>
              <p className={cn("mt-3 text-xs", text.muted)}>
                {performance === "eco" && "Reduces resource usage for longer battery life"}
                {performance === "balanced" && "Optimal balance between performance and efficiency"}
                {performance === "performance" && "Maximum performance, higher resource usage"}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Account Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <SectionHeader
              icon={User}
              iconColor="blue"
              title="Account"
              description="Manage your account settings"
            />
            <div className="space-y-3">
              {[
                { label: "Profile Settings", description: "Update your profile information" },
                { label: "Connected Apps", description: "Manage third-party integrations" },
                { label: "Billing & Subscription", description: "View and manage your plan" },
                { label: "Advanced Settings", description: "Developer options and experimental features" },
              ].map((item, index) => (
                <motion.button
                  key={index}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                    border.subtle,
                    bg.elevated,
                    "hover:border-[var(--line-strong)]"
                  )}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`Open ${item.label}`}
                >
                  <div>
                    <div className={cn("font-medium", text.primary)}>{item.label}</div>
                    <p className={cn("text-xs", text.muted)}>{item.description}</p>
                  </div>
                  <ChevronRight className={cn("h-5 w-5", text.muted)} />
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}
