import { useState } from "react";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { cn } from "../../shared/lib/cn";

const chartStyles = [
  { id: "default", label: "Default", description: "Balanced, data-dense" },
  { id: "simplified", label: "Simplified", description: "Minimal axes, clean labels" },
  { id: "custom", label: "Custom CSS", description: "Bring your own styling" },
];

const cookieModes = [
  { id: "default", label: "Default", blurb: "Full compliance banner" },
  { id: "lite", label: "Simplified", blurb: "Lightweight toast-style prompt" },
  { id: "none", label: "None", blurb: "Handled externally" },
];

export function AppearanceSettings() {
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [chartStyle, setChartStyle] = useState("default");
  const [language, setLanguage] = useState("en");
  const [cookieMode, setCookieMode] = useState("default");

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold">Appearance</h1>
        <p className="text-sm text-muted">Tune Nexus for your teams while keeping the audit trail pristine.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Brand color</CardTitle>
          <CardDescription>Align Nexus accents with your institutional palette.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Input value={brandColor} onChange={(event) => setBrandColor(event.target.value)} aria-label="Brand color" />
            <input
              type="color"
              value={brandColor}
              onChange={(event) => setBrandColor(event.target.value)}
              aria-label="Pick brand color"
              className="h-10 w-10 cursor-pointer rounded-md border border-subtle"
            />
          </div>
          <p className="text-sm text-muted">Preview updates live across the workspace.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard chart style</CardTitle>
          <CardDescription>Choose how visualizations render across teams.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {chartStyles.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setChartStyle(style.id)}
              className={cn(
                "rounded-xl border px-4 py-4 text-left transition",
                chartStyle === style.id
                  ? "border-indigo-500/60 bg-accent-soft text-white"
                  : "border-subtle bg-surface/60 text-muted hover:border-indigo-400/40",
              )}
            >
              <div className="text-sm font-medium">{style.label}</div>
              <div className="text-xs text-muted">{style.description}</div>
            </button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>Set the default narrative language for assistants.</CardDescription>
        </CardHeader>
        <CardContent className="max-w-sm">
          <Label htmlFor="language">Workspace language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cookie banner</CardTitle>
          <CardDescription>Choose how data consent is captured for end-users.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {cookieModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setCookieMode(mode.id)}
              className={cn(
                "rounded-xl border px-4 py-4 text-left transition",
                cookieMode === mode.id
                  ? "border-indigo-500/60 bg-accent-soft text-white"
                  : "border-subtle bg-surface/60 text-muted hover:border-indigo-400/40",
              )}
            >
              <div className="text-sm font-medium">{mode.label}</div>
              <div className="text-xs text-muted">{mode.blurb}</div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
