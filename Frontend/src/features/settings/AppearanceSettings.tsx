import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { ModeSegmented } from "@/features/mode/ModeSegmented";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import { toast } from "@/shared/ui/components/toast";
import { DEFAULT_ACCENTS } from "@/shared/lib/colors";
import { logEvent } from "@/shared/lib/audit";

const PALETTE = ["#3b82f6", "#2563eb", "#6366f1", "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444"] as const;
const HEX_PATTERN = /^#([0-9a-f]{6})$/i;

type ModeOption = keyof typeof DEFAULT_ACCENTS;

export default function AppearanceSettings() {
  const { theme, mode, accents, setAccentForMode } = useTheme();
  const [selectedMode, setSelectedMode] = useState<ModeOption>(mode);
  const [hexValue, setHexValue] = useState(() => accents[mode] ?? DEFAULT_ACCENTS[mode]);

  useEffect(() => {
    setHexValue(accents[selectedMode] ?? DEFAULT_ACCENTS[selectedMode]);
  }, [accents, selectedMode]);

  const normalizedHex = useMemo(() => hexValue.trim().toLowerCase(), [hexValue]);
  const isValid = HEX_PATTERN.test(normalizedHex);
  const currentAccent = accents[selectedMode]?.toLowerCase() ?? DEFAULT_ACCENTS[selectedMode].toLowerCase();
  const isDirty = isValid && normalizedHex !== currentAccent;

  const previewColor = isValid ? normalizedHex : currentAccent;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Switch between light and dark modes. We follow system defaults when possible.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current theme</p>
            <p className="text-sm text-muted">{theme === "light" ? "Light" : "Dark"}</p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace mode</CardTitle>
          <CardDescription>Student, Business, or NexusOS — each adjusts accent hues and focus areas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <ModeSegmented />
          <p className="text-sm text-muted">Active mode: {mode}</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Accent color (per mode)</CardTitle>
          <CardDescription>Dial in the hue that best fits each experience. Saved colors update instantly across the workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Mode</p>
              <p className="text-xs text-muted">Choose which mode you want to adjust before picking a color.</p>
            </div>
            <Select value={selectedMode} onValueChange={(value) => setSelectedMode(value as ModeOption)}>
              <SelectTrigger className="w-48" aria-label="Select mode for accent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="nexusos">NexusOS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Presets</p>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-8 w-8 rounded-full border border-app shadow-press transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]"
                  style={{ backgroundColor: color }}
                  aria-label={`Use accent ${color}`}
                  onClick={() => setHexValue(color)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <label htmlFor="accent-hex" className="text-sm font-medium">
                Custom hex
              </label>
              <Input
                id="accent-hex"
                value={hexValue}
                onChange={(event) => setHexValue(event.target.value)}
                aria-invalid={!isValid}
                aria-describedby="accent-hint"
                placeholder="#3b82f6"
              />
              <p id="accent-hint" className="text-xs text-muted">
                Must be a valid 6-digit hex code (e.g., #3b82f6).
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-muted">Preview</span>
              <span
                className="h-12 w-12 rounded-full border border-app shadow-press"
                style={{ backgroundColor: previewColor }}
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted">
              Current saved accent for {selectedMode}: <span className="font-medium">{accents[selectedMode]}</span>
            </p>
            <Button
              type="button"
              disabled={!isDirty}
              onClick={() => {
                if (!isValid) {
                  return;
                }
                setAccentForMode(selectedMode, normalizedHex);
                toast.success("Accent updated");
                logEvent("mode.accent.updated", { mode: selectedMode, accent: normalizedHex });
              }}
            >
              Save accent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
