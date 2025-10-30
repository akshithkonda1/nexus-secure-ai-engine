import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const chartStyles = [
  { id: "default", name: "Default", description: "Vibrant dual-tone gradients" },
  { id: "simplified", name: "Simplified", description: "Soft, muted lines" },
  { id: "custom", name: "Custom CSS", description: "Inject your own design tokens" },
] as const;

const cookieOptions = [
  { id: "default", name: "Default", description: "Full banner with preferences" },
  { id: "minimal", name: "Simplified", description: "Compact toast with single accept" },
  { id: "none", name: "None", description: "No banner, manual consent tracking" },
] as const;

export function AppearanceSettings(): JSX.Element {
  const [brandColor, setBrandColor] = useState("#7c3aed");
  const [chartStyle, setChartStyle] = useState<(typeof chartStyles)[number]["id"]>("default");
  const [cookiePreference, setCookiePreference] = useState<(typeof cookieOptions)[number]["id"]>("default");
  const [language, setLanguage] = useState("en");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Appearance</h1>
        <p className="text-sm text-muted">Control how Nexus greets teammates across different cultures and monitors.</p>
      </header>

      <Card className="round-card shadow-ambient">
        <CardHeader>
          <CardTitle>Brand color</CardTitle>
          <CardDescription>Align the interface accent with your organization&apos;s palette.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Input
            type="color"
            value={brandColor}
            onChange={(event) => setBrandColor(event.target.value)}
            aria-label="Brand accent color"
            className="h-12 w-20 round-input"
          />
          <div>
            <p className="text-sm font-semibold">{brandColor.toUpperCase()}</p>
            <p className="text-xs text-muted">Preview updates instantly across the shell.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="round-card shadow-ambient">
        <CardHeader>
          <CardTitle>Dashboard charts</CardTitle>
          <CardDescription>Select the density and visual treatment for analytics views.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {chartStyles.map((style) => {
            const active = chartStyle === style.id;
            return (
              <Button
                key={style.id}
                variant={active ? "default" : "outline"}
                className="flex h-full flex-col items-start gap-1 text-left round-card shadow-press"
                onClick={() => setChartStyle(style.id)}
              >
                <span className="text-sm font-semibold">{style.name}</span>
                <span className="text-xs text-muted">{style.description}</span>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="round-card shadow-ambient">
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>Switch the UI copy used for shared links and collaborative sessions.</CardDescription>
        </CardHeader>
        <CardContent className="max-w-xs space-y-2">
          <Label htmlFor="language-select">Primary language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language-select" className="round-input">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted">Applies to notification emails and shared workspace views.</p>
        </CardContent>
      </Card>

      <Card className="round-card shadow-ambient">
        <CardHeader>
          <CardTitle>Cookie banner</CardTitle>
          <CardDescription>Match your compliance posture with the appropriate consent UX.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {cookieOptions.map((option) => {
            const active = cookiePreference === option.id;
            return (
              <Button
                key={option.id}
                variant={active ? "default" : "outline"}
                className="flex h-full flex-col items-start gap-1 text-left round-card shadow-press"
                onClick={() => setCookiePreference(option.id)}
              >
                <span className="text-sm font-semibold">{option.name}</span>
                <span className="text-xs text-muted">{option.description}</span>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
