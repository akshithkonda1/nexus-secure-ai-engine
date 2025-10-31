import { useEffect } from "react";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import { useSessionStore } from "@/shared/state/session";
import { logEvent } from "@/shared/lib/audit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select";

const MODES = [
  { value: "student", label: "Student", accent: "var(--accent-student)" },
  { value: "business", label: "Business", accent: "var(--accent-business)" },
  { value: "nexusos", label: "NexusOS", accent: "var(--accent-nexus)" }
] as const;

export function ModeToggle() {
  const { mode, setMode } = useTheme();
  const setSessionMode = useSessionStore((state) => state.setMode);

  useEffect(() => {
    setSessionMode(mode);
  }, [mode, setSessionMode]);

  return (
    <Select
      value={mode}
      onValueChange={(next) => {
        setMode(next as typeof mode);
        logEvent("mode.change", { mode: next });
        setSessionMode(next as typeof mode);
      }}
    >
      <SelectTrigger aria-label="Switch workspace mode" className="w-40">
        <SelectValue placeholder="Choose mode" />
      </SelectTrigger>
      <SelectContent>
        {MODES.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: item.accent }} aria-hidden="true" />
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
