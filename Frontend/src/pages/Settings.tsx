import { motion } from "framer-motion";
import { useTheme, ThemeMode } from "@/hooks/useTheme";

const themeModes: { value: ThemeMode; label: string; description: string }[] = [
  { value: "light", label: "Light", description: "Bright panels, softer glass." },
  { value: "system", label: "System", description: "Follow your OS preference automatically." },
  { value: "dark", label: "Dark", description: "Midnight surfaces with neon edges." },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.section
      className="glass-panel rounded-3xl border border-[var(--border-strong)] p-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }}
    >
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Ryuzen</p>
      <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Settings</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Configure Ryuzen experience, global motion, and theme intelligence.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {themeModes.map((mode) => {
          const isActive = mode.value === theme;
          return (
            <button
              key={mode.value}
              onClick={() => setTheme(mode.value)}
              className={`glow-border flex flex-col items-start gap-2 rounded-2xl border border-[var(--border-soft)] p-4 text-left transition ${isActive ? "bg-[color-mix(in_srgb,var(--accent-primary)_12%,var(--panel-elevated))] border-[color-mix(in_srgb,var(--accent-primary)_35%,transparent)]" : "bg-[color-mix(in_srgb,var(--panel-elevated)_86%,transparent)] hover:-translate-y-[1px]"}`}
            >
              <span className="text-sm font-semibold text-[var(--text-primary)]">{mode.label}</span>
              <span className="text-sm text-[var(--text-secondary)]">{mode.description}</span>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
